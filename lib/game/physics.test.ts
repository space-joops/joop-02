import { describe, expect, it } from 'vitest';
import { clampToField, stepDebris, stepJupsy, type MotionState } from './physics';
import { FIELD, JUPSY_MAX_SPEED } from './constants';
import { length } from './vector';

const 정지상태 = (): MotionState => ({
  pos: { x: FIELD.width / 2, y: FIELD.height / 2 },
  vel: { x: 0, y: 0 },
});

/** dt만큼씩 seconds초 동안 시뮬레이션한다. */
function 시뮬레이션(
  state: MotionState,
  input: { x: number; y: number },
  seconds: number,
  dt: number,
) {
  let current = state;
  for (let t = 0; t < seconds; t += dt) {
    current = stepJupsy(current, input, dt, 4);
  }
  return current;
}

describe('stepJupsy', () => {
  it('입력이 있으면 그 방향으로 움직인다', () => {
    const 결과 = stepJupsy(정지상태(), { x: 1, y: 0 }, 1 / 60, 4);
    expect(결과.pos.x).toBeGreaterThan(FIELD.width / 2);
  });

  it('입력이 없으면 가속하지 않는다', () => {
    const 결과 = stepJupsy(정지상태(), { x: 0, y: 0 }, 1 / 60, 4);
    expect(결과.vel.x).toBe(0);
    expect(결과.vel.y).toBe(0);
  });

  it('스틱을 놓아도 관성으로 더 미끄러진다', () => {
    const 가속됨 = 시뮬레이션(정지상태(), { x: 1, y: 0 }, 0.5, 1 / 60);
    const 놓은직후 = 가속됨.pos.x;
    const 미끄러진뒤 = 시뮬레이션(가속됨, { x: 0, y: 0 }, 0.2, 1 / 60);
    expect(미끄러진뒤.pos.x).toBeGreaterThan(놓은직후);
  });

  it('결국에는 멈춘다', () => {
    const 가속됨 = 시뮬레이션(정지상태(), { x: 1, y: 0 }, 0.5, 1 / 60);
    const 오래둔뒤 = 시뮬레이션(가속됨, { x: 0, y: 0 }, 3, 1 / 60);
    expect(length(오래둔뒤.vel)).toBeLessThan(0.5);
  });

  it('최대 속도를 넘지 않는다', () => {
    const 계속가속 = 시뮬레이션(정지상태(), { x: 1, y: 1 }, 5, 1 / 60);
    expect(length(계속가속.vel)).toBeLessThanOrEqual(JUPSY_MAX_SPEED + 1e-6);
  });

  it('프레임률이 달라도 같은 시간 뒤 위치가 거의 같다', () => {
    // delta time 정규화의 핵심. 이게 깨지면 120Hz 기기에서 게임이 2배 빨라진다.
    const 육십 = 시뮬레이션(정지상태(), { x: 1, y: 0 }, 1, 1 / 60);
    const 백이십 = 시뮬레이션(정지상태(), { x: 1, y: 0 }, 1, 1 / 120);
    expect(백이십.pos.x).toBeCloseTo(육십.pos.x, 0);
  });
});

describe('clampToField', () => {
  it('왼쪽 벽을 넘지 않는다', () => {
    const 결과 = clampToField({ pos: { x: -10, y: 50 }, vel: { x: -30, y: 0 } }, 4);
    expect(결과.pos.x).toBe(4);
  });

  it('벽에 닿으면 그 축의 속도를 0으로 만든다', () => {
    // 속도를 남겨두면 벽에 붙어 속도가 쌓였다가 반대로 꺾는 순간 튕겨나간다.
    const 결과 = clampToField({ pos: { x: -10, y: 50 }, vel: { x: -30, y: 12 } }, 4);
    expect(결과.vel.x).toBe(0);
    expect(결과.vel.y).toBe(12);
  });

  it('반지름이 커지면 더 일찍 막힌다', () => {
    const 작을때 = clampToField({ pos: { x: 0, y: 50 }, vel: { x: 0, y: 0 } }, 4);
    const 클때 = clampToField({ pos: { x: 0, y: 50 }, vel: { x: 0, y: 0 } }, 12);
    expect(클때.pos.x).toBeGreaterThan(작을때.pos.x);
  });

  it('필드 안에 있으면 아무것도 바꾸지 않는다', () => {
    const 원본 = { pos: { x: 50, y: 90 }, vel: { x: 3, y: -2 } };
    expect(clampToField(원본, 4)).toEqual(원본);
  });
});

describe('stepDebris', () => {
  it('속도만큼 이동한다', () => {
    const 결과 = stepDebris({ pos: { x: 50, y: 50 }, vel: { x: 10, y: 0 } }, 1, 3);
    expect(결과.pos.x).toBeCloseTo(60);
  });

  it('오른쪽으로 벗어나면 왼쪽에서 다시 들어온다', () => {
    const 결과 = stepDebris({ pos: { x: FIELD.width + 10, y: 50 }, vel: { x: 5, y: 0 } }, 0.1, 3);
    expect(결과.pos.x).toBeLessThan(0);
  });

  it('아래로 벗어나면 위에서 다시 들어온다', () => {
    const 결과 = stepDebris({ pos: { x: 50, y: FIELD.height + 10 }, vel: { x: 0, y: 5 } }, 0.1, 3);
    expect(결과.pos.y).toBeLessThan(0);
  });

  it('감싸도 속도는 유지된다', () => {
    const 결과 = stepDebris({ pos: { x: -20, y: 50 }, vel: { x: -5, y: 2 } }, 0.1, 3);
    expect(결과.vel).toEqual({ x: -5, y: 2 });
  });
});
