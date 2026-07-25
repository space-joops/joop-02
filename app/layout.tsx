import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '줍스 — 반려위성 우주청소 게임',
  description: '우주 쓰레기를 먹어치우는 반려위성 줍스를 입양하고, 함께 궤도를 청소하세요.',
};

// 모바일 세로 화면 고정 게임이다. 사용자 확대를 막아 조이스틱 드래그가
// 핀치 줌으로 오인되지 않게 하고, 노치 영역까지 배경을 채운다.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#070b18',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
