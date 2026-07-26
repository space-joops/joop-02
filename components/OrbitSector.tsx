import styles from './OrbitSector.module.css';

/**
 * 담당 궤도 구역의 정화 상태 (design/ui/orbit-sector.svg 이식).
 *
 * 확정된 보상 구조: "담당 궤도 구역이 점점 깨끗해지는(쓰레기 점이 사라지는)
 * 형태의 진행 시각화". 점 번호 순서가 곧 사라지는 순서다.
 *
 * 점을 DOM에서 제거하지 않고 opacity로 지운다. 원본 에셋 주석의 지시이기도
 * 하고, 제거하면 정화율이 오를 때마다 SVG가 재구성되어 전환을 걸 수 없다.
 */

/** 쓰레기 점 좌표. 원본 SVG의 orbit-dot-01~36 순서 그대로. */
const DOTS: readonly { cx: number; cy: number; r: number }[] = [
  { cx: 71.4, cy: 157.2, r: 3.4 },
  { cx: 166.4, cy: 132.5, r: 2.9 },
  { cx: 168.4, cy: 126.1, r: 2.3 },
  { cx: 43.5, cy: 125.0, r: 2.4 },
  { cx: 27.5, cy: 137.2, r: 2.4 },
  { cx: 112.8, cy: 175.2, r: 3.9 },
  { cx: 37.8, cy: 67.3, r: 4.0 },
  { cx: 178.8, cy: 123.8, r: 2.7 },
  { cx: 138.9, cy: 149.6, r: 2.8 },
  { cx: 126.1, cy: 40.8, r: 3.2 },
  { cx: 55.2, cy: 46.6, r: 3.2 },
  { cx: 156.8, cy: 123.7, r: 2.6 },
  { cx: 69.9, cy: 35.6, r: 2.8 },
  { cx: 38.3, cy: 63.2, r: 2.7 },
  { cx: 121.5, cy: 24.8, r: 2.6 },
  { cx: 34.3, cy: 66.8, r: 3.8 },
  { cx: 91.3, cy: 33.1, r: 4.0 },
  { cx: 152.2, cy: 147.9, r: 3.6 },
  { cx: 142.0, cy: 159.4, r: 2.3 },
  { cx: 60.7, cy: 30.4, r: 3.2 },
  { cx: 148.3, cy: 52.0, r: 3.5 },
  { cx: 37.7, cy: 58.0, r: 3.0 },
  { cx: 145.3, cy: 28.6, r: 3.1 },
  { cx: 68.4, cy: 47.2, r: 3.5 },
  { cx: 48.3, cy: 31.5, r: 3.7 },
  { cx: 84.9, cy: 168.4, r: 3.4 },
  { cx: 171.3, cy: 110.2, r: 2.5 },
  { cx: 145.6, cy: 141.3, r: 3.6 },
  { cx: 145.7, cy: 148.2, r: 2.9 },
  { cx: 142.9, cy: 55.1, r: 3.0 },
  { cx: 21.0, cy: 74.6, r: 3.7 },
  { cx: 144.1, cy: 49.3, r: 2.9 },
  { cx: 47.6, cy: 164.4, r: 3.9 },
  { cx: 137.7, cy: 152.5, r: 2.6 },
  { cx: 107.6, cy: 172.2, r: 3.3 },
  { cx: 95.2, cy: 159.9, r: 3.0 },
];

interface OrbitSectorProps {
  /** 앞에서부터 몇 개를 치웠는가 */
  clearedCount: number;
  /** 접근성 라벨에 쓸 정화율 (0~1) */
  cleanRate: number;
}

export function OrbitSector({ clearedCount, cleanRate }: OrbitSectorProps) {
  const percent = Math.round(cleanRate * 100);

  return (
    <svg
      className={styles.root}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`담당 궤도 구역 정화율 ${percent}퍼센트`}
    >
      <defs>
        <radialGradient id="orbit-core-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-eye-soft)" />
          <stop offset="60%" stopColor="var(--color-eye-deep)" />
          <stop offset="100%" stopColor="var(--color-bg-nebula)" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="96" fill="var(--color-bg-deep)" />

      {/* 담당 구역 띠 */}
      <circle
        cx="100"
        cy="100"
        r="73"
        fill="none"
        stroke="var(--color-bg-orbit)"
        strokeWidth="30"
      />
      <circle
        cx="100"
        cy="100"
        r="58"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      {/* 지구 */}
      <circle cx="100" cy="100" r="38" fill="url(#orbit-core-grad)" />
      <g fill="var(--color-shell-hi)" opacity="0.18">
        <ellipse cx="88" cy="86" rx="18" ry="6" />
        <ellipse cx="110" cy="106" rx="14" ry="5" />
        <ellipse cx="94" cy="120" rx="20" ry="6" />
      </g>

      {/* 남아 있는 우주 쓰레기 */}
      <g fill="var(--color-debris-metal)">
        {DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            className={i < clearedCount ? styles.cleared : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
