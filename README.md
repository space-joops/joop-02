# 줍스 (Jupsy)

우주 쓰레기를 먹어치우는 반려위성을 입양해 지구에서 유대를 쌓고, 우주로 발사한 뒤 정기적으로 통신이 연결되는 시간에 함께 궤도를 청소하는 게임.

모바일 세로 화면 전용 웹 게임입니다.

## 시작하기

```bash
npm install
npm run dev
```

http://localhost:3000 에서 열립니다. 모바일 세로 화면 기준으로 만들어졌으니 브라우저 개발자도구의 기기 모드(예: iPhone 14 Pro)로 보는 것을 권합니다.

## 명령어

| 명령어                 | 설명                                       |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | 개발 서버 실행                             |
| `npm run build`        | 프로덕션 빌드                              |
| `npm start`            | 빌드 결과 실행                             |
| `npm run lint`         | ESLint 검사                                |
| `npm run format`       | Prettier 포맷 적용                          |
| `npm run format:check` | 포맷 검사만 (CI에서 사용)                  |
| `npm run typecheck`    | 타입 검사                                  |
| `npm run test`         | 테스트 1회 실행                            |
| `npm run test:watch`   | 테스트 watch 모드                          |

CI(`.github/workflows/ci.yml`)는 위 항목을 `format:check → lint → typecheck → test → build` 순으로 검증합니다.

## 기술 스택

- **Next.js 16 (App Router) + TypeScript**
- **CSS Modules + CSS 변수** — 디자인 토큰은 `app/globals.css`의 `:root`에 정의
- **Vitest + Testing Library** (jsdom)
- 그래픽·애니메이션은 **SVG + CSS** (Canvas 미사용)
- 데이터는 브라우저 `localStorage` (서버 저장은 M7 예정)

선택 근거와 트레이드오프는 [`docs/decisions.md`](./docs/decisions.md)에 ADR로 정리되어 있습니다.

## 구조

```
app/            App Router 페이지와 레이아웃
  globals.css   디자인 토큰 (색·간격·타이포·레이어·모션)
  layout.tsx    모바일 세로 셸 (safe-area, 회전 안내)
docs/           기획·설계·학습 문서
```

## 문서

이 프로젝트는 문서가 곧 작업 맥락입니다. 이어서 작업할 때는 아래부터 읽으세요.

| 문서                                             | 내용                                    |
| ------------------------------------------------ | --------------------------------------- |
| [`CLAUDE.md`](./CLAUDE.md)                       | 컨셉·세계관·확정 규칙·기술 결정·현재 상태 |
| [`docs/README.md`](./docs/README.md)             | 문서 인덱스와 갱신 규칙                 |
| [`docs/roadmap.md`](./docs/roadmap.md)           | M0~M7 마일스톤과 완료 기준              |
| [`docs/decisions.md`](./docs/decisions.md)       | 기술 결정 기록 (ADR)                    |
| [`docs/worklog.md`](./docs/worklog.md)           | 작업 로그                               |
| [`docs/growth-roadmap.md`](./docs/growth-roadmap.md) | 프론트엔드 학습 커리큘럼            |

## 현재 상태

**M0(프로젝트 기반) 진행 중.** 홈 화면과 검증 파이프라인까지 구현되어 있고, 아케이드 모드(M1)와 프로필(M2)은 아직 없습니다. 홈 화면의 두 진입점이 비활성인 이유입니다.
