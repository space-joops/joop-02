# 디자인 에셋 사용 가이드

`design/` 아래 에셋을 **어떻게 가져다 쓰는가**를 정리합니다. 왜 이렇게 정했는지는 [`decisions.md`](./decisions.md)의 ADR-002·ADR-003·ADR-009에 있습니다.

> **지금 이 에셋들은 어떤 코드에도 연결되어 있지 않습니다.** M0가 이 작업과 병렬로 진행되어, 앱은 `app/globals.css` 에 **별도의 토큰 한 벌**을 따로 만든 상태입니다([`../CLAUDE.md`](../CLAUDE.md)의 `현재 상태` 참고).
>
> 그래서 아래 2절의 "이식 절차"는 **아직 아무도 수행하지 않은, 앞으로 할 일**입니다. 어느 쪽 이름 체계로 합칠지가 먼저 정해져야 합니다 — [`roadmap.md`](./roadmap.md) Q10, 경위는 [`decisions.md`](./decisions.md) ADR-009.

**눈으로 먼저 보세요.** `design/preview.html` 을 브라우저로 열면 모든 에셋이 한 페이지에 나옵니다. 빌드도 의존성도 없습니다.

---

## 1. 파일 구조

```
design/
├─ preview.html                  모든 에셋을 한 화면에서 확인 (file:// 로 바로 열림)
├─ tokens/
│  ├─ tokens.css                 ★ 색·간격·타이포·z-index·모션 토큰의 원본
│  └─ palette.svg                팔레트 시각 참조 (사본. tokens.css 를 고치면 같이 고칠 것)
├─ character/
│  ├─ jupsy-base.svg             ★ 몸체의 유일한 원본
│  ├─ expressions/               눈 도형 8종 — 바이저에 얹히는 교체 레이어
│  └─ explorations/              [제안] 성격 유형 액센트 4종 · 확정 아님
├─ arcade/
│  ├─ debris/                    먹을 수 있는 쓰레기 4종
│  ├─ hazard/                    위험 파편 2종
│  ├─ background/                시차 배경 3종
│  └─ fx/                        이펙트 3종
└─ ui/
   ├─ icons/                     currentColor 기반 아이콘 8종
   ├─ badge/                     배지 빈 틀 + 미획득 상태
   ├─ orbit-sector.svg           담당 궤도 구역 정화율 시각화 (M2)
   ├─ logo-jupsy.svg             앱 아이콘 128
   ├─ favicon.svg                32px 기준으로 다시 그린 버전
   └─ wordmark.svg               워드마크 (폰트 의존 · 임시)
```

### 네이밍

- 전부 **케밥 케이스**, 소문자
- `카테고리-이름` 순서: `debris-metal`, `hazard-shard`, `icon-timer`, `eyes-happy`
- 카테고리가 디렉터리 이름과 겹쳐도 파일명에 남깁니다. 인라인 스니펫을 복사해 붙일 때 파일명만 보고 무엇인지 알 수 있어야 합니다

### 새 에셋을 추가할 때

1. 위 네이밍 규칙대로 이름을 짓고 해당 디렉터리에 넣는다
2. 3절의 SVG 작성 규칙을 지킨다 (특히 `viewBox` / `var()` 폴백 / id 접두사)
3. `preview.html` 의 해당 배열(`DEBRIS`, `ICONS` 등)에 이름을 추가한다
4. `preview.html` 을 열어 눈으로 확인한다
5. 이 문서의 8절 마일스톤 대응표에 한 줄 추가한다

---

## 2. 디자인 토큰

### 2계층 구조

```
--c-glow-cyan-400: #6fe3ff;          ← 원시 토큰 (팔레트). 컴포넌트에서 직접 쓰지 않는다
--color-eye: var(--c-glow-cyan-400); ← 시맨틱 토큰 (용도). 컴포넌트는 이것만 참조한다
```

**컴포넌트에서 `--c-*` 를 직접 참조하지 마세요.** 이 구분이 있어야 "줍스 눈 색을 바꾼다"가 한 줄 수정으로 끝납니다. `--c-*` 를 여기저기서 참조하기 시작하면 계층이 무너지고 팔레트가 곧 하드코딩이 됩니다.

색·간격 리터럴을 컴포넌트에 직접 쓰지 않는 것은 ADR-003이 정한 규칙이고, M0의 완료 기준이기도 합니다.

