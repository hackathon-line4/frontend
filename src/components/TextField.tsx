import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fontFamily, radius, space } from '@/theme';

import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Text } from './Text';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  /** 라벨은 항상 위에 보이게 (placeholder로 대신하지 않음) */
  label: string;
  helper?: string;
  error?: string;
  /** 확인 완료 문구 (예: '비밀번호가 일치해요') */
  success?: string;
  /** 비밀번호 입력: 눈 아이콘 버튼 표시 */
  password?: boolean;
};

export function TextField({ label, helper, error, success, password, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const state = error ? 'error' : focused || success ? 'focus' : 'default';

  return (
    <View style={styles.root}>
      <Text variant="label" weight="medium">
        {label}
      </Text>
      <View style={[styles.box, boxStyles[state]]}>
        <TextInput
          {...rest}
          accessibilityLabel={label}
          // aria-describedby 대신 helper/error를 힌트로 전달
          accessibilityHint={error ?? success ?? helper}
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
            size={20}
            touchSize={42}
            strokeWidth={2}
            color={colors.textSecondary}
          />
        )}
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <Icon name="warning" size={16} color={colors.dangerFg} />
          <Text variant="caption" color="dangerFg" style={styles.medium}>
            {error}
          </Text>
        </View>
      ) : success ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <Svg width={18} height={18} viewBox="0 0 24 24" accessible={false}>
            <Circle cx="12" cy="12" r="11" fill={colors.yellow500} stroke={colors.ink900} strokeWidth={1.5} />
            <Path
              d="M7 12.5l3.2 3.2L17 9"
              fill="none"
              stroke={colors.ink900}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text variant="caption" style={styles.medium}>
            {success}
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
    gap: space[2],
  },
  box: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingRight: space[1],
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: space[4],
    paddingVertical: 0,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  medium: {
    fontFamily: fontFamily.medium,
    flexShrink: 1,
  },
});

const boxStyles = StyleSheet.create({
  default: { borderWidth: 1, borderColor: colors.borderInput },
  focus: { borderWidth: 1.5, borderColor: colors.ink900 },
  error: { borderWidth: 1.5, borderColor: colors.dangerFg },
});
