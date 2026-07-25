import {
  ABSORB_RADIUS_RATIO,
  GROWTH_AREA_PER_KG,
  HAZARD_MASS_LOSS_RATIO,
  JUPSY_START_RADIUS,
} from './constants';

/**
 * 누적 질량으로부터 줍스의 반지름을 구한다.
 *
 * 반지름이 아니라 **넓이**가 질량에 비례하도록 제곱근을 취한다.
 * 반지름에 직접 비례시키면 성장이 초반에 폭발해 금세 화면을 채우고,
 * 후반에는 변화가 체감되지 않는다. 넓이 비례는 이 곡선을 완만하게 만든다.
 */
export function radiusForMass(collectedKg: number): number {
  const safeMass = Math.max(0, collectedKg);
  return Math.sqrt(JUPSY_START_RADIUS ** 2 + GROWTH_AREA_PER_KG * safeMass);
}

/**
 * 줍스가 이 크기의 파편을 흡수할 수 있는지 판정한다.
 *
 * 커질수록 더 큰 것도 먹을 수 있게 된다는 규칙의 구현이다.
 * 흡수 불가한 파편은 그냥 지나친다 (패널티 없음).
 */
export function canAbsorb(jupsyRadius: number, debrisRadius: number): boolean {
  return jupsyRadius >= debrisRadius * ABSORB_RADIUS_RATIO;
}

/**
 * 위험 파편에 부딪혔을 때 남는 누적 질량.
 *
 * 게임 오버는 없다. 크기와 점수가 줄어들 뿐 판은 계속된다.
 * 음수로 내려가지 않게 막아 반지름이 NaN이 되는 것을 방지한다.
 */
export function applyHazardPenalty(collectedKg: number): number {
  return Math.max(0, collectedKg * (1 - HAZARD_MASS_LOSS_RATIO));
}
