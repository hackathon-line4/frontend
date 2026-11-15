// 간격 (4px 단위). 화면·컴포넌트의 모든 여백과 gap은 이 값만 쓴다.
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28, // 섹션 사이 (Foundations '섹션 사이 28')
  8: 32,
  10: 40,
} as const;

export type SpaceToken = keyof typeof space;

export const radius = {
  xs: 10, // 세그먼트 탭 안쪽, 배지
  sm: 14, // 입력창, 작은 버튼
  md: 16, // 주 버튼, 신호 타일
  lg: 20, // 카드, 당사자 버튼
  xl: 24, // 큰 카드, 바텀시트 상단
  full: 9999, // 칩, 아바타, 원형 버튼
} as const;

// RN boxShadow 문자열 (New Architecture). 당사자 앱과 설정 목록은 그림자 없이 선만 사용.
export const shadow = {
  card: { boxShadow: '0 1px 2px rgba(37,37,37,0.06), 0 6px 16px rgba(37,37,37,0.06)' },
  sheet: { boxShadow: '0 -4px 16px rgba(37,37,37,0.08)' },
  segment: { boxShadow: '0 1px 3px rgba(37,37,37,0.12)' },
} as const;

export const touch = {
  guardianMin: 48,
  guardianPrimary: 58,
  recipientMin: 72,
  recipientPrimary: 80,
} as const;

// 화면 단위 의미 토큰 (값은 space에서 가져온다)
export const screen = {
  gutter: space[5], // 기본 화면 좌우 여백
  gutterTab: space[4], // 홈·탭 화면
  gutterRecipient: space[6], // 당사자 앱
  cardPadding: space[4],
  cardGap: space[4],
  sectionGap: space[7],
  buttonGap: space[3], // 보호자 10–12
  buttonGapRecipient: space[4], // 당사자 14 이상
} as const;
