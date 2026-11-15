import { Children, type ReactNode } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { space, type SpaceToken } from '@/theme';

// 레이아웃 기본 단위. 요소 사이 간격은 margin 대신 부모의 gap(space 토큰)으로만 준다.

type FlexAlign = ViewStyle['alignItems'];
type FlexJustify = ViewStyle['justifyContent'];

type BoxProps = Omit<ViewProps, 'style'> & {
  children?: ReactNode;
  /** 자식 사이 간격 (space 토큰) */
  gap?: SpaceToken;
  align?: FlexAlign;
  justify?: FlexJustify;
  /** 남는 공간 채우기 */
  flex?: boolean;
  /** 안쪽 여백 (space 토큰) */
  padding?: SpaceToken;
  paddingX?: SpaceToken;
  paddingY?: SpaceToken;
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
};

function boxStyle(
  direction: 'row' | 'column',
  { gap = 0, align, justify, flex, padding, paddingX, paddingY, wrap }: BoxProps,
): ViewStyle {
  return {
    flexDirection: direction,
    gap: space[gap],
    alignItems: align,
    justifyContent: justify,
    flex: flex ? 1 : undefined,
    flexWrap: wrap ? 'wrap' : undefined,
    padding: padding !== undefined ? space[padding] : undefined,
    paddingHorizontal: paddingX !== undefined ? space[paddingX] : undefined,
    paddingVertical: paddingY !== undefined ? space[paddingY] : undefined,
  };
}

/** 세로 쌓기 */
export function Stack({ style, children, ...props }: BoxProps) {
  return (
    <View {...props} style={[boxStyle('column', props), style]}>
      {children}
    </View>
  );
}

/** 가로 나란히 (기본 세로 가운데 정렬) */
export function Row({ style, children, align = 'center', ...props }: BoxProps) {
  return (
    <View {...props} style={[boxStyle('row', { align, ...props }), style]}>
      {children}
    </View>
  );
}

/** 남는 공간을 차지해 앞뒤 요소를 밀어낸다 (하단 고정 버튼 등) */
export function Spacer() {
  return <View style={{ flex: 1 }} />;
}

type GridProps = {
  children: ReactNode;
  /** 한 줄에 들어갈 칸 수 */
  columns: number;
  gap?: SpaceToken;
  style?: StyleProp<ViewStyle>;
};

/** 같은 너비 칸으로 나누는 격자. 마지막 줄의 빈 칸은 자리만 차지한다. */
export function Grid({ children, columns, gap = 3, style }: GridProps) {
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));

  return (
    <Stack gap={gap} style={style}>
      {rows.map((row, r) => (
        <Row key={r} gap={gap} align="stretch">
          {Array.from({ length: columns }, (_, c) => (
            <View key={c} style={{ flex: 1 }}>
              {row[c]}
            </View>
          ))}
        </Row>
      ))}
    </Stack>
  );
}