### ⚠️ 토큰이 두 벌입니다 (Q10 미해결)

M0가 이 작업과 병렬로 진행되면서 `app/globals.css` 에 **다른 이름 체계의 토큰**이 이미 들어갔고, 그대로 배포되었습니다.

| | `app/globals.css` (M0) | `design/tokens/tokens.css` |
| --- | --- | --- |
| 배경 | `--color-space-900` | `--color-bg-deep` |
| 줍스 눈 | `--color-jupsy-eye` | `--color-eye` |
| 쓰레기 | `--color-debris-safe` 1종 | 4종으로 분화 |
| 간격 | `--space-4` | `--sp-4` |

**`design/` 의 SVG는 후자를 참조합니다.** 지금 상태로 SVG를 인라인하면 이름이 없어 전부 폴백 hex로 떨어지고, 토큰 레이어가 죽습니다.

어느 쪽으로 합칠지는 [`roadmap.md`](./roadmap.md) Q10에서 결론이 나야 하고, **M1 착수 전에 정해야 합니다.** 그 전까지 아래 절차는 실행하지 마세요.

### 합치기로 결론이 난 뒤의 이식 절차

`tokens.css` 는 `:root { }` 블록 하나로 작성되어 있어 그대로 옮길 수 있습니다.

1. Q10의 결론에 따라 이름 체계를 하나로 맞춘다 — 한쪽 이름으로 통일하되, 상대편에만 있던 토큰(쓰레기 4종 구분, 배지 티어, 눈 발광 단계 등)은 빠뜨리지 말고 가져온다
2. 합친 결과를 `app/globals.css` 의 `:root` 에 둔다
3. `@media (prefers-reduced-motion: reduce)` 블록도 같이 가져간다 (M3 완료 기준과 연결)
4. 이름이 바뀐 쪽을 실제 참조처에 반영한다 — `design/**/*.svg` 의 `var()` 이름 또는 `app/*.module.css` 의 참조
5. **`design/tokens/tokens.css` 는 지우지 않습니다.** `preview.html` 이 이 파일을 참조합니다

> 이식 후에도 두 곳에 같은 값이 남습니다. 이건 알고 감수하는 중복입니다 — 이유와 대안은 ADR-009에 적어뒀습니다. 토큰을 고칠 때는 **두 파일 다** 고치세요.

### 런타임에 값 바꾸기

CSS 변수를 쓴 이유 중 하나가 이겁니다 (ADR-003의 근거). 줍스의 기분에 따라 코어 색을 바꾸는 연출:

```ts
// 저빈도 값이므로 이런 식의 직접 조작이 안전합니다 (ADR-004: 고빈도 값은 useRef + DOM)
element.style.setProperty('--color-core', 'var(--c-glow-rose-400)');
```

인라인된 SVG는 이 값을 즉시 따라갑니다. 다시 그릴 필요가 없습니다.

### 대비비 (WCAG)

배경 `--c-void-900` 기준. 전부 AA(4.5:1)를 넘습니다.

| 토큰 | vs bg-mid | vs surface | vs surface-raised |
| --- | --- | --- | --- |
| `--color-text-hi` | 17.7:1 | 16.1:1 | 14.3:1 |
| `--color-text-mid` | 12.2:1 | 11.1:1 | 9.8:1 |
| `--color-text-low` | 6.7:1 | 6.1:1 | 5.4:1 |
| `--color-badge` | 12.5:1 | 11.4:1 | 10.1:1 |
| `--color-eye` | 12.9:1 | 11.7:1 | 10.4:1 |
| `--color-hazard` | 5.6:1 | 5.1:1 | 4.5:1 |

`--color-hazard` 는 여유가 가장 적습니다. 이 색으로 **본문**을 쓰지 말고 경고 표시에만 쓰세요.

> **어느 배경 기준인지 반드시 같이 적으세요.** 같은 `--color-hazard` 도 `--color-bg-deep` 위에서는 5.89:1, `--color-surface-raised` 위에서는 4.52:1 입니다. 배경을 안 쓰고 숫자만 옮기면 다음 사람이 잘못 믿습니다.
>
> 위 표는 **텍스트 기준(AA 4.5:1)** 입니다. 도형 내부의 음영 토큰(`--color-hazard-deep` 2.96:1, `--color-debris-archive-shadow` 2.81:1, `--color-debris-metal-shadow` 4.00:1 — 전부 `--color-bg-mid` 기준)은 이 기준을 적용할 대상이 아닙니다. 비텍스트 요소는 **3:1** 이 기준이고, 실제 비교 대상도 배경이 아니라 **자기 몸체 색**입니다.

