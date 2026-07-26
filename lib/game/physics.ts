import { FIELD, JUPSY_ACCEL, JUPSY_DAMPING_PER_SECOND, JUPSY_MAX_SPEED } from './constants';
import type { Vec } from './types';
import { clampLength } from './vector';

/**
 * 감쇠를 delta time에 맞춰 보정한다.
 *
 * 프레임마다 `vel *= 0.9`처럼 곱하면 감쇠량이 프레임률에 좌우된다.
 * 120Hz 기기는 60Hz의 두 배로 감쇠해 같은 조작이 다르게 느껴진다.
 * "1초에 남는 비율"을 dt승으로 환산하면 프레임률과 무관해진다.
 */
function dampingFactor(dt: number): number {
  return JUPSY_DAMPING_PER_SECOND ** dt;
}

export interface MotionState {
  pos: Vec;
  vel: Vec;
}

/**
 * 조이스틱 입력을 받아 한 프레임만큼 줍스를 움직인다.
 *
 * 입력은 가속도로 들어가고 속도에는 감쇠가 걸린다. 그래서 스틱을 놓아도
 * 즉시 멈추지 않고 미끄러진다 — 이것이 요구된 "관성"이다.
 *
 * @param input 조이스틱 방향과 세기. 길이 0~1
 * @param dt 이전 프레임과의 시간 차(초)
 * @param radius 경계 판정에 쓰는 줍스 반지름
 */
export function stepJoops(state: MotionState, input: Vec, dt: number, radius: number): MotionState {
  const accelerated: Vec = {
    x: state.vel.x + input.x * JUPSY_ACCEL * dt,
    y: state.vel.y + input.y * JUPSY_ACCEL * dt,
  };

  const damped = clampLength(
    { x: accelerated.x * dampingFactor(dt), y: accelerated.y * dampingFactor(dt) },
    JUPSY_MAX_SPEED,
  );

  return clampToField(
    { pos: { x: state.pos.x + damped.x * dt, y: state.pos.y + damped.y * dt }, vel: damped },
    radius,
  );
}

/**
 * 필드 밖으로 나가지 못하게 막는다.
 *
 * 벽에 닿으면 해당 축의 속도를 0으로 만든다. 그러지 않으면 벽에 붙은 채로
 * 속도가 계속 쌓여 있다가 반대로 스틱을 꺾는 순간 튕겨나간다.
 */
export function clampToField(state: MotionState, radius: number): MotionState {
  let { x, y } = state.pos;
  let { x: vx, y: vy } = state.vel;

  const minX = radius;
  const maxX = FIELD.width - radius;
  const minY = radius;
  const maxY = FIELD.height - radius;

  if (x < minX) {
    x = minX;
    vx = 0;
  } else if (x > maxX) {
    x = maxX;
    vx = 0;
  }

  if (y < minY) {
    y = minY;
    vy = 0;
  } else if (y > maxY) {
    y = maxY;
    vy = 0;
  }

  return { pos: { x, y }, vel: { x: vx, y: vy } };
}

/**
 * 파편을 표류시킨다. 필드를 벗어나면 반대편에서 다시 들어온다.
 *
 * 화면 밖에서 사라지게 하면 시야 가장자리가 비어 보이고 스폰 부담도 커진다.
 * 감싸기(wrap)로 처리해 항상 일정한 밀도를 유지한다.
 */
export function stepDebris(state: MotionState, dt: number, radius: number): MotionState {
  let x = state.pos.x + state.vel.x * dt;
  let y = state.pos.y + state.vel.y * dt;

  const span = radius * 2;
  if (x < -span) x = FIELD.width + span;
  else if (x > FIELD.width + span) x = -span;

  if (y < -span) y = FIELD.height + span;
  else if (y > FIELD.height + span) y = -span;

  return { pos: { x, y }, vel: state.vel };
}
