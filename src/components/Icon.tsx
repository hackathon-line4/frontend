import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

// design/screens/DS-Assets 의 ic/* · sig/* 아이콘.
// 24×24 그리드, 선 굵기 2 (16px 이하는 2.6), 끝·모서리 둥글게.
const icons = {
  // UI
  back: () => <Path d="M15 5l-7 7 7 7" />,
  close: () => <Path d="M6 6l12 12M18 6L6 18" />,
  'chevron-right': () => <Path d="M9 5l7 7-7 7" />,
  'chevron-down': () => <Path d="M6 9l6 6 6-6" />,
  plus: () => <Path d="M12 5v14M5 12h14" />,
  check: () => <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  retry: () => <Path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
  search: () => (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20 20l-4-4" />
    </>
  ),
  bell: () => <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" />,
  eye: () => (
    <>
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <Circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': () => (
    <>
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <Circle cx="12" cy="12" r="3" />
      <Path d="M3 3l18 18" />
    </>
  ),
  lock: () => (
    <>
      <Rect x="5" y="11" width="14" height="10" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  calendar: () => (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  share: () => <Path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />,
  external: () => (
    <Path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  ),
  copy: () => (
    <>
      <Rect x="8" y="8" width="12" height="12" rx="2" />
      <Path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </>
  ),
  backspace: () => <Path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM12 9l6 6M18 9l-6 6" />,

  // 탭
  'tab-home': () => <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  'tab-signal': () => (
    <>
      <Circle cx="5" cy="12" r="2" />
      <Path d="M10 12h9" />
    </>
  ),
  'tab-location': () => (
    <>
      <Path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
      <Circle cx="12" cy="10" r="2.5" />
    </>
  ),
  'tab-history': () => <Path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" />,
  'tab-settings': () => (
    <>
      <Path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
      <Circle cx="16" cy="6" r="2" />
      <Circle cx="10" cy="12" r="2" />
      <Circle cx="18" cy="18" r="2" />
    </>
  ),

  // 상태 · 기능
  warning: () => <Path d="M12 3l10 18H2zM12 10v5M12 18v.5" />,
  info: () => (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 11v6M12 7.5v.5" />
    </>
  ),
  'no-reply': () => (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  waiting: () => <Path d="M7 3h10M7 21h10M8 3v3l4 6-4 6v3M16 3v3l-4 6 4 6v3" />,
  link: () => (
    <Path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" />
  ),
  'link-off': () => (
    <Path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1M3 3l18 18" />
  ),
  reply: () => <Path d="M9 14l-4-4 4-4M5 10h9a5 5 0 0 1 5 5v4" />,
  device: () => (
    <>
      <Rect x="6" y="2" width="12" height="20" rx="3" />
      <Path d="M10 18h4" />
    </>
  ),
  vibrate: () => (
    <>
      <Rect x="8" y="3" width="8" height="18" rx="2" />
      <Path d="M4 9v6M20 9v6" />
    </>
  ),
  send: () => <Path d="M21.5 2.5L2.5 10.2l7.3 3.1 3.1 7.7zM21.5 2.5L9.8 13.3" />,
  play: (color: string) => (
    <Path
      d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"
      fill={color}
      stroke="none"
    />
  ),
  book: () => <Path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM4 17a2 2 0 0 1 2-2h12" />,
  pencil: () => <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  'qr-scan': () => (
    <>
      <Path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
      <Rect x="7" y="7" width="4" height="4" />
      <Rect x="13" y="7" width="4" height="4" />
      <Rect x="7" y="13" width="4" height="4" />
      <Path d="M14 14h3v3" />
    </>
  ),
  save: () => <Path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM7 3v5h8V3M7 21v-7h10v7" />,

  // 신호 아이콘 (중립적인 사물만. 손동작·진동 모양은 그리지 않음)
  'sig-door': (color: string) => (
    <>
      <Path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18" />
      <Circle cx="14.5" cy="12" r="1" fill={color} />
    </>
  ),
  'sig-person': () => (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  'sig-arrow': () => <Path d="M4 12h14M13 6l6 6-6 6" />,
  'sig-clock': () => (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  'sig-bowl': () => <Path d="M3 11h18a9 9 0 0 1-18 0zM9 7c0-2 2-2 2-4M14 7c0-2 2-2 2-4" />,
  'sig-pill': () => <Path d="M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7zM7 10l7 7" />,
  'sig-question': () => (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17v.5" />
    </>
  ),
  'sig-lifebuoy': () => (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="12" cy="12" r="4" />
      <Path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" />
    </>
  ),
} satisfies Record<string, (color: string) => ReactNode>;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

// 장식용: 스크린리더에서 숨김. 의미가 있으면 감싸는 요소에 레이블을 단다.
export function Icon({ name, size = 24, color = colors.textPrimary, strokeWidth }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth ?? (size <= 16 ? 2.6 : 2)}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {icons[name](color)}
    </Svg>
  );
}
