import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>줍스</h1>
        <p className={styles.tagline}>궤도를 함께 치우는 반려위성</p>
      </header>

      <div className={styles.stage}>
        {/* 줍스 캐릭터 SVG가 들어갈 자리 (M3) */}
        <div className={styles.placeholder} aria-hidden="true">
          줍스
        </div>
      </div>

      <nav className={styles.actions} aria-label="주요 메뉴">
        <Link href="/play" className={`${styles.action} ${styles.actionPrimary}`}>
          <span className={styles.actionLabel}>청소하러 가기</span>
          <span className={styles.actionHint}>지금 통신이 연결돼 있어요</span>
        </Link>
        {/* 프로필은 M2에서 연결한다.
            아직 없는 경로로 링크를 걸면 404가 나므로 비활성 버튼으로 둔다. */}
        <button type="button" className={styles.action} disabled>
          <span className={styles.actionLabel}>프로필 보기</span>
          <span className={styles.actionHint}>아직 기록이 없어요</span>
        </button>
      </nav>
    </main>
  );
}
