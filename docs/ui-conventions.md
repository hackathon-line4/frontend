# 손울림 UI 구현 규칙

와이어프레임(`design/screens/*.dc.html`)을 React Native 화면으로 옮길 때 지키는 규칙이에요.
`{{accent}}`는 `colors.yellow500`, `{{tint}}`·`{{bg}}`는 `colors.yellow100`·`colors.bgIvory`로 읽어요.

## 1. 디자인 값은 토큰으로만

| 종류 | 쓰는 것 | 쓰지 않는 것 |
|---|---|---|
| 색 | `colors.*` (`@/theme`), `Text`의 `color` prop | `'#252525'` 같은 hex 직접 입력 |
| 글자 | `Text`의 `variant` (`typography`) | 화면에서 `fontSize`·`fontFamily` 직접 지정 |
| 간격 | `Stack`/`Row`/`Grid`의 `gap`, `Screen`의 `gap`·`paddingTop`, `space[n]`·`screen.*` | `marginTop: 28` 같은 숫자 |
| 모서리 | `radius.*` | `borderRadius: 16` |
| 터치 영역 | `touch.*`, `useRoleScale().minTouch` | 임의 높이 |

- 요소 사이는 **margin이 아니라 부모의 gap**으로 띄워요. 화면 파일에 `margin*` 스타일을 두지 않아요.
- 하단 고정 버튼은 `Screen`의 `footer`, 본문 사이 빈 공간은 `Spacer`를 써요.
- 같은 너비로 나누는 배치는 `Grid columns={n} gap={…}`를 써요 (예: 홈 신호 2×3).
- 컴포넌트 고유 크기(아이콘 24, 아바타 64, 일러스트 280 등)는 숫자로 두되, **컴포넌트 안**에만 두고 화면에서는 prop으로 고르게 해요.
- 와이어프레임 값이 토큰과 조금 다르면 가장 가까운 토큰을 써요 (예: 14 → `space[3]`/`space[4]`, 15px 글자 → `label`/`caption`).

## 2. 컴포넌트

- 먼저 `@/components`에 있는 것을 써요: `Screen`, `ScreenHeader`, `ScreenTitle`, `Stack`, `Row`, `Grid`, `Spacer`, `Button`, `IconButton`, `TextField`, `CodeInput`, `Card`, `ListRow`, `InfoBox`, `SignalTile`, `SignalBadge`, `StatusChip`, `Rhythm`, `Tag`, `Note`, `StatusMessage`, `Avatar`, `ProfileRow`, `DefinitionList`, `SuccessMark`, `ChoiceCard`, `RadioCard`, `SegmentedTabs`, `Chip`, `SwitchRow`, `CheckboxRow`, `StepBar`, `PageDots`, `TabBar`, `BottomSheet`, `StickyAction`, `RecipientScreen`, `Icon`.
- 여러 화면에서 쓸 부품이면 `src/components/`에 새 파일로 만들고 `index.ts`에 export를 추가해요. 한 기능에서만 쓰면 `src/features/<기능>/`에 둬요.
- 아이콘은 `src/components/Icon.tsx`의 `icons`에 추가해요 (24×24, currentColor 선). 일러스트는 `src/components/Illustrations.tsx`.

## 3. 화면 구조

```
src/app/<경로>.tsx          라우트: router 연결 + 데이터 주입만 (얇게)
src/screens/<영역>/XScreen.tsx   화면 UI: 이동은 onBack·onSubmit 같은 콜백 prop으로 받음
src/features/<기능>/        타입 · mock 데이터 · 훅 · 기능 전용 컴포넌트
```

- 서버 연결 전 데이터는 `src/features/<기능>/mock.ts`에 두고, 연결할 자리에 `// TODO:` 를 남겨요.
- 진동·카메라·지도·위치 권한은 UI만 만들고 `// TODO:` 로 표시해요.

## 4. 보호자 / 당사자 분기

- 역할은 전역 스토어 `@/features/session`의 `useRole()` / `setRole()`로 관리해요. 나중에 서버 응답으로 `setRole`을 호출하면 돼요.
- 역할별 화면은 `src/app/guardian/*`, `src/app/recipient/*`에 있고 `RoleGate`가 다른 역할을 막아요.
- 두 역할이 함께 쓰는 화면(`src/app/calibration/*` 등)은 `useRoleScale()`로 버튼·제목·본문·행 높이·간격 크기를 골라요. 역할을 route param으로 받지 않아요.
- 당사자 화면: 주요 버튼 72 이상(`size="lg"`), 본문 18 이상, 행 높이 80 이상, 설명은 꼭 필요한 문장만.

## 5. 문구 · 접근성

- 문구, `aria-label`, 상태 정의는 와이어프레임과 `design/screen-map.md` 원문 그대로.
- 상태는 색 + 아이콘 + 글자를 함께. '읽음', '이해함' 표현 금지.
- `aria-label` → `accessibilityLabel`, `role=img` → `accessibilityRole="image"`, `aria-pressed/checked/selected` → `accessibilityState`, `role=status` → `accessibilityLiveRegion="polite"`.
- 장식 SVG는 스크린리더에서 숨겨요 (`Icon`은 기본으로 숨김).
