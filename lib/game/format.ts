/**
 * 청소량 표기.
 *
 * 소수점 자리수를 크기에 따라 바꾼다. 0.03kg를 "0kg"로 보여주면 방금 한
 * 일이 사라진 것처럼 느껴지고, 132.47kg에 소수 둘째 자리는 잡음이다.
 */
export function formatMass(kg: number): string {
  const safe = Math.max(0, kg);
  if (safe < 1) return `${safe.toFixed(2)}kg`;
  if (safe < 100) return `${safe.toFixed(1)}kg`;
  return `${Math.round(safe)}kg`;
}

/** 남은 시간 표기 (mm:ss) */
export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
