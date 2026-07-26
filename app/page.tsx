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
        <Link href="/profile" className={styles.action}>
          <span className={styles.actionLabel}>프로필 보기</span>
          <span className={styles.actionHint}>지금까지 치운 기록을 봐요</span>
        </Link>
      </nav>
    </main>
  );
}
