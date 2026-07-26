import { beforeEach, describe, expect, it } from 'vitest';
import { clearRecords, emptyRecords, readRecords, saveSession, SCHEMA_VERSION } from './storage';
import type { SessionResult } from './game/types';

const KEY = 'joops:records';

const 세션 = (over: Partial<SessionResult> = {}): SessionResult => ({
  collectedKg: 10,
  absorbedCount: 12,
  hazardHits: 0,
  ...over,
});

const 백업키 = () => Object.keys(localStorage).filter((k) => k.startsWith('joops:records:backup:'));

beforeEach(() => {
  localStorage.clear();
});

describe('readRecords', () => {
  it('저장된 것이 없으면 빈 실적을 돌려준다', () => {
    expect(readRecords()).toEqual(emptyRecords());
  });

  it('저장한 것을 그대로 읽는다', () => {
    saveSession(세션({ collectedKg: 7.5 }));
    expect(readRecords().totalKg).toBeCloseTo(7.5);
  });

  it('깨진 JSON이면 빈 실적으로 시작한다', () => {
    localStorage.setItem(KEY, '{이건 JSON이 아니다');
    expect(readRecords()).toEqual(emptyRecords());
  });

  it('깨진 값을 지우지 않고 백업 키로 옮긴다', () => {
    // 사용자의 기록일 수도 있다. 덮어써서 날리면 안 된다.
    localStorage.setItem(KEY, '{깨짐');
    readRecords();
    const 백업 = 백업키();
    expect(백업).toHaveLength(1);
    expect(localStorage.getItem(백업[0])).toBe('{깨짐');
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('모르는 버전이면 해석하지 않고 백업한다', () => {
    // 미래 버전을 억지로 읽으면 필드가 어긋난 채 계산에 흘러들어간다.
    localStorage.setItem(KEY, JSON.stringify({ version: 999, totalKg: 50, sessions: 3 }));
    expect(readRecords()).toEqual(emptyRecords());
    expect(백업키()).toHaveLength(1);
  });

  it('백업 후에는 다시 저장할 수 있다', () => {
    // 손상된 데이터 때문에 앞으로 기록을 못 남기는 상태에 갇히면 안 된다.
    localStorage.setItem(KEY, '깨짐');
    readRecords();
    saveSession(세션({ collectedKg: 3 }));
    expect(readRecords().totalKg).toBeCloseTo(3);
  });

  it('음수나 NaN이 들어 있으면 신뢰하지 않는다', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: SCHEMA_VERSION, totalKg: -5, sessions: 1 }),
    );
    expect(readRecords()).toEqual(emptyRecords());
  });

  it('일부 필드가 빠져 있어도 나머지는 살린다', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: SCHEMA_VERSION, totalKg: 12, sessions: 2 }),
    );
    const r = readRecords();
    expect(r.totalKg).toBe(12);
    expect(r.sessions).toBe(2);
    expect(r.bestSessionKg).toBe(0);
  });
});

describe('saveSession', () => {
  it('누적된다', () => {
    saveSession(세션({ collectedKg: 4 }));
    saveSession(세션({ collectedKg: 6 }));
    const r = readRecords();
    expect(r.totalKg).toBeCloseTo(10);
    expect(r.sessions).toBe(2);
  });

  it('한 판 최고 기록을 갱신한다', () => {
    saveSession(세션({ collectedKg: 9, absorbedCount: 20 }));
    saveSession(세션({ collectedKg: 3, absorbedCount: 40 }));
    const r = readRecords();
    expect(r.bestSessionKg).toBe(9);
    expect(r.bestSessionAbsorbed).toBe(40);
  });

  it('무피격 판만 cleanSessions로 센다', () => {
    saveSession(세션({ hazardHits: 0 }));
    saveSession(세션({ hazardHits: 3 }));
    saveSession(세션({ hazardHits: 0 }));
    expect(readRecords().cleanSessions).toBe(2);
  });

  it('첫 플레이 시각은 처음 값을 유지하고 마지막 시각만 갱신한다', () => {
    const 첫번째 = saveSession(세션());
    const 두번째 = saveSession(세션());
    expect(두번째.firstPlayedAt).toBe(첫번째.firstPlayedAt);
    expect(두번째.lastPlayedAt).not.toBeNull();
  });

  it('음수 청소량이 흘러들어도 누적을 깎지 않는다', () => {
    saveSession(세션({ collectedKg: 10 }));
    saveSession(세션({ collectedKg: -50 }));
    expect(readRecords().totalKg).toBeCloseTo(10);
  });

  it('갱신된 실적을 즉시 돌려준다', () => {
    // 결과 화면이 이 반환값으로 "지금까지 누적"을 바로 보여준다.
    const r = saveSession(세션({ collectedKg: 5 }));
    expect(r.totalKg).toBeCloseTo(5);
  });
});

describe('clearRecords', () => {
  it('기록을 지운다', () => {
    saveSession(세션());
    clearRecords();
    expect(readRecords()).toEqual(emptyRecords());
  });
});
