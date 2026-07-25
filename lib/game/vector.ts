import type { Vec } from './types';

export const ZERO: Vec = { x: 0, y: 0 };

export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scale(v: Vec, k: number): Vec {
  return { x: v.x * k, y: v.y * k };
}

export function length(v: Vec): number {
  return Math.hypot(v.x, v.y);
}

/**
 * 길이를 max로 제한한다. 이미 짧으면 그대로 둔다.
 * 대각선 입력이 축 입력보다 빨라지는 것을 막는 데도 쓴다.
 */
export function clampLength(v: Vec, max: number): Vec {
  const len = length(v);
  if (len <= max || len === 0) return v;
  return scale(v, max / len);
}

/**
 * 두 점 사이 거리가 threshold 이하인지 검사한다.
 *
 * 제곱근을 생략하고 제곱끼리 비교한다. 매 프레임 오브젝트 수만큼 호출되는
 * 경로라 Math.sqrt 한 번의 비용도 누적된다.
 */
export function isWithinDistance(a: Vec, b: Vec, threshold: number): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= threshold * threshold;
}
