import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // tsconfig의 "@/*" 경로 별칭을 Vitest에서도 동일하게 해석한다.
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // .next 산출물 안의 파일을 테스트로 오인하지 않게 한다.
    exclude: ['node_modules/**', '.next/**'],
  },
});
