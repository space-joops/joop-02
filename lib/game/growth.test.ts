import { describe, expect, it } from 'vitest';
import { applyHazardPenalty, canAbsorb, radiusForMass } from './growth';
import { ABSORB_RADIUS_RATIO, JUPSY_START_RADIUS } from './constants';

describe('radiusForMass', () => {
  it('아무것도 먹지 않았으면 시작 반지름이다', () => {
    expect(radiusForMass(0)).toBe(JUPSY_START_RADIUS);
  });

  it('질량이 늘면 반지름도 커진다', () => {
    expect(radiusForMass(10)).toBeGreaterThan(radiusForMass(0));
    expect(radiusForMass(50)).toBeGreaterThan(radiusForMass(10));
  });

  it('넓이가 질량에 비례하므로 성장은 점점 완만해진다', () => {
    // 같은 10kg를 먹어도 나중에 먹을수록 반지름 증가폭이 작아야 한다.
    const 초반증가 = radiusForMass(10) - radiusForMass(0);
    const 후반증가 = radiusForMass(110) - radiusForMass(100);
    expect(후반증가).toBeLessThan(초반증가);
  });

  it('음수 질량이 들어와도 NaN을 만들지 않는다', () => {
    // 위험 파편 패널티 계산이 어긋나 음수가 흘러들어와도
    // 반지름은 유효한 값이어야 한다. NaN이면 렌더가 통째로 깨진다.
    expect(radiusForMass(-5)).toBe(JUPSY_START_RADIUS);
  });
});

describe('canAbsorb', () => {
  it('자기보다 충분히 작은 파편은 먹는다', () => {
    expect(canAbsorb(10, 4)).toBe(true);
  });

  it('자기보다 훨씬 큰 파편은 먹지 못한다', () => {
    expect(canAbsorb(4, 20)).toBe(false);
  });

  it('경계값에서는 흡수 가능하다', () => {
    const 파편반지름 = 10;
    expect(canAbsorb(파편반지름 * ABSORB_RADIUS_RATIO, 파편반지름)).toBe(true);
  });

  it('경계 바로 아래에서는 흡수하지 못한다', () => {
    const 파편반지름 = 10;
    expect(canAbsorb(파편반지름 * ABSORB_RADIUS_RATIO - 0.001, 파편반지름)).toBe(false);
  });

  it('성장하면 이전에 못 먹던 파편을 먹게 된다', () => {
    const 큰파편 = 8;
    expect(canAbsorb(radiusForMass(0), 큰파편)).toBe(false);
    expect(canAbsorb(radiusForMass(40), 큰파편)).toBe(true);
  });
});

describe('applyHazardPenalty', () => {
  it('누적 질량이 줄어든다', () => {
    expect(applyHazardPenalty(100)).toBeLessThan(100);
  });

  it('0 아래로 내려가지 않는다', () => {
    expect(applyHazardPenalty(0)).toBe(0);
    expect(applyHazardPenalty(0.0001)).toBeGreaterThanOrEqual(0);
  });

  it('여러 번 맞아도 0에 수렴할 뿐 음수가 되지 않는다', () => {
    // 게임 오버가 없으므로 계속 맞는 상황이 실제로 발생한다.
    let mass = 50;
    for (let i = 0; i < 100; i += 1) mass = applyHazardPenalty(mass);
    expect(mass).toBeGreaterThanOrEqual(0);
    expect(mass).toBeLessThan(0.01);
  });
});
