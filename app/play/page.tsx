'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { Joystick } from '@/components/Joystick';
import { Joops, type JoopsMood } from '@/components/Joops';
import { useGameLoop } from '@/lib/useGameLoop';
import { resolveContacts } from '@/lib/game/collision';
import {
  FIELD,
  HAZARD_INVULNERABLE_SECONDS,
  SESSION_SECONDS,
  SPAWN_INTERVAL_SECONDS,
} from '@/lib/game/constants';
import { formatMass, formatTime } from '@/lib/game/format';
import { applyHazardPenalty, canAbsorb, radiusForMass } from '@/lib/game/growth';
import { stepDebris, stepJoops } from '@/lib/game/physics';
import { createSpawner } from '@/lib/game/spawn';
import { saveSession, type Records } from '@/lib/storage';
import type { Debris, SessionResult, Vec } from '@/lib/game/types';
import styles from './page.module.css';

type Phase = 'playing' | 'ended';

/** 표정이 원래대로 돌아오기까지의 시간(초) */
const MOOD_HOLD_SECONDS = 0.6;

export default function PlayPage() {
  /*
   * 상태를 두 부류로 나눈다 (ADR-004).
   *
   * 고빈도(매 프레임 바뀜) → ref + DOM 직접 조작
   *   좌표, 속도, 누적 질량, 파편 위치, 조이스틱 입력
   * 저빈도(초당 몇 번 이하) → useState
   *   페이즈, 표정, 남은 초, 파편 목록의 "구성"
   *
   * 좌표를 state에 두면 초당 60회 리렌더가 나서 60fps가 무너진다.
   */
  const joopsMotion = useRef({
    pos: { x: FIELD.width / 2, y: FIELD.height / 2 },
    vel: { x: 0, y: 0 },
  });
  const collectedKg = useRef(0);
  const absorbedCount = useRef(0);
  const hazardHits = useRef(0);
  const input = useRef<Vec>({ x: 0, y: 0 });
  const invulnerableFor = useRef(0);
  const moodHold = useRef(0);
  const elapsed = useRef(0);

  /*
   * 파편 목록은 두 벌로 관리한다.
   *
   * - rosterRef: 게임 루프가 매 프레임 읽고 쓰는 원본
   * - roster(state): 렌더가 읽는 것. 목록의 "구성"이 바뀔 때만 갱신한다
   *
   * 렌더에서 ref를 읽는 것은 React 순수성 규칙 위반이라 이렇게 나눈다.
   * 위치는 매 프레임 바뀌지만 그건 DOM으로 직접 그리므로 state를 건드리지
   * 않는다. React가 다시 그리는 건 파편이 생기거나 사라질 때뿐이다.
   */
  const rosterRef = useRef<Debris[]>([]);
  const [roster, setRoster] = useState<Debris[]>([]);

  // 스포너는 Date.now()를 쓰므로 렌더 중에 만들 수 없다 (순수성 규칙).
  // 루프 첫 프레임에서 지연 생성한다.
  const spawnerRef = useRef<ReturnType<typeof createSpawner> | null>(null);

  /** 마지막으로 화면에 반영한 남은 초. 정수가 바뀔 때만 리렌더한다. */
  const shownSecond = useRef(SESSION_SECONDS);

  /** 세션 결과를 이미 저장했는가. 중복 누적 방지. */
  const saved = useRef(false);

  // DOM 참조 레지스트리. 파편 id → SVG 그룹.
  const debrisNodes = useRef(new Map<number, SVGGElement>());
  const joopsNode = useRef<SVGGElement>(null);
  const massNode = useRef<HTMLParagraphElement>(null);

  const [phase, setPhase] = useState<Phase>('playing');
  const [mood, setMood] = useState<JoopsMood>('normal');
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [records, setRecords] = useState<Records | null>(null);

  const registerDebrisNode = useCallback((id: number, node: SVGGElement | null) => {
    if (node) debrisNodes.current.set(id, node);
    else debrisNodes.current.delete(id);
  }, []);

  const handleInput = useCallback((next: Vec) => {
    // state가 아니라 ref에 담는다. 손가락이 움직일 때마다 리렌더가 나면 안 된다.
    input.current = next;
  }, []);

  const tick = useCallback((dt: number) => {
    elapsed.current += dt;
    // 렌더 밖(rAF 콜백)이므로 여기서 만들어도 순수성 규칙에 걸리지 않는다.
    spawnerRef.current ??= createSpawner(Date.now() >>> 0, SPAWN_INTERVAL_SECONDS);

    // ── 타이머 ──
    const left = SESSION_SECONDS - elapsed.current;
    if (left <= 0) {
      /*
       * 저장은 한 번만.
       *
       * setPhase가 반영되기 전에 rAF가 한 프레임 더 돌 수 있다. 가드가
       * 없으면 같은 세션이 두 번 누적된다 — 실적이 곧 보상인 게임에서
       * 조용히 틀린 값이 쌓이는 건 치명적이다.
       */
      if (!saved.current) {
        saved.current = true;
        const result: SessionResult = {
          collectedKg: collectedKg.current,
          absorbedCount: absorbedCount.current,
          hazardHits: hazardHits.current,
        };
        setResult(result);
        setRecords(saveSession(result));
      }
      setPhase('ended');
      return;
    }

    /*
     * 남은 시간은 정수가 바뀔 때만 state에 반영한다.
     *
     * 매 프레임 setRemaining(left)를 부르면 float이 계속 달라져 React가
     * 초당 60회 리렌더한다. 화면에 보이는 건 어차피 초 단위다.
     * 세션 전체로 60번만 리렌더하면 된다.
     */
    const second = Math.ceil(left);
    if (second !== shownSecond.current) {
      shownSecond.current = second;
      setRemaining(second);
    }

    // ── 줍스 이동 ──
    const radius = radiusForMass(collectedKg.current);
    joopsMotion.current = stepJoops(joopsMotion.current, input.current, dt, radius);

    // ── 파편 이동 ──
    let current = rosterRef.current;
    for (const debris of current) {
      const moved = stepDebris({ pos: debris.pos, vel: debris.vel }, dt, debris.radius);
      debris.pos = moved.pos;
    }

    // ── 스폰 ──
    const spawned = spawnerRef.current.next(dt, current.length);

    // ── 충돌 ──
    invulnerableFor.current = Math.max(0, invulnerableFor.current - dt);
    const contacts = resolveContacts(
      { ...joopsMotion.current, radius },
      current,
      canAbsorb,
      invulnerableFor.current > 0,
    );

    let rosterChanged = spawned.length > 0;

    if (contacts.absorbed.length > 0) {
      const absorbedSet = new Set(contacts.absorbed);
      for (const debris of current) {
        if (absorbedSet.has(debris.id)) collectedKg.current += debris.massKg;
      }
      absorbedCount.current += contacts.absorbed.length;
      current = current.filter((d) => !absorbedSet.has(d.id));
      rosterChanged = true;
      setMood('happy');
      moodHold.current = MOOD_HOLD_SECONDS;
    }

    if (contacts.hazardHit !== null) {
      collectedKg.current = applyHazardPenalty(collectedKg.current);
      hazardHits.current += 1;
      invulnerableFor.current = HAZARD_INVULNERABLE_SECONDS;
      setMood('hurt');
      moodHold.current = MOOD_HOLD_SECONDS;
    }

    if (spawned.length > 0) current = current.concat(spawned);
    if (rosterChanged) {
      rosterRef.current = current;
      // 렌더가 읽는 쪽도 맞춰준다. 목록 구성이 바뀔 때만이라 초당 두어 번이다.
      setRoster(current);
    }

    // ── 표정 복귀 ──
    if (moodHold.current > 0) {
      moodHold.current -= dt;
      if (moodHold.current <= 0) setMood('normal');
    }

    // ── 그리기: React를 거치지 않고 DOM을 직접 갱신한다 ──
    const nextRadius = radiusForMass(collectedKg.current);
    if (joopsNode.current) {
      const { x, y } = joopsMotion.current.pos;
      joopsNode.current.setAttribute('transform', `translate(${x} ${y}) scale(${nextRadius})`);
      joopsNode.current.style.opacity = invulnerableFor.current > 0 ? '0.55' : '1';
    }
    for (const debris of current) {
      const node = debrisNodes.current.get(debris.id);
      if (node) {
        node.setAttribute(
          'transform',
          `translate(${debris.pos.x} ${debris.pos.y}) scale(${debris.radius})`,
        );
      }
    }
    if (massNode.current) {
      massNode.current.textContent = formatMass(collectedKg.current);
    }
  }, []);

  useGameLoop(tick, phase === 'playing');

  return (
    <div className={styles.screen}>
      <header className={styles.hud}>
        <div className={styles.hudBlock}>
          <span className={styles.hudLabel}>청소량</span>
          <p ref={massNode} className={styles.hudValue}>
            {formatMass(0)}
          </p>
        </div>
        <div className={`${styles.hudBlock} ${styles.hudRight}`}>
          <span className={styles.hudLabel}>통신 남은 시간</span>
          <p className={styles.hudValue}>{formatTime(remaining)}</p>
        </div>
      </header>

      <div className={styles.stage}>
        <svg
          className={styles.field}
          viewBox={`0 0 ${FIELD.width} ${FIELD.height}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label="궤도 청소 화면"
        >
          <g>
            {roster.map((debris) => (
              <DebrisShape key={debris.id} debris={debris} register={registerDebrisNode} />
            ))}
          </g>
          <Joops mood={mood} groupRef={joopsNode} />
        </svg>
      </div>

      {/* 조이스틱은 자체 터치 영역(하단 절반)을 절대 위치로 겹쳐 그린다.
          별도 레이아웃 행(옛 footer)을 차지하지 않아 게임 필드가 그 뒤로
          그대로 보인다 (이슈 #7 — 플로팅 조이스틱). */}
      <div className={styles.joystickZone}>
        <Joystick onChange={handleInput} />
      </div>

      {phase === 'ended' && result && <SessionSummary result={result} records={records} />}
    </div>
  );
}

/**
 * 파편 하나.
 *
 * 반지름 1 기준으로 그리고 부모가 scale로 실제 크기를 준다. 그래서 매 프레임
 * 갱신이 transform 속성 하나 쓰기로 끝난다.
 *
 * 먹을 것은 둥글고, 위험한 것은 뾰족하다. 색만으로 구분하면 색각 이상
 * 사용자가 판별할 수 없으므로 형태로도 구분한다.
 */
function DebrisShape({
  debris,
  register,
}: {
  debris: Debris;
  register: (id: number, node: SVGGElement | null) => void;
}) {
  const isHazard = debris.kind === 'hazard';
  // 같은 파편은 항상 같은 모양이 되도록 시드로 각도를 정한다.
  const rotation = debris.shapeSeed % 360;

  return (
    <g
      ref={(node) => register(debris.id, node)}
      transform={`translate(${debris.pos.x} ${debris.pos.y}) scale(${debris.radius})`}
      className={isHazard ? styles.hazard : styles.safe}
    >
      {isHazard ? (
        <path
          d="M 0 -1 L 0.3 -0.3 L 1 0 L 0.3 0.3 L 0 1 L -0.3 0.3 L -1 0 L -0.3 -0.3 Z"
          transform={`rotate(${rotation})`}
        />
      ) : (
        <circle cx="0" cy="0" r="1" />
      )}
    </g>
  );
}

/** 통신이 끊기고 결과를 정리해 보여준다. */
function SessionSummary({ result, records }: { result: SessionResult; records: Records | null }) {
  return (
    <div className={styles.summary} role="dialog" aria-label="세션 결과">
      <div className={styles.summaryCard}>
        <p className={styles.summarySignal}>신호가 끊겼어요</p>
        <h2 className={styles.summaryTitle}>{formatMass(result.collectedKg)}</h2>
        <p className={styles.summaryCaption}>이번 통신에서 함께 치운 양</p>

        <dl className={styles.summaryStats}>
          <div>
            <dt>흡수한 쓰레기</dt>
            <dd>{result.absorbedCount}개</dd>
          </div>
          <div>
            <dt>부딪힌 파편</dt>
            <dd>{result.hazardHits}번</dd>
          </div>
        </dl>

        {records && (
          <p className={styles.summaryTotal}>
            지금까지 <strong>{formatMass(records.totalKg)}</strong> · 교신 {records.sessions}회
          </p>
        )}

        <div className={styles.summaryActions}>
          <Link href="/profile" className={styles.summaryButton}>
            기록 보기
          </Link>
          <Link href="/" className={styles.summaryButtonGhost}>
            돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
