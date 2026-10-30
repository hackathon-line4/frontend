// 손울림 디자인 시스템 v0.1 컬러 토큰 (design/tokens.json 기준)
// 상태 색은 반드시 아이콘 + 글자와 함께 사용. 색만으로 상태를 구분하지 않음.

export const palette = {
  yellow500: '#F5C84C',
  yellow100: '#FCEFC4',
  ink900: '#252525',
  ink950: '#1C1C1C',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const colors = {
  // 브랜드
  yellow500: palette.yellow500, // 주 버튼 채움, 선택 탭, 강조. 위에는 textPrimary만
  yellow100: palette.yellow100, // 아이콘 원 배경, 안내 박스, 상태 칩 배경
  ink900: palette.ink900, // 본문, 진한 버튼, 테두리 강조, '직접' 배지
  ink950: palette.ink950, // 긴급 버튼 배경

  // 배경 · 면 · 선
  bgIvory: '#FFFDF7', // 기본 화면 배경 (보호자 앱)
  surface: palette.white, // 카드, 입력창, 시트, 탭바
  surfaceSunken: '#F6F3EA', // 카드 안 보조 영역, 리듬 미리보기 배경
  surfaceMuted: '#F2EFE6', // 세그먼트 탭 트랙, 도움말 박스, 비활성 버튼
  lineSubtle: '#EEEAE0', // 목록 구분선
  line: '#E4E0D4', // 카드 테두리, 진행 막대 빈 칸, 탭바 위 선
  lineStrong: '#CFCBC0', // 선택 안 된 카드 테두리, 페이지 점
  borderInput: '#8A867C', // 입력창 테두리, 라디오 빈 원

  // 글자
  textPrimary: palette.ink900,
  textSecondary: '#4A4844',
  textTertiary: '#5C5A54',
  textDisabled: '#B5B1A6', // 비활성 아이콘 전용. 정보 글자에 쓰지 않음
  textOnDark: '#FFFDF7',

  // 상태 (fg / bg 한 쌍)
  successFg: '#1E6B3F',
  successBg: '#E3F1E8',
  infoFg: '#2D4A6B',
  infoBg: '#E8EDF3',
  warningFg: '#8A4B00',
  warningBg: '#FDF0DC',
  warningBorder: '#D9822B', // 장식용
  dangerFg: '#A3241B',
  dangerBg: '#FBE4E1',
  emergency: '#E5484D', // 긴급 버튼 아이콘 원 전용

  // 당사자 앱 고대비
  rBlack: palette.black,
  rYellow: palette.yellow500,
} as const;

export type ColorToken = keyof typeof colors;
