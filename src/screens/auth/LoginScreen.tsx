import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Logo, Screen, ScreenTitle, Text, TextField } from '@/components';
import { fontFamily } from '@/theme';

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
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <Text color="textSecondary" style={styles.footerText}>
            아직 계정이 없나요?
          </Text>
          <Button label="회원가입" variant="secondary" onPress={onSignup} style={styles.stretch} />
        </View>
      }
    >
      <Logo size="sm" />
      <ScreenTitle title="다시 만나서 반가워요" description="이메일로 로그인해 주세요." style={styles.title} />

      <View style={styles.form}>
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
          <Text variant="caption" color="textSecondary" style={styles.forgotText}>
            비밀번호를 잊으셨나요?
          </Text>
        </Pressable>
        <Button label="로그인" onPress={() => onLogin({ email, password })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 36,
  },
  title: {
    marginTop: 40,
  },
  form: {
    marginTop: 36,
    gap: 20,
  },
  forgot: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: -8,
  },
  forgotText: {
    fontFamily: fontFamily.medium,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 15,
  },
  stretch: {
    alignSelf: 'stretch',
  },
});
