import type { Ref } from 'react';
import styles from './Jupsy.module.css';

export type JupsyMood = 'normal' | 'happy' | 'hurt';

interface JupsyProps {
  mood: JupsyMood;
  /**
   * 그룹 요소 참조. 게임 루프가 매 프레임 transform을 직접 갱신한다.
   * React state로 좌표를 관리하면 초당 60회 리렌더가 난다 (ADR-004).
   */
  groupRef?: Ref<SVGGElement>;
}

/**
 * 줍스 캐릭터 SVG (M1 프로토타입 버전).
 *
 * **반지름 1 기준으로 그린다.** 실제 크기는 부모가 transform의 scale로 준다.
 * 그래서 성장할 때 도형을 다시 계산할 필요 없이 transform 하나만 바꾸면 된다.
 *
 * 확정된 디자인(이음새 없는 흰 셸, 분리되어 떠 있는 팔, 발광 바이저)의
 * 고퀄리티 구현은 M3에서 한다. 여기서는 표정 교체가 눈 도형만 바꾸는
 * 구조로 성립하는지까지만 세운다.
 */
export function Jupsy({ mood, groupRef }: JupsyProps) {
  return (
    <g ref={groupRef} className={styles.root}>
      {/* 몸통 */}
      <ellipse cx="0" cy="0" rx="1" ry="1.05" className={styles.shell} />

      {/* 고양이 귀 형태의 짧은 센서 */}
      <path d="M -0.62 -0.78 L -0.42 -1.22 L -0.14 -0.9 Z" className={styles.ear} />
      <path d="M 0.62 -0.78 L 0.42 -1.22 L 0.14 -0.9 Z" className={styles.ear} />

      {/* 바이저. 하나의 디스플레이로 취급한다 — 표정은 이 위의 눈만 바꾼다. */}
      <ellipse cx="0" cy="-0.12" rx="0.72" ry="0.46" className={styles.visor} />

      <Eyes mood={mood} />

      {/* 가슴 코어 라이트 */}
      <circle cx="0" cy="0.58" r="0.16" className={styles.core} />
    </g>
  );
}

/**
 * 표정. 바이저 위의 눈 도형만 교체한다.
 *
 * 몸통 구조를 건드리지 않으므로 표정 추가는 여기 분기 하나를 더하는 일이 된다.
 * M3에서 표정이 늘어나도 이 경계는 그대로 쓴다.
 */
function Eyes({ mood }: { mood: JupsyMood }) {
  if (mood === 'happy') {
    // 좋아하는 걸 먹으면 눈이 하트가 된다.
    return (
      <g className={styles.eye}>
        <path d="M -0.34 -0.18 a 0.1 0.1 0 0 1 0.18 -0.06 a 0.1 0.1 0 0 1 0.18 0.06 q 0 0.12 -0.18 0.22 q -0.18 -0.1 -0.18 -0.22 z" />
        <path d="M 0.02 -0.18 a 0.1 0.1 0 0 1 0.18 -0.06 a 0.1 0.1 0 0 1 0.18 0.06 q 0 0.12 -0.18 0.22 q -0.18 -0.1 -0.18 -0.22 z" />
      </g>
    );
  }

  if (mood === 'hurt') {
    // 찡그린 눈
    return (
      <g className={styles.eye} strokeWidth="0.09" strokeLinecap="round">
        <line x1="-0.36" y1="-0.24" x2="-0.16" y2="-0.06" />
        <line x1="-0.36" y1="-0.06" x2="-0.16" y2="-0.24" />
        <line x1="0.16" y1="-0.24" x2="0.36" y2="-0.06" />
        <line x1="0.16" y1="-0.06" x2="0.36" y2="-0.24" />
      </g>
    );
  }

  return (
    <g className={styles.eye}>
      <ellipse cx="-0.26" cy="-0.14" rx="0.11" ry="0.15" />
      <ellipse cx="0.26" cy="-0.14" rx="0.11" ry="0.15" />
    </g>
  );
}
