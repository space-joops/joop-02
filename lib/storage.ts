import type { SessionResult } from './game/types';

/**
 * 누적 실적 저장 (ADR-005).
 *
 * localStorage 접근은 **이 파일 한 곳으로만** 합니다. 나머지 코드가 직접
 * 만지기 시작하면 M7의 서버 마이그레이션 때 손댈 곳을 찾을 수 없게 됩니다.
 */

const KEY = 'jupsy:records';
const BACKUP_PREFIX = 'jupsy:records:backup:';

/** 현재 스키마 버전. 형식을 바꾸면 올리고 마이그레이션을 붙입니다. */
export const SCHEMA_VERSION = 1;

export interface Records {
  version: number;
  /** 누적 청소량 */
  totalKg: number;
  /** 완주한 교신(세션) 횟수 */
  sessions: number;
  totalAbsorbed: number;
  totalHazardHits: number;
  /** 한 판 최고 청소량 */
  bestSessionKg: number;
  /** 한 판 최다 흡수 개수 — 행동 배지 판정용 */
  bestSessionAbsorbed: number;
  /** 위험 파편에 한 번도 맞지 않은 판 수 */
  cleanSessions: number;
  firstPlayedAt: string | null;
  lastPlayedAt: string | null;
}

export function emptyRecords(): Records {
  return {
    version: SCHEMA_VERSION,
    totalKg: 0,
    sessions: 0,
    totalAbsorbed: 0,
    totalHazardHits: 0,
    bestSessionKg: 0,
    bestSessionAbsorbed: 0,
    cleanSessions: 0,
    firstPlayedAt: null,
    lastPlayedAt: null,
  };
}

/**
 * 저장된 값을 Records로 해석한다. 못 믿을 값이면 null을 돌려준다.
 *
 * 사용자가 devtools로 localStorage를 손댈 수 있고, 앞으로 스키마도 바뀐다.
 * 어느 쪽이든 앱이 죽어서는 안 된다.
 */
function parseRecords(raw: string): Records | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== 'object' || data === null) return null;
  const o = data as Record<string, unknown>;

  // 아는 버전이 아니면 해석하지 않는다. 미래 버전을 억지로 읽으면
  // 필드가 어긋난 채 계산에 흘러들어가 조용히 틀린 값이 쌓인다.
  if (o.version !== SCHEMA_VERSION) return null;

  const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;

  const totalKg = num(o.totalKg);
  const sessions = num(o.sessions);
  if (totalKg === null || sessions === null) return null;

  return {
    version: SCHEMA_VERSION,
    totalKg,
    sessions,
    totalAbsorbed: num(o.totalAbsorbed) ?? 0,
    totalHazardHits: num(o.totalHazardHits) ?? 0,
    bestSessionKg: num(o.bestSessionKg) ?? 0,
    bestSessionAbsorbed: num(o.bestSessionAbsorbed) ?? 0,
    cleanSessions: num(o.cleanSessions) ?? 0,
    firstPlayedAt: typeof o.firstPlayedAt === 'string' ? o.firstPlayedAt : null,
    lastPlayedAt: typeof o.lastPlayedAt === 'string' ? o.lastPlayedAt : null,
  };
}

/**
 * 읽을 수 없는 값을 백업 키로 옮긴다.
 *
 * 그냥 덮어쓰면 사용자의 기록이 사라지고, 그대로 두면 앞으로 아무것도
 * 저장하지 못하는 상태에 갇힌다. 옆으로 치워두고 새로 시작한다.
 */
function archiveUnreadable(raw: string): void {
  try {
    window.localStorage.setItem(`${BACKUP_PREFIX}${Date.now()}`, raw);
    window.localStorage.removeItem(KEY);
  } catch {
    // 용량 초과 등으로 백업조차 못 하면 원본을 남겨둔다.
    // 기록을 못 남기는 것이 남의 데이터를 지우는 것보다 낫다.
  }
}

/** 저장된 실적을 읽는다. 없거나 못 읽으면 빈 실적을 돌려준다. */
export function readRecords(): Records {
  // 서버 렌더 중에는 window가 없다. 프로필 화면은 이 값을 첫 렌더에
  // 쓰지 않지만(hydration), 방어적으로 막아둔다.
  if (typeof window === 'undefined') return emptyRecords();

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // 사파리 프라이빗 모드 등에서 접근 자체가 막힐 수 있다.
    return emptyRecords();
  }
  if (raw === null) return emptyRecords();

  const parsed = parseRecords(raw);
  if (parsed === null) {
    archiveUnreadable(raw);
    return emptyRecords();
  }
  return parsed;
}

/**
 * 세션 하나의 결과를 누적한다. 갱신된 실적을 돌려준다.
 *
 * 파생값(정화율·배지)은 저장하지 않는다. 누적 원본에서 계산할 수 있고,
 * 따로 저장하면 둘이 어긋난다.
 */
export function saveSession(result: SessionResult): Records {
  const prev = readRecords();
  const now = new Date().toISOString();

  const next: Records = {
    version: SCHEMA_VERSION,
    totalKg: prev.totalKg + Math.max(0, result.collectedKg),
    sessions: prev.sessions + 1,
    totalAbsorbed: prev.totalAbsorbed + result.absorbedCount,
    totalHazardHits: prev.totalHazardHits + result.hazardHits,
    bestSessionKg: Math.max(prev.bestSessionKg, result.collectedKg),
    bestSessionAbsorbed: Math.max(prev.bestSessionAbsorbed, result.absorbedCount),
    cleanSessions: prev.cleanSessions + (result.hazardHits === 0 ? 1 : 0),
    firstPlayedAt: prev.firstPlayedAt ?? now,
    lastPlayedAt: now,
  };

  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장에 실패해도 이번 판의 결과 화면은 보여준다.
    // 화면에 쓸 값은 돌려주되 다음 세션에서 사라질 뿐이다.
  }
  return next;
}

/** 기록 초기화. 테스트와 개발용. */
export function clearRecords(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 접근이 막힌 환경에서는 지울 것도 없다.
  }
}
