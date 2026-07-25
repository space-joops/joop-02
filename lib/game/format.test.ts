import { describe, expect, it } from 'vitest';
import { formatMass, formatTime } from './format';

describe('formatMass', () => {
  it('1kg 미만은 소수 둘째 자리까지 보여준다', () => {
    // 0.03kg를 "0kg"로 보여주면 방금 한 일이 사라진 것처럼 느껴진다.
    expect(formatMass(0.03)).toBe('0.03kg');
  });

  it('100kg 미만은 소수 첫째 자리까지 보여준다', () => {
    expect(formatMass(12.34)).toBe('12.3kg');
  });

  it('100kg 이상은 정수로 보여준다', () => {
    expect(formatMass(132.47)).toBe('132kg');
  });

  it('0은 0.00kg이다', () => {
    expect(formatMass(0)).toBe('0.00kg');
  });

  it('음수가 흘러들어도 0으로 막는다', () => {
    expect(formatMass(-3)).toBe('0.00kg');
  });
});

describe('formatTime', () => {
  it('분과 초로 나눈다', () => {
    expect(formatTime(75)).toBe('1:15');
  });

  it('초를 두 자리로 채운다', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('1분 미만은 0분으로 시작한다', () => {
    expect(formatTime(9)).toBe('0:09');
  });

  it('남은 시간은 올림한다', () => {
    // 0.3초 남았는데 "0:00"이면 이미 끝난 것처럼 보인다.
    expect(formatTime(0.3)).toBe('0:01');
  });

  it('음수는 0으로 막는다', () => {
    expect(formatTime(-5)).toBe('0:00');
  });
});
