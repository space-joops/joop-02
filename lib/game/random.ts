/**
 * 시드 기반 의사난수 생성기 (mulberry32).
 *
 * `Math.random`을 쓰지 않는 이유는 두 가지다.
 * 1. 스폰 로직을 테스트하려면 같은 시드에서 같은 결과가 나와야 한다.
 * 2. M5의 패스 타임 스케줄도 "매일 조금씩 밀리되 같은 날이면 같은 값"이
 *    필요하다. 같은 도구를 재사용한다.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** [min, max) 구간의 실수 */
export function randomRange(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}
