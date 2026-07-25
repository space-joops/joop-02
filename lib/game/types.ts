/** 논리 좌표계의 한 점. 화면 픽셀이 아니라 필드 단위다. */
export interface Vec {
  x: number;
  y: number;
}

/**
 * 쓰레기 종류.
 *
 * 판별 유니온의 태그로 쓴다. 종류가 늘어나도 분기문을 흩뿌리지 않고
 * DEBRIS_KINDS 테이블에 항목을 더하는 것으로 끝나게 하기 위함이다.
 */
export type DebrisKind = 'safe' | 'hazard';

export interface Debris {
  id: number;
  kind: DebrisKind;
  pos: Vec;
  vel: Vec;
  /** 논리 단위 반지름. 흡수 가능 판정과 충돌 판정에 함께 쓰인다. */
  radius: number;
  /** 청소량으로 환산되는 질량. hazard는 0이다. */
  massKg: number;
  /** 모양 변주용 시드. 같은 파편은 항상 같은 모양으로 그려진다. */
  shapeSeed: number;
}

export interface Jupsy {
  pos: Vec;
  vel: Vec;
  radius: number;
}

/** 세션 한 판의 누적 결과. 화면 표시와 M2의 영속화가 함께 쓴다. */
export interface SessionResult {
  /** 이번 판에 실제로 흡수한 질량 (위험 파편 손실 반영 후) */
  collectedKg: number;
  /** 흡수한 쓰레기 개수 */
  absorbedCount: number;
  /** 위험 파편에 부딪힌 횟수 */
  hazardHits: number;
}
