import type { Records } from '../storage';
import { SECTOR_DOT_COUNT, SECTOR_TARGET_KG } from './constants';

/**
 * 누적 실적에서 화면에 보여줄 값을 계산하는 순수 함수들.
 *
 * 여기 있는 것은 전부 **파생값**이다. 저장하지 않고 매번 계산한다
 * (저장하면 누적 원본과 어긋난다).
 */

// ── 환산 비유 ──

export interface MassReference {
  /** 사람이 읽는 이름 */
  label: string;
  kg: number;
}

/**
 * 비교 대상 사다리. 가벼운 것부터.
 *
 * 확정된 보상 구조가 "체감 가능한 비유로 환산"이다. 기준을 자동차 하나로
 * 고정하면 초반 수백 판 동안 "자동차 0.01대"만 보인다 — 작은 실천이 쌓이는
 * 경험을 보여주려는 의도와 정반대다. 그래서 누적량에 맞는 칸을 골라
 * 항상 1 이상의 숫자가 나오게 한다.
 */
export const MASS_LADDER: readonly MassReference[] = [
  { label: '캔 음료', kg: 0.35 },
  { label: '노트북', kg: 1.4 },
  { label: '자전거', kg: 12 },
  { label: '세탁기', kg: 65 },
  { label: '소형차', kg: 1200 },
  { label: '버스', kg: 12000 },
];

export interface MassComparison {
  reference: MassReference;
  /** 몇 개분인가 */
  count: number;
  /** 사다리의 가장 낮은 칸에도 못 미치는가 (소수로 보여줘야 함) */
  belowLadder: boolean;
}

/**
 * 누적량에 맞는 비교 대상을 하나 고른다.
 *
 * `kg / 대상 >= 1` 을 만족하는 **가장 큰** 대상을 고른다. 그래야 "노트북
 * 300대"처럼 세기 힘든 숫자 대신 "자전거 35대"가 나온다.
 */
export function massComparison(totalKg: number): MassComparison {
  const kg = Math.max(0, totalKg);

  for (let i = MASS_LADDER.length - 1; i >= 0; i -= 1) {
    const reference = MASS_LADDER[i];
    if (kg / reference.kg >= 1) {
      return { reference, count: kg / reference.kg, belowLadder: false };
    }
  }

  // 아직 가장 가벼운 것에도 못 미친다. 그래도 0으로 보여주지 않는다 —
  // 방금 한 일이 사라진 것처럼 느껴진다.
  return { reference: MASS_LADDER[0], count: kg / MASS_LADDER[0].kg, belowLadder: true };
}

/** "노트북 7대만큼" 문구 */
export function formatComparison(c: MassComparison): string {
  const 수 = c.belowLadder ? c.count.toFixed(2) : Math.floor(c.count).toLocaleString('ko-KR');
  return `${c.reference.label} ${수}대만큼`;
}

// ── 궤도 정화율 ──

/** 담당 구역 정화율 (0~1) */
export function sectorCleanRate(totalKg: number): number {
  if (SECTOR_TARGET_KG <= 0) return 1;
  return Math.min(1, Math.max(0, totalKg) / SECTOR_TARGET_KG);
}

/**
 * 정화율만큼 사라질 쓰레기 점 개수.
 *
 * 100%가 되기 전에는 마지막 점을 남긴다. 다 치우지 않았는데 화면이 비면
 * "끝났다"고 오해하게 된다.
 */
export function clearedDotCount(rate: number): number {
  if (rate >= 1) return SECTOR_DOT_COUNT;
  return Math.min(SECTOR_DOT_COUNT - 1, Math.floor(rate * SECTOR_DOT_COUNT));
}

// ── 배지 ──

export type BadgeTier = 1 | 2 | 3;

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  earned: (r: Records) => boolean;
}

/**
 * 배지 정의 (Q3 결론: 누적량 마일스톤 5 + 행동 3).
 *
 * 분기문이 아니라 테이블이다. 배지를 늘리는 일이 항목 추가로 끝나야 하고,
 * ADR-007에 따라 이것들은 재화가 아니라 **명예·기록**이다 — 어떤 것도
 * 게임 플레이에 이득을 주지 않는다.
 */
export const BADGES: readonly BadgeDef[] = [
  {
    id: 'first-session',
    name: '첫 교신',
    description: '줍스와 처음으로 궤도를 청소했어요',
    tier: 1,
    earned: (r) => r.sessions >= 1,
  },
  {
    id: 'first-kg',
    name: '첫 1kg',
    description: '누적 1kg을 치웠어요',
    tier: 1,
    earned: (r) => r.totalKg >= 1,
  },
  {
    id: 'kg-10',
    name: '10kg 청소',
    description: '누적 10kg을 치웠어요',
    tier: 1,
    earned: (r) => r.totalKg >= 10,
  },
  {
    id: 'flawless',
    name: '무결한 교신',
    description: '위험 파편에 한 번도 부딪히지 않고 한 판을 마쳤어요',
    tier: 2,
    earned: (r) => r.cleanSessions >= 1,
  },
  {
    id: 'absorb-30',
    name: '한 판에 서른 개',
    description: '한 번의 교신에서 쓰레기 30개를 흡수했어요',
    tier: 2,
    earned: (r) => r.bestSessionAbsorbed >= 30,
  },
  {
    id: 'kg-50',
    name: '50kg 청소',
    description: '누적 50kg을 치웠어요',
    tier: 2,
    earned: (r) => r.totalKg >= 50,
  },
  {
    id: 'kg-200',
    name: '200kg 청소',
    description: '누적 200kg을 치웠어요',
    tier: 3,
    earned: (r) => r.totalKg >= 200,
  },
  {
    id: 'kg-1000',
    name: '1톤 청소',
    description: '누적 1,000kg을 치웠어요',
    tier: 3,
    earned: (r) => r.totalKg >= 1000,
  },
];

export function earnedBadgeIds(records: Records): Set<string> {
  return new Set(BADGES.filter((b) => b.earned(records)).map((b) => b.id));
}
