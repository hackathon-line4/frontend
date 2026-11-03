import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';

import { colors, fontFamily, radius, space } from '@/theme';

import { Text } from './Text';

type CodeInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  /** 보이는 라벨. 화면 제목이 라벨 역할을 하면 생략하고 accessibilityLabel만 준다 */
  label?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  length?: number;
  /** md: 보호자 56 · lg: 당사자 72 */
  size?: 'md' | 'lg';
  autoFocus?: boolean;
};

// 연결 코드 입력. 실제 입력창은 숫자 입력창 1개 (스크린리더·점자 디스플레이 호환), 칸은 시각 표시용.
export function CodeInput({
  value,
  onChangeText,
  label,
  accessibilityLabel,
  accessibilityHint,
  length = 6,
  size = 'md',
  autoFocus,
}: CodeInputProps) {
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  const s = sizes[size];

  return (
    <View style={styles.root}>
      {label && (
        <Text variant="label" accessible={false}>
          {label}
        </Text>
      )}
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false}>
        <View style={[styles.cells, { gap: s.gap }]} importantForAccessibility="no-hide-descendants">
          {Array.from({ length }, (_, i) => {
            const char = value[i];
            const isCurrent = focused && !char && i === value.length;
            return (
              <View
                key={i}
                style={[
                  styles.cell,
                  { height: s.height, borderRadius: s.radius },
                  char ? styles.filled : isCurrent ? styles.current : styles.empty,
                ]}
              >
                {char ? (
                  <Text style={[styles.char, { fontSize: s.font, lineHeight: s.font + 6 }]}>{char}</Text>
                ) : (
                  isCurrent && size === 'lg' && <View style={styles.caret} />
                )}
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, length))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={length}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={accessibilityLabel ?? `${label ?? '연결 코드'}, 숫자 ${length}자리`}
          accessibilityHint={accessibilityHint}
          caretHidden
          style={styles.hiddenInput}
        />
      </Pressable>
    </View>
  );
}

const sizes = {
  md: { height: 56, radius: radius.xs, gap: space[2], font: 26 },
  lg: { height: 72, radius: radius.sm, gap: space[2], font: 34 },
} as const;

const styles = StyleSheet.create({
  root: {
    gap: space[2],
  },
  cells: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { borderWidth: 2, borderColor: colors.ink900 },
  current: { borderWidth: 4, borderColor: colors.ink900, backgroundColor: colors.yellow100 },
  empty: { borderWidth: 2, borderColor: colors.borderInput },
  char: {
    fontFamily: fontFamily.monoBold,
  },
  caret: {
    width: 3,
    height: 32,
    backgroundColor: colors.ink900,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
});