---

## 3. SVG 작성 규칙

### 반드시

- **`viewBox` 를 넣고 `width`/`height` 는 넣지 않는다.** 크기는 쓰는 쪽에서 CSS로 정합니다. 루트에 `width` 가 박혀 있으면 반응형이 깨집니다
- **색은 `var(--토큰, #폴백)` 형태로 쓴다.**
  ```xml
  fill="var(--color-shell, #f7faff)"
  ```
  폴백이 있어야 `<img src="...svg">` 로 열었을 때나 토큰이 아직 없는 환경에서도 제대로 보입니다. `preview.html` 이 실제로 그 상태이고, 그 화면이 멀쩡하다는 것이 폴백이 살아 있다는 증거입니다
- **id에 접두사를 붙인다** — `jupsy-`, `orbit-`, `earth-`, `logo-`, `fx-`. SVG를 인라인하면 id가 **문서 전역**이 됩니다. `<linearGradient id="grad">` 두 개가 한 페이지에 있으면 나중 것이 먼저 것을 덮어써서 그라디언트가 엉킵니다

### 하지 말 것

- **XML 주석 안에 `--` 를 쓰지 마세요.** XML에서 불법이라 파일 전체가 파싱 실패합니다. 토큰 이름을 주석에 적을 때는 접두사를 빼고 `color-eye 토큰` 처럼 씁니다. (이 규칙은 실제로 5개 파일이 깨진 뒤에 생겼습니다)
- **여러 개가 동시에 뜨는 오브젝트에 `filter` 를 쓰지 마세요.** 발광은 반투명 도형을 겹쳐서 냅니다 — `absorb-burst.svg` 가 그 방식입니다. 필터는 캐릭터처럼 화면에 하나뿐인 것에만
- 애니메이션에 `width`/`x`/`cx` 같은 기하 속성을 쓰지 마세요. 5절 참고

### 검사

```bash
# XML 유효성 (주석의 -- 문제를 여기서 잡습니다)
python3 -c "import xml.dom.minidom,glob;[xml.dom.minidom.parse(f) for f in glob.glob('design/**/*.svg',recursive=True)]"

# viewBox 누락 / width·height 하드코딩
grep -L 'viewBox' design/**/*.svg
grep -l '<svg[^>]* width=' design/**/*.svg
```

---

## 4. 표정 교체

M3의 완료 기준은 **"표정 추가가 눈 도형 교체만으로 가능하다 (몸통 구조 수정 불필요)"** 입니다. 이 구조가 그걸 보장합니다.

### 눈 슬롯 규격

| 항목 | 값 |
| --- | --- |
| 캐릭터 캔버스 | `viewBox="0 0 200 240"` |
| 눈 슬롯 위치 | `x=40, y=52` |
| 눈 슬롯 크기 | `120 × 60` |
| 표정 파일 viewBox | `0 0 120 60` (전부 동일) |
| 눈 중심 | 슬롯 로컬 좌표 `(42, 30)` / `(78, 30)` |

`jupsy-base.svg` 안의 `<g id="jupsy-eyes" transform="translate(40 52)">` 내용을 표정 파일의 내용으로 통째로 갈아끼우면 됩니다. 좌표를 다시 계산할 일이 없습니다.

`preview.html` 2절에서 이 교체가 실제로 맞아떨어지는 것을 확인할 수 있습니다.

### 표정 ↔ 게임 이벤트

| 파일 | 언제 |
| --- | --- |
| `eyes-normal` | 평상시. 홈 화면, 아케이드 진행 중 |
| `eyes-happy` | 쓰레기 흡수 성공, 세션 성과 요약 |
| `eyes-heart` | 좋아하는 것을 먹었을 때 — 확정된 기획: "눈이 하트가 되고 통통 튄다" |
| `eyes-hurt` | 위험 파편 피격. 게임 오버가 없으므로(확정) 짧게만 |
| `eyes-sleepy` | 통신 가능 시간이 아닐 때(M5의 대기 상태) |
| `eyes-focus` | 아케이드 진입 직후, 큰 파편을 노릴 때 |
| `eyes-blink` | 아이들 중 짧게 끼워넣는 한 프레임. 단독 감정이 아님 |
| `eyes-curious` | 처음 보는 쓰레기, 온보딩 안내(M4) |

