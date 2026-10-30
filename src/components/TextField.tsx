import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fontFamily, radius } from '@/theme';

import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Text } from './Text';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  /** 라벨은 항상 위에 보이게 (placeholder로 대신하지 않음) */
  label: string;
  helper?: string;
  error?: string;
  /** 비밀번호 입력: 눈 아이콘 버튼 표시 */
  password?: boolean;
};

export function TextField({ label, helper, error, password, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const state = error ? 'error' : focused ? 'focus' : 'default';

  return (
    <View style={styles.root}>
      <Text variant="label">{label}</Text>
      <View style={[styles.box, boxStyles[state]]}>
        <TextInput
          {...rest}
          accessibilityLabel={label}
          // aria-describedby 대신 helper/error를 힌트로 전달
          accessibilityHint={error ?? helper}
          secureTextEntry={password ? hidden : rest.secureTextEntry}
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
        />
        {password && (
          <IconButton
            icon={hidden ? 'eye' : 'eye-off'}
            accessibilityLabel={hidden ? '비밀번호 보기' : '비밀번호 숨기기'}
            onPress={() => setHidden((v) => !v)}
            size={22}
          />
        )}
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <Icon name="warning" size={16} color={colors.dangerFg} />
          <Text variant="caption" color="dangerFg" style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : (
        helper && (
          <Text variant="caption" color="textSecondary">
            {helper}
          </Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  box: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    fontFamily: fontFamily.regular,
    fontSize: 17,
    color: colors.textPrimary,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontFamily: fontFamily.medium,
  },
});

const boxStyles = StyleSheet.create({
  default: { borderWidth: 1.5, borderColor: colors.borderInput },
  focus: { borderWidth: 2, borderColor: colors.ink900 },
  error: { borderWidth: 2, borderColor: colors.dangerFg },
});
