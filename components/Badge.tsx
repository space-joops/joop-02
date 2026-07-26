import type { BadgeDef } from '@/lib/game/records';
import styles from './Badge.module.css';

/**
 * 실적 배지 (design/ui/badge/ 이식).
 *
 * 티어별로 파일을 나누지 않는다 — 색만 다른 파일 3개는 토큰이 존재하는
 * 이유와 어긋난다. 티어는 부모의 `color` 로 지정하고 프레임이
 * `currentColor` 를 따른다 (design-guide.md).
 *
 * 미획득은 자물쇠가 아니라 **아직 채워지지 않은 자리**로 그린다.
 * ADR-007에 따라 잠금 해제가 구매로 이어지지 않기 때문이다 — 실적으로만 열린다.
 */
interface BadgeProps {
  badge: BadgeDef;
  earned: boolean;
}

export function Badge({ badge, earned }: BadgeProps) {
  return (
    <li className={styles.item}>
      <svg
        className={`${styles.icon} ${earned ? styles[`tier${badge.tier}`] : styles.locked}`}
        viewBox="0 0 100 100"
        role="img"
        aria-label={
          earned ? `획득한 배지: ${badge.name}` : `아직 획득하지 못한 배지: ${badge.name}`
        }
      >
        {earned ? <EarnedFrame /> : <LockedFrame />}
      </svg>
      <span className={styles.name}>{badge.name}</span>
      <span className={styles.description}>{badge.description}</span>
    </li>
  );
}

function EarnedFrame() {
  return (
    <>
      <g fill="none" stroke="currentColor" strokeLinejoin="round">
        {/* 바깥 톱니 링 */}
        <path
          d="M50 4 60 10 71 8 78 17 89 19 91 30 99 38 96 49 99 60 91 68 89 79 78 81 71 90 60 88 50 94
             40 88 29 90 22 81 11 79 9 68 1 60 4 49 1 38 9 30 11 19 22 17 29 8 40 10z"
          strokeWidth="3.5"
          opacity="0.55"
        />
        <circle cx="50" cy="50" r="36" strokeWidth="5" />
        <circle cx="50" cy="50" r="28" strokeWidth="2" opacity="0.6" />
      </g>
      <circle cx="50" cy="50" r="26" fill="var(--color-surface-raised)" />
      {/* 심볼 슬롯: 중심 (50,50) 반지름 26 안.
          개별 배지 아트는 아직 없다 — 지금은 티어 색의 코어로 채운다. */}
      <circle cx="50" cy="50" r="11" fill="currentColor" opacity="0.9" />
    </>
  );
}

function LockedFrame() {
  return (
    <>
      <circle cx="50" cy="50" r="36" fill="none" stroke="var(--color-border)" strokeWidth="5" />
      <circle cx="50" cy="50" r="26" fill="var(--color-surface)" />
      <circle
        cx="50"
        cy="50"
        r="26"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeDasharray="4 5"
      />
    </>
  );
}
