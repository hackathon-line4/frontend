import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';

import { colors, fontFamily } from '@/theme';

import { Text } from './Text';

type CodeInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  length?: number;
  autoFocus?: boolean;
};

// 연결 코드 입력. 실제 입력창 1개 + 시각용 칸.
export function CodeInput({
  value,
  onChangeText,
  label = '연결 코드',
  length = 6,
  autoFocus,
}: CodeInputProps) {
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.root}>
      <Text variant="label" accessible={false}>
        {label}
      </Text>
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false}>
        <View style={styles.cells} importantForAccessibility="no-hide-descendants">
          {Array.from({ length }, (_, i) => {
            const char = value[i];
            const isCurrent = focused && i === Math.min(value.length, length - 1) && !char;
            return (
              <View
                key={i}
                style={[styles.cell, char ? styles.filled : isCurrent ? styles.current : styles.empty]}
              >
                <Text style={styles.char}>{char ?? ''}</Text>
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
          accessibilityLabel={`${label}, 숫자 ${length}자리`}
          caretHidden
          style={styles.hiddenInput}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  cells: {
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { borderWidth: 2, borderColor: colors.ink900 },
  current: { borderWidth: 4, borderColor: colors.ink900, backgroundColor: colors.yellow100 },
  empty: { borderWidth: 2, borderColor: colors.borderInput },
  char: {
    fontFamily: fontFamily.monoBold,
    fontSize: 26,
    lineHeight: 32,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
});
