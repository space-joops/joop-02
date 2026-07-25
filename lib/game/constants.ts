import type { DebrisKind } from './types';

/**
 * 게임 필드는 논리 좌표로 다룬다. 화면 크기와 분리해 두면 기기가 달라져도
 * 게임 밸런스가 흔들리지 않고, 순수 함수를 픽셀 없이 테스트할 수 있다.
 * SVG viewBox가 이 좌표계를 화면에 매핑한다.
 */
export const FIELD = { width: 100, height: 180 } as const;

/** 세션 길이. 프로토타입은 60초 (최종 2~5분은 M5에서 결정) */
export const SESSION_SECONDS = 60;

// ── 줍스 ──

export const JUPSY_START_RADIUS = 4;

/**
 * 성장 계수. 반지름이 아니라 넓이가 질량에 비례하도록 제곱근으로 키운다.
 * 반지름에 직접 비례시키면 초반에 너무 급격히 커져서 금세 화면을 채운다.
 */
export const GROWTH_AREA_PER_KG = 1.6;

/** 조이스틱 입력 1.0일 때의 가속도 (논리 단위/초²) */
export const JUPSY_ACCEL = 260;

/**
 * 속도 감쇠 계수. 1초에 남는 속도 비율이다.
 * 0에 가까울수록 즉시 멈추고, 1에 가까울수록 미끄러진다.
 * 관성이 "느껴지되 답답하지 않은" 지점으로 조율한 값.
 */
export const JUPSY_DAMPING_PER_SECOND = 0.02;

export const JUPSY_MAX_SPEED = 70;

// ── 흡수와 성장 ──

/**
 * 흡수 가능 판정 비율. 줍스 반지름이 파편 반지름의 이 배수 이상이어야 먹는다.
 * 1.0이면 자기보다 작은 것만 먹을 수 있다. 조금 낮춰 초반 진입 장벽을 낮춘다.
 */
export const ABSORB_RADIUS_RATIO = 0.85;

/** 위험 파편에 부딪혔을 때 잃는 누적 질량 비율 */
export const HAZARD_MASS_LOSS_RATIO = 0.18;

/** 피격 후 무적 시간(초). 한 번 스친 파편에 연속으로 맞는 것을 막는다. */
export const HAZARD_INVULNERABLE_SECONDS = 0.8;

// ── 스폰 ──

export const SPAWN_INTERVAL_SECONDS = 0.45;
export const MAX_DEBRIS = 34;

/** 스폰되는 파편 중 위험 파편의 비율 */
export const HAZARD_SPAWN_RATIO = 0.24;

export const DEBRIS_DRIFT_SPEED = { min: 2, max: 9 } as const;

/**
 * 종류별 정의. 분기문 대신 이 테이블을 조회한다.
 * 종류를 추가할 때 여기에 항목을 더하면 Record 타입이 누락을 컴파일 타임에 잡는다.
 */
export const DEBRIS_KINDS: Record<
  DebrisKind,
  { radius: { min: number; max: number }; kgPerRadius: number }
> = {
  // 먹을 것: 작을수록 흔하고, 클수록 무겁다.
  safe: { radius: { min: 1.6, max: 5.2 }, kgPerRadius: 0.42 },
  // 위험 파편: 질량이 없다. 청소량으로 환산되지 않는다.
  hazard: { radius: { min: 2.2, max: 4.4 }, kgPerRadius: 0 },
};
