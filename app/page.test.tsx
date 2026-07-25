import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

/*
 * M0의 스모크 테스트.
 *
 * 홈 화면의 세부 문구를 검증하려는 것이 아니라, 테스트 파이프라인
 * (Vitest + jsdom + Testing Library + CSS Modules + TSX)이 실제로
 * 동작하는지 확인하는 것이 목적이다. 게임 로직 테스트는 M1부터 붙는다.
 */
describe('홈 화면', () => {
  it('제목을 보여준다', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: '줍스' })).toBeInTheDocument();
  });

  it('두 개의 진입점을 보여준다', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /청소하러 가기/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /프로필 보기/ })).toBeInTheDocument();
  });

  it('청소하러 가기는 아케이드 모드로 이어진다', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /청소하러 가기/ })).toHaveAttribute('href', '/play');
  });

  it('경로가 아직 없는 진입점은 비활성 상태다', () => {
    // 프로필은 M2에서 경로가 생긴다. 그때 이 테스트도 함께 바뀐다.
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /프로필 보기/ })).toBeDisabled();
  });
});
