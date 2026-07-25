import { describe, expect, it } from 'vitest';
import { createSpawner } from './spawn';
import { createRandom } from './random';
import { FIELD, MAX_DEBRIS } from './constants';

describe('createRandom', () => {
  it('같은 시드는 같은 수열을 낸다', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('다른 시드는 다른 수열을 낸다', () => {
    const a = createRandom(1);
    const b = createRandom(2);
    expect(a()).not.toBe(b());
  });

  it('0 이상 1 미만을 낸다', () => {
    const random = createRandom(7);
    for (let i = 0; i < 500; i += 1) {
      const v = random();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('createSpawner', () => {
  it('간격이 차기 전에는 아무것도 내지 않는다', () => {
    const spawner = createSpawner(1, 0.5);
    expect(spawner.next(0.2, 0)).toHaveLength(0);
  });

  it('간격이 차면 파편을 낸다', () => {
    const spawner = createSpawner(1, 0.5);
    spawner.next(0.3, 0);
    expect(spawner.next(0.3, 0)).toHaveLength(1);
  });

  it('dt가 크게 튀면 여러 개를 한 번에 낸다', () => {
    // 탭 전환 후 복귀처럼 dt가 튀어도 밀도가 유지되어야 한다.
    const spawner = createSpawner(1, 0.5);
    expect(spawner.next(2.2, 0)).toHaveLength(4);
  });

  it('상한에 도달하면 더 내지 않는다', () => {
    const spawner = createSpawner(1, 0.1);
    expect(spawner.next(5, MAX_DEBRIS)).toHaveLength(0);
  });

  it('같은 시드면 같은 파편이 나온다', () => {
    const a = createSpawner(99, 0.5);
    const b = createSpawner(99, 0.5);
    expect(a.next(3, 0)).toEqual(b.next(3, 0));
  });

  it('id가 겹치지 않는다', () => {
    const spawner = createSpawner(5, 0.1);
    const ids = spawner.next(3, 0).map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('필드 가장자리 바깥에서 시작한다', () => {
    // 화면 한가운데에 갑자기 나타나면 피할 수 없는 위험 파편이 생긴다.
    const spawner = createSpawner(3, 0.1);
    for (const d of spawner.next(6, 0)) {
      const 밖에있다 =
        d.pos.x < 0 || d.pos.x > FIELD.width || d.pos.y < 0 || d.pos.y > FIELD.height;
      expect(밖에있다).toBe(true);
    }
  });

  it('위험 파편은 질량이 0이다', () => {
    // 위험 파편이 청소량으로 환산되면 안 된다.
    const spawner = createSpawner(11, 0.05);
    const 파편들 = spawner.next(10, 0);
    for (const d of 파편들.filter((d) => d.kind === 'hazard')) {
      expect(d.massKg).toBe(0);
    }
  });

  it('먹을 것과 위험 파편이 모두 나온다', () => {
    const spawner = createSpawner(2024, 0.05);
    const 파편들 = spawner.next(20, 0);
    expect(파편들.some((d) => d.kind === 'safe')).toBe(true);
    expect(파편들.some((d) => d.kind === 'hazard')).toBe(true);
  });

  it('큰 파편일수록 무겁다', () => {
    const spawner = createSpawner(77, 0.05);
    const safe = spawner.next(20, 0).filter((d) => d.kind === 'safe');
    const 정렬됨 = [...safe].sort((a, b) => a.radius - b.radius);
    expect(정렬됨[0].massKg).toBeLessThanOrEqual(정렬됨[정렬됨.length - 1].massKg);
  });
});
