# Jupsy Arcade - Multi-Theme Design Integration Guide

우주를 비행하는 아케이드 게임 `joop-02-M1`을 위한 4가지 멀티 테마 SVG 에셋팩입니다.
기존의 플랫한 디자인부터 레트로, 감성적인 로파이, 강렬한 사이버펑크까지 제공되며, 
개발 팀에서 유저 설정이나 인게임 스테이지에 따라 동적으로 테마를 스위칭할 수 있도록 구성되었습니다.

## 🎨 제공되는 4가지 테마

1. **`01_flat_vector` (디폴트 플랫 벡터)**: 깔끔하고 모던한 아케이드 스타일.
2. **`02_cassette_futurism` (카세트 퓨처리즘)**: 80년대 CRT 모니터 기반의 레트로 픽셀/와이어프레임 스타일. 스캔라인 디테일.
3. **`03_cozy_space` (코지 스페이스)**: 둥글고 푹신한 파스텔톤 우주. 로파이(Lofi) 힙합 감성의 성운 배경과 부드러운 오브젝트.
4. **`04_neon_cyberpunk` (네온 사이버펑크)**: 칠흑 같은 우주 속 날카로운 형광 네온사인. 고속 비행에 어울리는 강렬한 시안/마젠타 대비.

---

## 💻 개발팀 적용 가이드 (React / Next.js)

모든 테마 폴더는 동일한 파일 구조와 동일한 파일명(`jupsy-base.svg`, `blade.svg` 등)을 공유합니다.
따라서 상위 폴더 경로(테마 이름)만 상태(State)로 관리하면 시스템 전체의 디자인을 원클릭으로 교체할 수 있습니다.

### 1. 상태 관리를 통한 테마 스위칭 예시

```tsx
import { useState } from 'react';

const THEMES = ['01_flat_vector', '02_cassette_futurism', '03_cozy_space', '04_neon_cyberpunk'];

export default function GameStage() {
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

  return (
    <div className="game-container">
      {/* 배경 렌더링 */}
      <img src={`/design_themes/${currentTheme}/background/starfield.svg`} className="bg-full" />
      
      {/* 캐릭터 렌더링 (레이어 합성) */}
      <div className="character-wrapper">
        <img src={`/design_themes/${currentTheme}/character/jupsy-base.svg`} />
        <img src={`/design_themes/${currentTheme}/character/eyes-happy.svg`} />
      </div>
      
      {/* 테마 스위처 UI */}
      <div className="settings">
        {THEMES.map(theme => (
          <button key={theme} onClick={() => setCurrentTheme(theme)}>
            {theme}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 2. 키보드 타격감과의 연계 (권장 UX)
게임 특성상 키보드로 조작할 때, 특히 **텐키리스 청축 키보드처럼 찰칵거리는 기계식 키보드의 타격감**을 선호하는 유저라면 `02_cassette_futurism` 또는 `04_neon_cyberpunk` 테마를 적용했을 때 만족도가 극대화됩니다. UI 반응성(버튼 다운) 시 화면의 SVG에 CSS `transform: scale(0.95)`나 약간의 `drop-shadow` 점멸 효과를 추가하면 플레이어에게 압도적인 손맛을 제공할 수 있습니다.

### 3. 참고: 필터(Filter) 및 글로우(Glow) 효과
테마별로 `<filter>` 및 `<feGaussianBlur>`가 SVG 내부에 자체 내장되어 있습니다. 별도의 포스트 프로세싱이나 CSS 그림자를 주입하지 않아도 파일 자체로 빛이 납니다. (Canvas 렌더링 시 브라우저 지원 여부를 확인하세요.)
