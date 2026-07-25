# design/

줍스(Jupsy)의 디자인 에셋 원본입니다. SVG와 CSS 토큰만 있고, 빌드 과정이 없습니다.

- **눈으로 보기** → `preview.html` 을 브라우저로 그냥 여세요 (의존성 없음)
- **사용 규칙** → [`../docs/design-guide.md`](../docs/design-guide.md)
- **왜 이렇게 관리하는가** → [`../docs/decisions.md`](../docs/decisions.md) ADR-009

## 빠른 지도

| 경로 | 무엇 |
| --- | --- |
| `tokens/palette.svg` | 팔레트 시각 참조. **토큰 정본은 `app/globals.css`** (ADR-010) |
| `character/jupsy-base.svg` | 줍스 몸체의 **유일한 원본** |
| `character/expressions/` | 바이저에 얹히는 눈 도형 8종 |
| `character/explorations/` | **[제안]** 성격 유형 액센트 4종 — 확정 아님 |
| `arcade/` | 쓰레기·위험 파편·배경·이펙트 |
| `ui/` | 아이콘·배지 틀·궤도 시각화·로고 |

## 손대기 전에 알아둘 것

1. **몸체를 복사하지 마세요.** 표정은 `expressions/` 교체로, 유형 변주는 액센트 레이어 겹치기로 합니다
2. **색은 `var(--토큰, #폴백)` 로 씁니다.** 폴백이 없으면 `preview.html` 에서 안 보입니다
3. **SVG 주석에 `--` 를 쓰면 XML이 깨집니다.** 토큰 이름은 접두사를 빼고 적으세요
4. `tokens.css` 를 고치면 `tokens/palette.svg` 도 같이 고쳐야 합니다 (자동 생성 아님)
5. ⚠️ **앱(`app/globals.css`)에 다른 이름 체계의 토큰이 따로 있습니다.** 합치는 방향은 미결정 — [`../docs/roadmap.md`](../docs/roadmap.md) Q10
