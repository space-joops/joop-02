import { describe, expect, it } from 'vitest';
import {
  BADGES,
  clearedDotCount,
  earnedBadgeIds,
  formatComparison,
  massComparison,
  sectorCleanRate,
} from './records';
import { SECTOR_DOT_COUNT, SECTOR_TARGET_KG } from './constants';
import { emptyRecords, type Records } from '../storage';

const 실적 = (over: Partial<Records> = {}): Records => ({ ...emptyRecords(), ...over });

describe('massComparison', () => {
  it('1 이상이 되는 가장 큰 대상을 고른다', () => {
    // 10kg이면 자전거(12kg)에는 못 미치고 노트북(1.4kg)에는 7대분이다.
    expect(massComparison(10).reference.label).toBe('노트북');
  });

  it('누적이 늘면 더 큰 대상으로 올라간다', () => {
    expect(massComparison(0.5).reference.label).toBe('캔 음료');
    expect(massComparison(10).reference.label).toBe('노트북');
    expect(massComparison(50).reference.label).toBe('자전거');
    expect(massComparison(100).reference.label).toBe('세탁기');
    expect(massComparison(3000).reference.label).toBe('소형차');
    expect(massComparison(50000).reference.label).toBe('버스');
  });

  it('경계값에서 정확히 넘어간다', () => {
    expect(massComparison(1.39).reference.label).toBe('캔 음료');
    expect(massComparison(1.4).reference.label).toBe('노트북');
  });

  it('사다리 최하단에도 못 미치면 belowLadder로 표시한다', () => {
    const c = massComparison(0.1);
    expect(c.belowLadder).toBe(true);
    expect(c.reference.label).toBe('캔 음료');
  });

  it('0이어도 죽지 않는다', () => {
    expect(() => massComparison(0)).not.toThrow();
    expect(massComparison(0).count).toBe(0);
  });

  it('음수가 흘러들어도 0으로 막는다', () => {
    expect(massComparison(-5).count).toBe(0);
  });

  it('가장 큰 대상을 넘어가도 그 대상으로 계속 센다', () => {
    const c = massComparison(1_000_000);
    expect(c.reference.label).toBe('버스');
    expect(c.count).toBeGreaterThan(80);
  });
});

describe('formatComparison', () => {
  it('사다리 안에서는 정수로 센다', () => {
    expect(formatComparison(massComparison(10))).toBe('노트북 7대만큼');
  });

  it('사다리 아래에서는 소수로 보여준다', () => {
    // 0으로 보여주면 방금 한 일이 사라진 것처럼 느껴진다.
    expect(formatComparison(massComparison(0.1))).toBe('캔 음료 0.29대만큼');
  });

  it('큰 수에는 자릿수 구분을 넣는다', () => {
    // 사다리 꼭대기(버스)를 한참 넘어서야 네 자리가 나온다.
    expect(formatComparison(massComparison(20_000_000))).toBe('버스 1,666대만큼');
  });
});

describe('sectorCleanRate', () => {
  it('아무것도 안 치웠으면 0이다', () => {
    expect(sectorCleanRate(0)).toBe(0);
  });

  it('목표의 절반이면 0.5다', () => {
    expect(sectorCleanRate(SECTOR_TARGET_KG / 2)).toBeCloseTo(0.5);
  });

  it('목표를 넘어도 1을 넘지 않는다', () => {
    expect(sectorCleanRate(SECTOR_TARGET_KG * 10)).toBe(1);
  });

  it('음수는 0으로 막는다', () => {
    expect(sectorCleanRate(-100)).toBe(0);
  });
});

describe('clearedDotCount', () => {
  it('0%면 하나도 안 사라진다', () => {
    expect(clearedDotCount(0)).toBe(0);
  });

  it('100%면 전부 사라진다', () => {
    expect(clearedDotCount(1)).toBe(SECTOR_DOT_COUNT);
  });

  it('100% 직전에는 마지막 하나를 남긴다', () => {
    // 다 치우지 않았는데 화면이 비면 "끝났다"고 오해하게 된다.
    expect(clearedDotCount(0.999)).toBe(SECTOR_DOT_COUNT - 1);
  });

  it('점 개수를 넘지 않는다', () => {
    expect(clearedDotCount(5)).toBeLessThanOrEqual(SECTOR_DOT_COUNT);
  });
});

describe('배지', () => {
  it('첫 방문자는 아무것도 없다', () => {
    expect(earnedBadgeIds(emptyRecords()).size).toBe(0);
  });

  it('정확히 1kg이면 첫 1kg을 얻는다', () => {
    expect(earnedBadgeIds(실적({ totalKg: 1 })).has('first-kg')).toBe(true);
  });

  it('0.99kg이면 아직 못 얻는다', () => {
    expect(earnedBadgeIds(실적({ totalKg: 0.99 })).has('first-kg')).toBe(false);
  });

  it('누적이 늘면 아래 단계도 함께 유지된다', () => {
    const 획득 = earnedBadgeIds(실적({ totalKg: 250 }));
    expect(획득.has('first-kg')).toBe(true);
    expect(획득.has('kg-10')).toBe(true);
    expect(획득.has('kg-50')).toBe(true);
    expect(획득.has('kg-200')).toBe(true);
    expect(획득.has('kg-1000')).toBe(false);
  });

  it('무피격 판이 있어야 무결한 교신을 얻는다', () => {
    expect(earnedBadgeIds(실적({ sessions: 5, cleanSessions: 0 })).has('flawless')).toBe(false);
    expect(earnedBadgeIds(실적({ sessions: 5, cleanSessions: 1 })).has('flawless')).toBe(true);
  });

  it('한 판 최다 흡수로 판정한다', () => {
    // 누적 흡수가 아니라 한 판 기록이어야 한다.
    expect(
      earnedBadgeIds(실적({ totalAbsorbed: 500, bestSessionAbsorbed: 29 })).has('absorb-30'),
    ).toBe(false);
    expect(earnedBadgeIds(실적({ bestSessionAbsorbed: 30 })).has('absorb-30')).toBe(true);
  });

  it('id가 겹치지 않는다', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 배지에 이름과 설명이 있다', () => {
    for (const b of BADGES) {
      expect(b.name.length).toBeGreaterThan(0);
      expect(b.description.length).toBeGreaterThan(0);
    }
  });
});