앞의 4종(`normal`/`happy`/`hurt`/`heart`)이 M3 범위에 명시된 필수 세트입니다. 나머지 4종은 그 위의 확장분입니다.

### 표정을 새로 추가할 때

`viewBox="0 0 120 60"` 로 새 파일을 만들고 눈 중심 `(42,30)`/`(78,30)` 근처에 그리면 끝입니다. **`jupsy-base.svg` 는 건드리지 않습니다.** 몸통을 수정해야 표정이 추가된다면 그건 이 구조가 깨졌다는 신호입니다.

---

## 5. 애니메이션

### transform-origin

`jupsy-base.svg` 파일 상단 주석에도 같은 표가 있습니다.

| 파트 id | transform-origin | 용도 |
| --- | --- | --- |
| `#jupsy-root` | `100px 120px` | 부유(idle bobbing), 피격 흔들림 |
| `#jupsy-head` | `100px 100px` | 갸웃거림 |
| `#jupsy-arm-left` | `36px 180px` | 팔 흔들기 |
| `#jupsy-arm-right` | `164px 180px` | 팔 흔들기 |
| `#jupsy-core` | `100px 176px` | 코어 라이트 맥동 |
| `#jupsy-thruster` | `100px 224px` | 추진 깜빡임 |

SVG 안에서는 `transform-box: fill-box` 를 함께 쓰거나 위 좌표를 그대로 쓰세요.

### 쓸 수 있는 속성

**`transform` 과 `opacity` 만** 애니메이션합니다. 이 둘은 컴포지팅 단계에서 처리되어 레이아웃·페인트를 다시 돌리지 않습니다. `cx`, `r`, `width` 같은 기하 속성을 애니메이션하면 매 프레임 다시 그려집니다 — ADR-002가 감시 지점으로 지목한 바로 그 비용입니다.

토큰에 준비된 값:

| 연출 | duration | easing |
| --- | --- | --- |
| 부유 | `--dur-bob` (3200ms) | `--ease-in-out` |
| 코어 맥동 | `--dur-core-pulse` (2400ms) | `--ease-in-out` |
| 흡수 시 통통 튐 | `--dur-fast` | `--ease-pop` (오버슛) |
| 피격 흔들림 | `--dur-fast` | `--ease-out` |
| 화면 전환 | `--dur-base` | `--ease-out` |
| 신호 끊김 | `--dur-scene` | `--ease-in-out` |

### prefers-reduced-motion

`tokens.css` 하단에서 **토큰의 duration을 전부 1ms로 죽입니다.** 개별 컴포넌트가 따로 대응할 필요가 없습니다. 연출의 최종 상태는 남고 움직임만 사라집니다.

새 애니메이션을 만들 때 duration을 토큰에서 가져오기만 하면 이 대응이 공짜로 따라옵니다. 리터럴로 `240ms` 라고 쓰면 안 따라옵니다.

---

## 6. 성능

ADR-002는 SVG를 선택하면서 **동시 오브젝트 수가 성능 상한이 된다**는 것을 감시 지점으로 남겼고, 실측은 M1에서 하기로 되어 있습니다(현재 `미측정`). 에셋 쪽에서 미리 지킨 것들:

- 쓰레기·위험 파편은 **필터 없음**. 그림자·발광은 도형을 겹쳐서 냅니다
- 쓰레기·위험 파편·이펙트는 전부 **`viewBox="0 0 100 100"` 정규화**. 크기 변화는 `transform: scale()` 로만 냅니다. 성장에 따라 줍스가 커지는 것(M1)도 마찬가지입니다
- 배경은 3개 레이어(`starfield` / `orbit-band` / `earth-limb`)로 나눠뒀습니다. 시차 스크롤은 **레이어 그룹 하나를 통째로 `translate`** 하면 됩니다. 별을 개별로 움직이지 마세요
- `starfield.svg` 안의 `#star-far` / `#star-mid` / `#star-near` 가 그 3단 깊이입니다

