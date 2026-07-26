'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Badge } from '@/components/Badge';
import { OrbitSector } from '@/components/OrbitSector';
import { formatMass } from '@/lib/game/format';
import {
  BADGES,
  clearedDotCount,
  earnedBadgeIds,
  formatComparison,
  massComparison,
  sectorCleanRate,
} from '@/lib/game/records';
import { getRecordsSnapshot, getServerRecordsSnapshot, subscribeRecords } from '@/lib/storage';
import styles from './page.module.css';

export default function ProfilePage() {
  /*
   * localStorage는 React 밖의 상태다.
   *
   * useSyncExternalStore 는 정확히 이런 외부 저장소를 위한 API이고,
   * getServerSnapshot 이 SSR/hydration을 위해 따로 있다. 서버 스냅샷이
   * 항상 빈 실적이므로 **서버 렌더와 클라이언트 첫 렌더가 일치한다** —
   * hydration mismatch가 구조적으로 생기지 않는다. 하이드레이션이 끝나면
   * React가 실제 값으로 다시 그린다.
   *
   * useEffect에서 읽어 setState 하는 방식도 동작하지만 추가 렌더를 부르고,
   * suppressHydrationWarning 이나 dynamic(ssr:false)는 경고를 숨길 뿐
   * 불일치 자체를 없애지 못한다.
   */
  const records = useSyncExternalStore(
    subscribeRecords,
    getRecordsSnapshot,
    getServerRecordsSnapshot,
  );

  const comparison = massComparison(records.totalKg);
  const cleanRate = sectorCleanRate(records.totalKg);
  const earned = earnedBadgeIds(records);
  const 첫방문 = records.sessions === 0;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back} aria-label="홈으로 돌아가기">
          ←
        </Link>
        <h1 className={styles.title}>청소 기록</h1>
      </header>

      <section className={styles.total} aria-labelledby="total-heading">
        <h2 id="total-heading" className={styles.totalLabel}>
          누적 청소량
        </h2>
        <p className={styles.totalValue}>{formatMass(records.totalKg)}</p>
        <p className={styles.totalComparison}>
          {첫방문 ? '아직 기록이 없어요' : formatComparison(comparison)}
        </p>
      </section>

      <section className={styles.sector} aria-labelledby="sector-heading">
        <h2 id="sector-heading" className={styles.sectionTitle}>
          담당 궤도 구역
        </h2>
        <OrbitSector clearedCount={clearedDotCount(cleanRate)} cleanRate={cleanRate} />
        <p className={styles.sectorRate}>
          <strong>{Math.round(cleanRate * 100)}%</strong> 깨끗해졌어요
        </p>
      </section>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.sectionTitle}>
          기록
        </h2>
        <dl className={styles.stats}>
          <div>
            <dt>교신 횟수</dt>
            <dd>{records.sessions}회</dd>
          </div>
          <div>
            <dt>한 판 최고</dt>
            <dd>{formatMass(records.bestSessionKg)}</dd>
          </div>
          <div>
            <dt>흡수한 쓰레기</dt>
            <dd>{records.totalAbsorbed}개</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className={styles.sectionTitle}>
          배지{' '}
          <span className={styles.badgeCount}>
            {earned.size} / {BADGES.length}
          </span>
        </h2>
        <ul className={styles.badges}>
          {BADGES.map((badge) => (
            <Badge key={badge.id} badge={badge} earned={earned.has(badge.id)} />
          ))}
        </ul>
      </section>

      <Link href="/play" className={styles.cta}>
        청소하러 가기
      </Link>
    </main>
  );
}
