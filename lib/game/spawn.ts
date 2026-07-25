import {
  DEBRIS_DRIFT_SPEED,
  DEBRIS_KINDS,
  FIELD,
  HAZARD_SPAWN_RATIO,
  MAX_DEBRIS,
} from './constants';
import { createRandom, randomRange } from './random';
import type { Debris, DebrisKind } from './types';

/**
 * 스포너. 세션 하나가 소유하는 상태 덩어리다.
 *
 * 난수 생성기와 id 카운터를 안에 가둬서, 밖에서는 "시간을 흘려보내면
 * 파편이 나온다"로만 다루면 되게 했다.
 */
export interface Spawner {
  next: (elapsedDelta: number, currentCount: number) => Debris[];
}

export function createSpawner(seed: number, intervalSeconds: number): Spawner {
  const random = createRandom(seed);
  let nextId = 1;
  let sinceLastSpawn = 0;

  return {
    next(elapsedDelta, currentCount) {
      sinceLastSpawn += elapsedDelta;
      const spawned: Debris[] = [];

      // while로 도는 이유: 탭 전환 등으로 dt가 크게 튀면 한 프레임에
      // 여러 개가 나와야 밀도가 유지된다.
      while (sinceLastSpawn >= intervalSeconds) {
        sinceLastSpawn -= intervalSeconds;
        if (currentCount + spawned.length >= MAX_DEBRIS) continue;
        spawned.push(createDebris(nextId++, random));
      }

      return spawned;
    },
  };
}

function createDebris(id: number, random: () => number): Debris {
  const kind: DebrisKind = random() < HAZARD_SPAWN_RATIO ? 'hazard' : 'safe';
  const spec = DEBRIS_KINDS[kind];
  const radius = randomRange(random, spec.radius.min, spec.radius.max);

  const speed = randomRange(random, DEBRIS_DRIFT_SPEED.min, DEBRIS_DRIFT_SPEED.max);
  const angle = random() * Math.PI * 2;

  return {
    id,
    kind,
    pos: spawnPosition(random, radius),
    vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
    radius,
    // 질량은 반지름에 비례한다. 큰 걸 먹을수록 많이 치운 셈이 되도록.
    massKg: radius * spec.kgPerRadius,
    shapeSeed: Math.floor(random() * 1000),
  };
}

/**
 * 필드 가장자리 바로 바깥에서 시작한다.
 *
 * 화면 한가운데에 파편이 갑자기 나타나면 피할 수 없는 위험 파편이 생긴다.
 * 밖에서 흘러들어오게 해야 플레이어가 반응할 시간이 생긴다.
 */
function spawnPosition(random: () => number, radius: number): { x: number; y: number } {
  const margin = radius * 2;
  const edge = Math.floor(random() * 4);

  switch (edge) {
    case 0:
      return { x: randomRange(random, 0, FIELD.width), y: -margin };
    case 1:
      return { x: FIELD.width + margin, y: randomRange(random, 0, FIELD.height) };
    case 2:
      return { x: randomRange(random, 0, FIELD.width), y: FIELD.height + margin };
    default:
      return { x: -margin, y: randomRange(random, 0, FIELD.height) };
  }
}
