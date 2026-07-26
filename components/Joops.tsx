import type { Ref } from 'react';
import styles from './Joops.module.css';

export type JoopsMood = 'normal' | 'happy' | 'hurt' | 'heart';

interface JoopsProps {
  mood: JoopsMood;
  /**
   * 그룹 요소 참조. 게임 루프가 매 프레임 transform을 직접 갱신한다.
   * React state로 좌표를 관리하면 초당 60회 리렌더가 난다 (ADR-004).
   */
  groupRef?: Ref<SVGGElement>;
}

/**
 * 줍스 캐릭터 SVG (M3 캐릭터 비주얼 고도화 버전).
 *
 * **반지름 1 기준으로 그린다.** 실제 크기는 부모가 transform의 scale로 준다.
 * 그래서 성장할 때 도형을 다시 계산할 필요 없이 transform 하나만 바꾸면 된다.
 *
 * 원본 디자인: design/character/joops-base.svg (200x240 viewBox 기준)
 * 이 컴포넌트는 원본 디자인을 scale(0.01) translate(-100 -120) 하여
 * 반지름 1, 중심 (0,0) 계약을 유지한다.
 */
export function Joops({ mood, groupRef }: JoopsProps) {
  return (
    <g ref={groupRef} className={styles.root}>
      {/* 
        게임 엔진(rAF)은 groupRef에 transform(예: translate(x,y) scale(s))을 덮어씌운다.
        따라서 내부에서 한 겹 더 <g>를 만들어 원본 SVG의 좌표계를 (-1~1)로 정규화한다.
      */}
      <g transform="scale(0.01) translate(-100, -120)" className={styles.character} data-mood={mood}>
        <defs>
          <linearGradient id="joops-shell-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-shell-hi, #ffffff)"/>
            <stop offset="55%" stopColor="var(--color-shell, #f7faff)"/>
            <stop offset="100%" stopColor="var(--color-shell-shadow, #d3deee)"/>
          </linearGradient>

          <linearGradient id="joops-body-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-shell-hi, #ffffff)"/>
            <stop offset="60%" stopColor="var(--color-shell, #f7faff)"/>
            <stop offset="100%" stopColor="var(--color-shell-edge, #b2c1d8)"/>
          </linearGradient>

          <linearGradient id="joops-visor-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-visor-hi, #212c4a)"/>
            <stop offset="70%" stopColor="var(--color-visor, #0b1120)"/>
          </linearGradient>

          <radialGradient id="joops-core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-shell-hi, #ffffff)"/>
            <stop offset="35%" stopColor="var(--color-core, #5fe3c0)"/>
            <stop offset="100%" stopColor="var(--color-core-deep, #2fc7a4)"/>
          </radialGradient>

          <radialGradient id="joops-core-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-core, #5fe3c0)" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="var(--color-core, #5fe3c0)" stopOpacity="0"/>
          </radialGradient>

          <radialGradient id="joops-thruster-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-core, #5fe3c0)" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="var(--color-core, #5fe3c0)" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* 추진 발광 */}
        <g className={styles.thruster}>
          <ellipse cx="100" cy="224" rx="40" ry="11" fill="url(#joops-thruster-grad)"/>
        </g>

        {/* 등 가시 */}
        <g fill="var(--color-shell-deep, #8c9dba)" strokeLinejoin="round">
          <path d="M71 142 L52 135 L67 154 Z"/>
          <path d="M65 156 L46 154 L63 167 Z"/>
          <path d="M129 142 L148 135 L133 154 Z"/>
          <path d="M135 156 L154 154 L137 167 Z"/>
        </g>

        {/* 몸통 */}
        <g className={styles.body}>
          <path
            d="M100 134 C124 134 140 152 140 174 C140 198 122 216 100 216 C78 216 60 198 60 174 C60 152 76 134 100 134 Z"
            fill="url(#joops-body-grad)"/>
          <ellipse cx="82" cy="154" rx="13" ry="8" fill="var(--color-shell-hi, #ffffff)" opacity="0.8"
            transform="rotate(-28 82 154)"/>

          {/* 가슴 코어 라이트 */}
          <g className={styles.core}>
            <circle cx="100" cy="176" r="26" fill="url(#joops-core-halo)"/>
            <circle cx="100" cy="176" r="13" fill="var(--color-visor, #0b1120)" opacity="0.35"/>
            <circle cx="100" cy="176" r="11" fill="url(#joops-core-grad)"/>
          </g>
        </g>

        {/* 팔 */}
        <g className={styles.armLeft}>
          <ellipse cx="36" cy="180" rx="13" ry="20" fill="url(#joops-shell-grad)"
            transform="rotate(-14 36 180)"/>
          <ellipse cx="32" cy="170" rx="4.5" ry="6.5" fill="var(--color-shell-hi, #ffffff)" opacity="0.85"
            transform="rotate(-14 32 170)"/>
        </g>
        <g className={styles.armRight}>
          <ellipse cx="164" cy="180" rx="13" ry="20" fill="url(#joops-shell-grad)"
            transform="rotate(14 164 180)"/>
          <ellipse cx="160" cy="170" rx="4.5" ry="6.5" fill="var(--color-shell-hi, #ffffff)" opacity="0.85"
            transform="rotate(14 160 170)"/>
        </g>

        {/* 머리 */}
        <g className={styles.head}>
          {/* 센서 (고양이 귀) */}
          <g strokeLinejoin="round">
            <path d="M53 66 L64 14 L94 42 Z" fill="var(--color-shell-edge, #b2c1d8)"/>
            <path d="M147 66 L136 14 L106 42 Z" fill="var(--color-shell-edge, #b2c1d8)"/>
            <path d="M63 58 L67 27 L83 45 Z" fill="var(--color-eye-deep, #2fc6ee)" opacity="0.45"/>
            <path d="M137 58 L133 27 L117 45 Z" fill="var(--color-eye-deep, #2fc6ee)" opacity="0.45"/>
          </g>

          {/* 수염 와이어 */}
          <g fill="none" stroke="var(--color-shell-edge, #b2c1d8)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M54 86 C42 80 32 79 23 82"/>
            <path d="M55 97 C44 98 34 103 27 110"/>
            <path d="M146 86 C158 80 168 79 177 82"/>
            <path d="M145 97 C156 98 166 103 173 110"/>
          </g>
          <g fill="var(--color-eye-deep, #2fc6ee)">
            <circle cx="21" cy="82" r="3"/>
            <circle cx="25" cy="111" r="3"/>
            <circle cx="179" cy="82" r="3"/>
            <circle cx="175" cy="111" r="3"/>
          </g>

          {/* 이음새 없는 매끈한 셸 */}
          <path
            d="M100 34 C126 34 152 58 152 86 C152 110 128 126 100 126 C72 126 48 110 48 86 C48 58 74 34 100 34 Z"
            fill="url(#joops-shell-grad)"/>
          <ellipse cx="72" cy="54" rx="15" ry="9" fill="var(--color-shell-hi, #ffffff)" opacity="0.9"
            transform="rotate(-32 72 54)"/>

          {/* 바이저 */}
          <rect x="58" y="62" width="84" height="40" rx="20" fill="url(#joops-visor-grad)"/>
          <rect x="66" y="67" width="52" height="8" rx="4" fill="var(--color-shell-hi, #ffffff)"
            opacity="0.14"/>

          {/* 눈 슬롯 */}
          <g transform="translate(40 52)">
            <Eyes mood={mood} />
          </g>
        </g>
      </g>
    </g>
  );
}

