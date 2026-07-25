import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 테스트 간 DOM이 남아 다음 테스트의 쿼리에 잡히는 것을 막는다.
afterEach(() => {
  cleanup();
});
