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
};

// 03-1 로그인 (design/screens/Login.dc.html)
export default function LoginScreen({ onLogin, onSignup, onForgotPassword, error }: LoginScreenProps) {
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

      <Stack gap={5}>
        <TextField
          label="이메일"
          value={email}
          onChangeText={setEmail}
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
            onChangeText={setPassword}
            placeholder="비밀번호 입력"
            password
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            error={error}
          />
          <Pressable onPress={onForgotPassword} accessibilityRole="link" style={styles.forgot}>
            <Text variant="caption" weight="medium" color="textSecondary" style={styles.underline}>
              비밀번호를 잊으셨나요?
            </Text>
          </Pressable>
        </Stack>
        <Button label="로그인" onPress={() => onLogin({ email, password })} />
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
