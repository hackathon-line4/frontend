import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Button, Logo, Screen, ScreenTitle, Stack, Text, TextField } from '@/components';
import { touch } from '@/theme';

type LoginScreenProps = {
  onLogin: (form: { email: string; password: string }) => void;
  onSignup: () => void;
  onForgotPassword?: () => void;
  /** 로그인 실패 문구 (서버 응답) */
  error?: string;
  errorField?: string;
  onFormChange?: () => void;
  busy?: boolean;
  retryAfterSec?: number;
};

// 03-1 로그인 (design/screens/Login.dc.html)
export default function LoginScreen({ onLogin, onSignup, onForgotPassword, error, errorField, onFormChange, busy, retryAfterSec = 0 }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen
      scroll
      paddingTop={8}
      gap={10}
      footer={
        <Stack gap={3}>
          <Text variant="label" weight="regular" color="textSecondary" style={styles.center}>
            아직 계정이 없나요?
          </Text>
          <Button label="회원가입" variant="secondary" onPress={onSignup} />
        </Stack>
      }
    >
      <Logo size="sm" />
      <ScreenTitle title="다시 만나서 반가워요" description="이메일로 로그인해 주세요." />

      <Stack gap={6}>
        {error && errorField !== 'password' && <Text accessibilityRole="alert" color="dangerFg">{error}</Text>}
        <TextField
          label="이메일"
          value={email}
          onChangeText={(value) => { setEmail(value); onFormChange?.(); }}
          editable={!busy}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <Stack gap={3}>
          <TextField
            label="비밀번호"
            value={password}
            onChangeText={(value) => { setPassword(value); onFormChange?.(); }}
            editable={!busy}
            placeholder="비밀번호 입력"
            password
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            error={errorField === 'password' ? error : undefined}
          />
          <Pressable onPress={onForgotPassword} accessibilityRole="link" style={styles.forgot}>
            <Text variant="caption" weight="medium" color="textSecondary" style={styles.underline}>
              비밀번호를 잊으셨나요?
            </Text>
          </Pressable>
        </Stack>
        <Button label={busy ? '로그인 중…' : retryAfterSec > 0 ? `${retryAfterSec}초 후 다시 시도` : '로그인'} disabled={busy || retryAfterSec > 0 || !email.trim() || !password} onPress={() => onLogin({ email, password })} />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
    minHeight: touch.guardianMin,
    justifyContent: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  center: {
    textAlign: 'center',
  },
});
