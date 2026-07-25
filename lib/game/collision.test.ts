import { describe, expect, it } from 'vitest';
import { isTouching, resolveContacts } from './collision';
import { canAbsorb } from './growth';
import type { Debris, DebrisKind, Jupsy } from './types';

const 줍스 = (x: number, y: number, radius = 6): Jupsy => ({
  pos: { x, y },
  vel: { x: 0, y: 0 },
  radius,
});

let 다음id = 1;
const 파편 = (x: number, y: number, radius: number, kind: DebrisKind = 'safe'): Debris => ({
  id: 다음id++,
  kind,
  pos: { x, y },
  vel: { x: 0, y: 0 },
  radius,
  massKg: kind === 'safe' ? radius : 0,
  shapeSeed: 0,
});

describe('isTouching', () => {
  it('겹치면 접촉이다', () => {
    expect(isTouching(줍스(50, 50), 파편(52, 50, 3))).toBe(true);
  });

  it('멀리 떨어져 있으면 접촉이 아니다', () => {
    expect(isTouching(줍스(50, 50), 파편(90, 50, 3))).toBe(false);
  });

  it('반지름 합과 정확히 같은 거리는 접촉으로 본다', () => {
    // 6 + 3 = 9만큼 떨어진 지점
    expect(isTouching(줍스(50, 50), 파편(59, 50, 3))).toBe(true);
  });

  it('반지름 합보다 아주 조금 멀면 접촉이 아니다', () => {
    expect(isTouching(줍스(50, 50), 파편(59.01, 50, 3))).toBe(false);
  });
});

describe('resolveContacts', () => {
  it('닿은 작은 파편을 흡수한다', () => {
    const 대상 = 파편(52, 50, 2);
    const 결과 = resolveContacts(줍스(50, 50), [대상], canAbsorb, false);
    expect(결과.absorbed).toEqual([대상.id]);
    expect(결과.hazardHit).toBeNull();
  });

  it('닿지 않은 파편은 흡수하지 않는다', () => {
    const 결과 = resolveContacts(줍스(50, 50), [파편(90, 90, 2)], canAbsorb, false);
    expect(결과.absorbed).toEqual([]);
  });

  it('여러 개를 동시에 흡수할 수 있다', () => {
    const 결과 = resolveContacts(
      줍스(50, 50),
      [파편(52, 50, 2), 파편(48, 51, 2)],
      canAbsorb,
      false,
    );
    expect(결과.absorbed).toHaveLength(2);
  });

  it('너무 큰 파편은 닿아도 흡수하지 않고 패널티도 없다', () => {
    const 결과 = resolveContacts(줍스(50, 50, 3), [파편(52, 50, 20)], canAbsorb, false);
    expect(결과.absorbed).toEqual([]);
    expect(결과.hazardHit).toBeNull();
  });

  it('위험 파편에 닿으면 피격으로 잡힌다', () => {
    const 위험 = 파편(52, 50, 3, 'hazard');
    const 결과 = resolveContacts(줍스(50, 50), [위험], canAbsorb, false);
    expect(결과.hazardHit).toBe(위험.id);
    expect(결과.absorbed).toEqual([]);
  });

  it('무적 시간 중에는 위험 파편을 무시한다', () => {
    const 결과 = resolveContacts(줍스(50, 50), [파편(52, 50, 3, 'hazard')], canAbsorb, true);
    expect(결과.hazardHit).toBeNull();
  });

  it('위험 파편 여러 개에 동시에 닿아도 한 번만 친다', () => {
    // 곱절로 들어가면 스치기만 해도 누적 질량이 급감해 체감이 가혹해진다.
    const 결과 = resolveContacts(
      줍스(50, 50),
      [파편(52, 50, 3, 'hazard'), 파편(48, 50, 3, 'hazard'), 파편(50, 52, 3, 'hazard')],
      canAbsorb,
      false,
    );
    expect(결과.hazardHit).not.toBeNull();
  });

  it('흡수와 피격이 같은 프레임에 함께 일어날 수 있다', () => {
    const 먹이 = 파편(52, 50, 2);
    const 위험 = 파편(48, 50, 3, 'hazard');
    const 결과 = resolveContacts(줍스(50, 50), [먹이, 위험], canAbsorb, false);
    expect(결과.absorbed).toEqual([먹이.id]);
    expect(결과.hazardHit).toBe(위험.id);
  });
});
