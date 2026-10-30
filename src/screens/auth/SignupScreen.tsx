import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, CheckboxRow, Screen, ScreenHeader, ScreenTitle, Text, TextField } from '@/components';
import { isValidEmail, isValidPassword, PASSWORD_RULE } from '@/features/auth/validation';
import { fontFamily } from '@/theme';

type SignupScreenProps = {
  onSubmit: (form: { email: string; password: string }) => void;
  onBack: () => void;
  onLogin: () => void;
};

// 03-2 회원가입 (design/screens/Signup.dc.html)
// 입력을 마치고 다음 칸으로 이동할 때 검사. 필수 약관에 동의해야 '가입하기' 활성화.
export default function SignupScreen({ onSubmit, onBack, onLogin }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });

  const touch = (field: keyof typeof touched) => setTouched((t) => ({ ...t, [field]: true }));

  const emailOk = isValidEmail(email);
  const passwordOk = isValidPassword(password);
  const confirmOk = confirm.length > 0 && confirm === password;
  const canSubmit = emailOk && passwordOk && confirmOk && agreed;

  return (
    <Screen
      scroll
      header={<ScreenHeader onBack={onBack} />}
      footer={
        <View>
          <Button
            label="가입하기"
            disabled={!canSubmit}
            onPress={() => onSubmit({ email, password })}
            accessibilityHint={!agreed ? '약관에 동의해 주세요' : undefined}
          />
          {!agreed && (
            <Text variant="caption" color="textSecondary" style={styles.hint}>
              약관에 동의해 주세요
            </Text>
          )}
          <View style={styles.loginRow}>
            <Text color="textSecondary" style={styles.loginText}>
              이미 계정이 있나요?
            </Text>
            <Pressable onPress={onLogin} accessibilityRole="link" style={styles.loginLink}>
              <Text style={[styles.loginText, styles.bold]}>로그인</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <ScreenTitle title="회원가입" description="보호자와 당사자 모두 같은 방법으로 가입해요." style={styles.title} />

      <View style={styles.form}>
        <TextField
          label="이메일"
          value={email}
          onChangeText={setEmail}
          onBlur={() => touch('email')}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={touched.email && !emailOk ? '이메일 주소를 다시 확인해 주세요' : undefined}
        />
        <TextField
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          onBlur={() => touch('password')}
          password
          autoComplete="new-password"
          textContentType="newPassword"
          helper={PASSWORD_RULE}
          error={touched.password && !passwordOk ? PASSWORD_RULE : undefined}
        />
        <TextField
          label="비밀번호 확인"
          value={confirm}
          onChangeText={setConfirm}
          onBlur={() => touch('confirm')}
          password
          autoComplete="new-password"
          textContentType="newPassword"
          success={confirmOk ? '비밀번호가 일치해요' : undefined}
          error={touched.confirm && confirm.length > 0 && !confirmOk ? '비밀번호가 일치하지 않아요' : undefined}
        />
        <CheckboxRow
          checked={agreed}
          onChange={setAgreed}
          accessibilityLabel="필수, 이용약관 및 개인정보 처리방침에 동의해요"
        >
          <Text style={styles.terms}>
            <Text style={[styles.terms, styles.bold]}>[필수]</Text> 이용약관 및 개인정보 처리방침에 동의해요
          </Text>
        </CheckboxRow>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: fontFamily.extraBold },
  title: {
    marginTop: 16,
  },
  form: {
    marginTop: 28,
    gap: 18,
  },
  terms: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  hint: {
    marginTop: 8,
    textAlign: 'center',
  },
  loginRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    minHeight: 44,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
});
