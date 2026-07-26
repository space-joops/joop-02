import type { Debris, Joops } from './types';
import { isWithinDistance } from './vector';

/**
 * 줍스와 파편이 닿았는지 판정한다.
 *
 * 두 원의 중심 거리가 반지름 합 이하이면 접촉이다.
 * 제곱근 없이 제곱끼리 비교한다 (vector.isWithinDistance 참고).
 */
export function isTouching(joops: Joops, debris: Debris): boolean {
  return isWithinDistance(joops.pos, debris.pos, joops.radius + debris.radius);
}

export interface ContactResult {
  /** 흡수된 파편 id */
  absorbed: number[];
  /** 부딪힌 위험 파편 id. 무적 시간 중이면 비어 있다. */
  hazardHit: number | null;
}

/**
 * 이번 프레임의 접촉을 한 번에 판정한다.
 *
 * 흡수는 여러 개가 동시에 일어날 수 있지만 위험 파편 피격은 프레임당 한 번만
 * 친다. 여러 파편에 동시에 스치면 패널티가 곱절로 들어가 체감이 가혹해진다.
 *
 * @param canAbsorbDebris 크기 조건을 판정하는 함수. growth.canAbsorb를 주입해
 *   충돌 판정이 성장 규칙을 직접 알지 않게 한다.
 * @param invulnerable 무적 시간 중이면 위험 파편을 무시한다
 */
export function resolveContacts(
  joops: Joops,
  debrisList: readonly Debris[],
  canAbsorbDebris: (joopsRadius: number, debrisRadius: number) => boolean,
  invulnerable: boolean,
): ContactResult {
  const absorbed: number[] = [];
  let hazardHit: number | null = null;

  for (const debris of debrisList) {
    if (!isTouching(joops, debris)) continue;

    if (debris.kind === 'hazard') {
      if (!invulnerable && hazardHit === null) hazardHit = debris.id;
      continue;
    }

    // 아직 작아서 못 먹는 파편은 그냥 지나친다. 패널티는 없다.
    if (canAbsorbDebris(joops.radius, debris.radius)) absorbed.push(debris.id);
  }

  return { absorbed, hazardHit };
}