M1에서 화면 밖으로 나간 오브젝트는 언마운트하세요. 실측값이 나오면 ADR-002의 빈칸을 채우고, 상한이 게임 디자인을 못 버티면 그 ADR을 재검토합니다.

### 크기 맞추기 — 잉크 반경은 45로 통일되어 있습니다

`arcade/debris/*` 와 `arcade/hazard/*` 6개는 **캔버스 중심 (50,50) 기준 잉크 반경이 정확히 45** 가 되도록 정규화되어 있습니다. 그래서 소비자 쪽 변환은 에셋별 표가 필요 없고 한 줄로 끝납니다.

```
transform: translate(cx, cy) scale(radius / 45)
```

`radius` 는 게임 로직이 쓰는 충돌 판정 반지름입니다. 이렇게 걸면 **그림의 겉넓이와 충돌 원이 일치합니다.**

정규화는 각 파일 안에서 내용을 감싼 `<g transform="translate(50 50) scale(k) translate(-cx -cy)">` 한 겹으로 되어 있습니다. 그림 자체는 손대지 않았습니다. 새 파편을 추가하면 같은 방식으로 반경 45에 맞추세요.

> **측정할 때 주의 — `getBBox()` 를 쓰면 안 됩니다.** `getBBox()` 는 **stroke를 포함하지 않는 기하 경계**만 돌려줍니다. 이 에셋들은 stroke로 실루엣을 둥글리는 것이 많아 실제 잉크가 훨씬 큽니다. 정규화 전 두 기준의 차이는 이만큼이었습니다.
>
> | 에셋 | `getBBox()` 반경 | 실제 잉크 반경 |
> | --- | --- | --- |
> | `debris-cable` | 29.2 | 33.8 |
> | `debris-metal` | 34.0 | 40.5 |
> | `debris-crystal` | 35.0 | 41.0 |
> | `debris-archive` | 38.8 | 40.5 |
> | `hazard-shard` | 44.0 | **56.0** |
> | `hazard-blade` | 48.0 | **58.5** |
>
> 위험 파편 두 개는 정규화 전 원본 캔버스를 넘어가 잘리고 있었습니다. `getBoundingClientRect()` 도 SVG 도형에서는 stroke를 포함하지 않으므로, 캔버스에 그려 **알파 픽셀 범위**를 재는 것이 유일하게 믿을 수 있는 방법입니다.

---

## 7. 접근성

- 의미 있는 그래픽은 `role="img"` + `aria-label`. 모든 에셋에 이미 들어 있습니다
- **장식용으로 쓸 때는 쓰는 쪽에서 `aria-hidden="true"` 를 덮어씌우세요.** 배경 별, 이펙트가 여기 해당합니다. 스크린리더가 "별이 깔린 우주 배경"을 읽을 이유가 없습니다
- 아이콘만 있는 버튼에는 버튼 쪽에 `aria-label` 을 답니다
- 색만으로 정보를 전달하지 않습니다. **먹을 것과 위험 파편은 색뿐 아니라 형태(둥근 / 뾰족한)로도 갈립니다.** 먹이 4종을 서로 다른 색상환에 배치하지 않고 전부 따뜻한 색으로 묶은 것도 같은 이유입니다 — 종류 구분은 형태가 맡습니다
- 대비비는 2절 표 참고

### ⚠️ 먹을 것 ↔ 위험 파편의 휘도 차 (일부 미적용)

**색상은 갈리는데 밝기가 거의 같았습니다.** 적록색약에서 주황과 붉은 분홍은 색상 단서가 거의 사라지므로, 휘도가 같으면 흑백으로 볼 때 구분이 안 됩니다. 이 게임에서는 **틀리면 패널티를 받는 판정**이라 미적 문제가 아닙니다.

| 먹을 것 | 원래 vs `--color-hazard` |
| --- | --- |
| `--color-debris-archive` | **1.07:1** |
| `--color-debris-metal` | 1.41:1 |
| `--color-debris-cable` | 1.51:1 |
| `--color-debris-crystal` | 2.22:1 |

**3:1은 달성할 수 없습니다.** 위험색은 어두운 배경 위에서도 보여야 해서 아래로 내려갈 한계(휘도 0.1143)가 있는데, 가장 어두운 먹이(archive, 0.2373)와 3:1을 만들려면 0.0458 이하여야 합니다. 교집합이 없습니다. 반대로 밝게 가면 휘도 1.99가 필요한데 흰색이 1.0입니다.

