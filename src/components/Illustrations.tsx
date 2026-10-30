import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

// design/screens/Onboarding*.dc.html 일러스트. 검정 선 + 노랑 채움만 사용.
// 감싸는 요소에 대체 텍스트를 단다.

const ink = colors.ink900;
const accent = colors.yellow500;
const paper = colors.bgIvory;

/** illust/phone-message · 진동하며 메시지를 받는 스마트폰 */
export function PhoneMessageIllustration({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220" fill="none">
      <Rect x="70" y="30" width="80" height="160" rx="18" fill={paper} stroke={ink} strokeWidth={4} />
      <Line x1="100" y1="44" x2="120" y2="44" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <Rect x="84" y="88" width="52" height="34" rx="12" fill={accent} stroke={ink} strokeWidth={3} />
      <Path d="M96 122 l-4 10 l12 -10" fill={accent} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
      <Circle cx="99" cy="105" r="3" fill={ink} />
      <Circle cx="110" cy="105" r="3" fill={ink} />
      <Circle cx="121" cy="105" r="3" fill={ink} />
      <G stroke={ink} strokeWidth={4} strokeLinecap="round">
        <Path d="M56 86 q-9 24 0 48" />
        <Path d="M40 74 q-15 36 0 72" />
        <Path d="M164 86 q9 24 0 48" />
        <Path d="M180 74 q15 36 0 72" />
      </G>
    </Svg>
  );
}

