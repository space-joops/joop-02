'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './Joystick.module.css';
import type { Vec } from '@/lib/game/types';

interface JoystickProps {
  /**
   * 방향과 세기를 알린다. 길이 0~1의 벡터.
   *
   * 게임 루프가 매 프레임 읽어야 하는 고빈도 값이라 콜백으로 넘긴다.
   * 부모가 이걸 state에 담으면 손가락을 움직일 때마다 리렌더가 나므로
   * ref에 담아야 한다 (ADR-004).
   */
  onChange: (input: Vec) => void;
}

/** 유휴 위치가 하단에서 얼마나 떨어지는지. 기존 고정 조이스틱의 하단 여백(--space-6)과 맞춘다. */
const IDLE_BOTTOM_INSET_REM = 2;

/**
 * 플로팅 가상 조이스틱.
 *
 * 하단 터치 영역(zone) 어디를 눌러도 그 지점이 조이스틱 중심이 된다.
 * 기존에는 화면 하단 정중앙의 작은 원을 정확히 짚어야 했는데, 정확한
 * 위치를 매번 다시 찾는 피로감(fat-finger 문제)이 있었다 (이슈 #7).
 *
 * 포인터 이벤트로 터치와 마우스를 한 코드로 처리한다. touch/mouse 계열을
 * 따로 다루면 이벤트 두 벌에 상태 동기화 문제까지 생긴다.
 *
 * 손잡이·베이스 위치는 state가 아니라 DOM을 직접 만져 갱신한다. 손가락을
 * 움직이는 동안 초당 수십 번 리렌더가 나는 것을 피하기 위함이다. 대신
 * "잡았는지" 여부만 state로 둔다 — 조작당 한 번 바뀌는 저빈도 값이다.
 */
export function Joystick({ onChange }: JoystickProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);
  const baseRadiusRef = useRef(0);
  const [active, setActive] = useState(false);

  /** 존 좌상단 기준 (x, y)로 base를 옮긴다. transform만 써서 리플로우가 없다. */
  const placeBase = useCallback((x: number, y: number) => {
    const base = baseRef.current;
    if (base) base.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  /**
   * 유휴 위치(하단 중앙)를 계산해 base를 그리로 둔다.
   *
   * 이 좌표계(존 좌상단 기준 픽셀)를 드래그 중 좌표계와 통일해뒀다. CSS의
   * `left: 50%` 같은 규칙과 JS의 픽셀 transform을 섞으면, 서로 다른
   * 기준점을 같은 속성에 겹쳐 쓰게 되어 위치 계산이 어긋난다.
   */
  const goIdle = useCallback(() => {
    const zone = zoneRef.current;
    const base = baseRef.current;
    if (!zone || !base) return;

    const r = base.getBoundingClientRect().width / 2;
    baseRadiusRef.current = r;
    const zoneRect = zone.getBoundingClientRect();
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const inset = IDLE_BOTTOM_INSET_REM * remPx;

    placeBase(zoneRect.width / 2 - r, zoneRect.height - inset - r * 2);
  }, [placeBase]);

  // 마운트 시 유휴 위치로. useLayoutEffect로 페인트 전에 자리를 잡아
  // 화면 구석(0,0)에 잠깐 나타났다 옮겨가는 것을 막는다.
  useLayoutEffect(() => {
    goIdle();
  }, [goIdle]);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    // 뷰포트가 바뀌면(모바일 주소창 접힘/펴짐 등) 유휴 위치도 다시 잡는다.
    // 드래그 중에는 손 아래에서 기준점이 튀면 안 되므로 건드리지 않는다.
    const observer = new ResizeObserver(() => {
      if (activePointerId.current === null) goIdle();
    });
    observer.observe(zone);
    return () => observer.disconnect();
  }, [goIdle]);

  const updateFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      const knob = knobRef.current;
      if (!base || !knob) return;

      const rect = base.getBoundingClientRect();
      const maxRadius = rect.width / 2;
      const dx = clientX - (rect.left + maxRadius);
      const dy = clientY - (rect.top + maxRadius);

      const distance = Math.hypot(dx, dy);
      // 스틱 범위를 벗어나도 최대 세기로 고정한다. 손가락이 멀어졌다고
      // 입력이 끊기면 조작 중 자꾸 놓치게 된다.
      const clamped = Math.min(distance, maxRadius);
      const ratio = distance === 0 ? 0 : clamped / distance;

      const offsetX = dx * ratio;
      const offsetY = dy * ratio;

      // transform만 건드려 레이아웃·페인트를 건너뛰고 컴포지팅만 발생시킨다.
      knob.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;

      onChange({ x: offsetX / maxRadius, y: offsetY / maxRadius });
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== null) return;
      activePointerId.current = event.pointerId;
      // 손가락이 조이스틱 밖으로 나가도 계속 추적한다.
      event.currentTarget.setPointerCapture(event.pointerId);

      const zone = zoneRef.current;
      const base = baseRef.current;
      if (!zone || !base) return;

      const zoneRect = zone.getBoundingClientRect();
      const r = baseRadiusRef.current || base.getBoundingClientRect().width / 2;

      // base 전체가 존 밖으로 나가지 않게 터치 지점을 클램프한다.
      const cx = Math.min(Math.max(event.clientX, zoneRect.left + r), zoneRect.right - r);
      const cy = Math.min(Math.max(event.clientY, zoneRect.top + r), zoneRect.bottom - r);

      placeBase(cx - zoneRect.left - r, cy - zoneRect.top - r);
      setActive(true);
      updateFromEvent(event.clientX, event.clientY);
    },
    [placeBase, updateFromEvent],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== event.pointerId) return;
      updateFromEvent(event.clientX, event.clientY);
    },
    [updateFromEvent],
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== event.pointerId) return;
      activePointerId.current = null;
      setActive(false);

      const knob = knobRef.current;
      if (knob) knob.style.transform = 'translate3d(0, 0, 0)';
      onChange({ x: 0, y: 0 });

      goIdle();
    },
    [onChange, goIdle],
  );

  return (
    <div
      ref={zoneRef}
      className={styles.zone}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      role="application"
      aria-label="줍스 이동 조이스틱 — 화면 하단 아무 곳이나 눌러 조작하세요"
    >
      <div
        ref={baseRef}
        className={`${styles.base} ${active ? styles.active : ''}`}
        aria-hidden="true"
      >
        <div ref={knobRef} className={styles.knob} />
      </div>
    </div>
  );
}