그래서 **기준을 2:1로 낮추고 형태 단서를 강화**하기로 했습니다. 세피아톤(아카이브형 정체성)을 지키는 쪽을 골랐습니다.

| 토큰 | 현재 | 목표 | 결과 |
| --- | --- | --- | --- |
| `--color-hazard` | `#ff3d6e` | `#c00031` | 배경 대비 3.00:1 유지 |
| `--color-debris-archive` | `#b07a50` | `#b7865f` | 2.00:1 (색조·채도 유지 = 세피아 보존) |
| `--color-debris-metal` | `#c9a05a` | 그대로 | 2.63:1 |
| `--color-debris-cable` | `#e89c3c` | 그대로 | 2.82:1 |
| `--color-debris-crystal` | `#f5c98e` | 그대로 | 4.15:1 |

**형태 강화는 적용했습니다** — 위험 파편의 어두운 외곽선을 `stroke-width` 4 → 8로 키웠습니다. 먹이에는 없는 굵은 테두리라 작은 크기에서도 색과 무관하게 갈립니다.

**토큰 값 변경은 아직 적용되지 않았습니다.** Q10(토큰 통합)에서 `tokens.css` 를 통째로 손대므로 그때 함께 반영합니다. `--color-hazard-hi`(`#ffa8be`)도 같이 조정해야 하고, 이 토큰은 `character/expressions/eyes-hurt.svg` 도 참조합니다.

---

## 8. 마일스톤별 대응표

| 마일스톤 | 쓰는 에셋 |
| --- | --- |
| **M0** 기반 ✅ | 완료됐지만 **토큰은 이식되지 않았습니다**(Q10). `ui/favicon.svg`, `ui/logo-jupsy.svg` 도 아직 붙지 않았습니다 |
| **M1** 아케이드 | `arcade/debris/*`, `arcade/hazard/*`, `arcade/background/*`, `arcade/fx/*`, `ui/icons/icon-joystick·timer·weight` |
| **M2** 누적 실적 | `ui/orbit-sector.svg`, `ui/badge/*`, `ui/icons/icon-badge·orbit·profile` |
| **M3** 캐릭터 | `character/jupsy-base.svg`, `character/expressions/*` |
| **M4** 온보딩 | `character/expressions/eyes-curious·heart`, `arcade/background/earth-limb.svg` |
| **M5** 통신 시간 | `character/expressions/eyes-sleepy`, `ui/icons/icon-signal`, `arcade/fx/signal-lost.svg` |
| **M6** 성격 유형 | `character/explorations/*` — **제안 상태. 그대로 쓰면 안 됩니다** (9절) |
| **M7** 서버·바이럴 | `ui/wordmark.svg`, `ui/logo-jupsy.svg` (공유 카드용) |

---

## 9. 이 에셋들이 결정하지 않은 것

디자인이 기획을 먼저 확정해버리지 않도록, 미확정 항목은 **틀만 만들고 내용을 비워뒀습니다.**

| 항목 | 지금 상태 | 결론 시점 |
| --- | --- | --- |
| **배지 종류와 획득 조건** | `badge-frame.svg` 는 **빈 틀**입니다. "첫 1kg 청소" 같은 개별 배지 아트를 만들지 않았습니다 | roadmap Q3 / M2 |
| **성격 유형 4종의 반영 방식** | `explorations/` 는 **제안**입니다. 몸체를 복사하지 않고 액센트 레이어만 만들어, 채택되지 않아도 버리는 비용이 작습니다 | roadmap / M6 |
| **워드마크 폰트** | `wordmark.svg` 의 한글이 `<text>` 라서 **기기 폰트에 따라 모양이 달라집니다.** 폰트를 정하면 글자를 패스로 변환해 교체하세요 | 미정 |
| **쓰레기 종류별 질량(kg) 밸런스** | 쓰레기 4종의 **겉모습만** 만들었습니다. 질량·점수는 데이터이지 에셋이 아닙니다 | roadmap Q2 / M1 |

배지 프레임에 티어별 파일을 만들지 않은 것도 같은 맥락입니다. 색만 다른 파일 3개는 토큰이 존재하는 이유와 어긋나므로, 프레임 하나에 `color` 를 `--color-badge-tier-1/2/3` 로 지정하는 방식으로 뒀습니다.