/** illust/two-way · 보호자의 글은 진동으로, 당사자의 탭 응답은 보호자에게 */
export function TwoWayIllustration({ width = 230 }: { width?: number }) {
  return (
    <Svg width={width} height={(width * 150) / 230} viewBox="0 0 230 150" fill="none">
      <Rect x="14" y="14" width="64" height="122" rx="14" fill={paper} stroke={ink} strokeWidth={4} />
      <Rect x="26" y="42" width="40" height="8" rx="4" fill={ink} />
      <Rect x="26" y="58" width="30" height="8" rx="4" fill={ink} />
      <Rect x="26" y="82" width="40" height="22" rx="8" fill={accent} stroke={ink} strokeWidth={3} />
      <Rect x="152" y="14" width="64" height="122" rx="14" fill={paper} stroke={ink} strokeWidth={4} />
      <Path d="M164 75 q7 -14 14 0 t14 0 t14 0" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <Circle cx="184" cy="108" r="10" fill={accent} stroke={ink} strokeWidth={3} />
      <G stroke={ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M92 56 h44" />
        <Path d="M128 48 l8 8 l-8 8" />
        <Path d="M138 96 h-44" />
        <Path d="M102 88 l-8 8 l8 8" />
      </G>
    </Svg>
  );
}

/** 진동 체험 버튼 안 글리프 (손가락 + 파동) */
export function TouchWaveGlyph({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <Path d="M19 12 q9 -9 18 0" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
      <Path d="M13 7 q15 -14 30 0" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
      <Line x1="28" y1="22" x2="28" y2="36" stroke={ink} strokeWidth={8} strokeLinecap="round" />
      <Rect x="17" y="32" width="24" height="20" rx="8" fill={ink} />
    </Svg>
  );
}

/** 04-G1 · 두 휴대폰을 잇는 연결 */
export function LinkPhonesIllustration({ width = 160 }: { width?: number }) {
  return (
    <Svg width={width} height={(width * 150) / 230} viewBox="0 0 230 150" fill="none">
      <Rect x="14" y="14" width="64" height="122" rx="14" fill={paper} stroke={ink} strokeWidth={5} />
      <Rect x="152" y="14" width="64" height="122" rx="14" fill={paper} stroke={ink} strokeWidth={5} />
      <Rect x="28" y="54" width="36" height="22" rx="6" fill={accent} stroke={ink} strokeWidth={3} />
      <Path d="M164 75 q7 -14 14 0 t14 0 t14 0" stroke={ink} strokeWidth={5} strokeLinecap="round" />
      <Path d="M98 75 h34" stroke={ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 10" />
      <Circle cx="115" cy="75" r="14" fill={accent} stroke={ink} strokeWidth={4} />
      <Path d="M109 75 h12 M115 69 v12" stroke={ink} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}

/** 03-3 · 보호자 (사람 + 말풍선) */
export function GuardianRoleGlyph({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Circle cx="13" cy="15" r="5.5" fill={ink} />
      <Path d="M3 34 q10 -16 20 0 z" fill={ink} />
      <Rect x="22" y="4" width="15" height="12" rx="4" stroke={ink} strokeWidth={2.5} />
      <Path d="M26 8.5h7M26 12h4" stroke={ink} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** 03-3 · 당사자 (손 + 진동) */
export function RecipientRoleGlyph({ size = 42 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      <G stroke={ink} strokeLinecap="round">
        <Line x1="63" y1="86" x2="63" y2="54" strokeWidth={12} />
        <Line x1="76" y1="84" x2="76" y2="46" strokeWidth={12} />
        <Line x1="89" y1="84" x2="89" y2="50" strokeWidth={12} />
        <Line x1="101" y1="88" x2="101" y2="60" strokeWidth={12} />
        <Line x1="60" y1="102" x2="45" y2="82" strokeWidth={12} />
        <Path d="M36 40 q-8 10 0 20" strokeWidth={8} />
        <Path d="M22 32 q-14 18 0 36" strokeWidth={8} />
        <Path d="M126 40 q8 10 0 20" strokeWidth={8} />
        <Path d="M140 32 q14 18 0 36" strokeWidth={8} />
      </G>
      <Rect x="56" y="76" width="52" height="48" rx="18" fill={ink} />
    </Svg>
  );
}

/** 04-G2 · QR 자리 표시 (실제 QR 생성 시 교체) */
export function QrPlaceholder({ size = 120 }: { size?: number }) {
  const modules: [number, number, number, number][] = [
    [48, 8, 8, 8], [60, 16, 8, 8], [48, 28, 8, 8], [64, 32, 8, 8],
    [8, 48, 8, 8], [24, 56, 8, 8], [40, 48, 8, 8], [52, 52, 16, 16],
    [76, 48, 8, 8], [96, 52, 8, 8], [104, 64, 8, 8], [84, 68, 8, 8],
    [48, 76, 8, 8], [64, 84, 8, 8], [52, 100, 8, 8], [72, 104, 8, 8],
    [88, 88, 8, 8], [104, 96, 8, 8], [96, 108, 8, 4],
  ];
  const finders = [[8, 8], [80, 8], [8, 80]];
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Rect width="120" height="120" rx="8" fill={colors.surface} />
      {finders.map(([x, y]) => (
        <G key={`${x}-${y}`}>
          <Rect x={x} y={y} width="32" height="32" rx="4" fill={ink} />
          <Rect x={x + 5} y={y + 5} width="22" height="22" rx="2" fill={colors.surface} />
          <Rect x={x + 10} y={y + 10} width="12" height="12" fill={ink} />
        </G>
      ))}
      {modules.map(([x, y, w, h]) => (
        <Rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={ink} />
      ))}
    </Svg>
  );
}

/** 04-R2 · QR 인식 틀 (카메라 미리보기 위에 겹쳐 그림) */
export function ScanFrame({ size = 260 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 260 260" fill="none">
      <G stroke={accent} strokeWidth={8} strokeLinecap="round">
        <Path d="M8 56 V24 a16 16 0 0 1 16 -16 H56" />
        <Path d="M204 8 H236 a16 16 0 0 1 16 16 V56" />
        <Path d="M252 204 V236 a16 16 0 0 1 -16 16 H204" />
        <Path d="M56 252 H24 a16 16 0 0 1 -16 -16 V204" />
      </G>
      <Rect x="85" y="85" width="90" height="90" rx="6" stroke={colors.borderInput} strokeWidth={2} strokeDasharray="6 6" />
    </Svg>
  );
}