function Eyes({ mood }: { mood: JoopsMood }) {
  if (mood === 'happy') {
    return (
      <>
        <g fill="none" stroke="var(--color-eye, #6fe3ff)" strokeWidth="7"
           strokeLinecap="round" strokeLinejoin="round">
          <path d="M31 35 Q42 20 53 35"/>
          <path d="M67 35 Q78 20 89 35"/>
        </g>
        <g fill="var(--color-eye-soft, #b6f4ff)" opacity="0.75">
          <circle cx="24" cy="40" r="2.6"/>
          <circle cx="96" cy="40" r="2.6"/>
        </g>
      </>
    );
  }

  if (mood === 'hurt') {
    return (
      <g fill="none" stroke="var(--color-hazard-hi, #ffa8be)" strokeWidth="6.5"
         strokeLinecap="round" strokeLinejoin="round">
        <path d="M33 21 L50 30 L33 39"/>
        <path d="M87 21 L70 30 L87 39"/>
      </g>
    );
  }

  if (mood === 'heart') {
    return (
      <>
        <g fill="var(--color-eye-joy, #ff8fb4)">
          <path transform="translate(42 30) rotate(-8)"
            d="M0 9 C-11 0 -12 -10 -5.5 -12.5 C-1.8 -14 0 -10.5 0 -8.5 C0 -10.5 1.8 -14 5.5 -12.5 C12 -10 11 0 0 9 Z"/>
          <path transform="translate(78 30) rotate(8)"
            d="M0 9 C-11 0 -12 -10 -5.5 -12.5 C-1.8 -14 0 -10.5 0 -8.5 C0 -10.5 1.8 -14 5.5 -12.5 C12 -10 11 0 0 9 Z"/>
        </g>
        <g fill="var(--color-eye-joy-soft, #ffc2d5)" opacity="0.95">
          <ellipse cx="37" cy="24" rx="2.6" ry="3.2" transform="rotate(-20 37 24)"/>
          <ellipse cx="73" cy="24" rx="2.6" ry="3.2" transform="rotate(-20 73 24)"/>
        </g>
      </>
    );
  }

  // normal
  return (
    <>
      <g fill="var(--color-eye, #6fe3ff)">
        <ellipse cx="42" cy="30" rx="9.5" ry="12"/>
        <ellipse cx="78" cy="30" rx="9.5" ry="12"/>
      </g>
      <g fill="var(--color-eye-soft, #b6f4ff)" opacity="0.9">
        <ellipse cx="39" cy="25" rx="3.4" ry="4.2"/>
        <ellipse cx="75" cy="25" rx="3.4" ry="4.2"/>
      </g>
    </>
  );
}
