import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Button, CheckboxRow, Row, Screen, ScreenHeader, ScreenTitle, Stack, Text, TextField } from '@/components';
import { isValidEmail, isValidPassword, PASSWORD_RULE } from '@/features/auth/validation';
import { space, touch } from '@/theme';

export type SignupForm = { email: string; password: string; name: string; agreements: { terms: boolean; privacy: boolean } };
type SignupScreenProps = {
  onSubmit: (form: SignupForm) => void;
  onBack: () => void;
  onLogin: () => void;
  busy?: boolean;
  error?: string;
  errorField?: string;
};

// 03-2 회원가입 (design/screens/Signup.dc.html)
// 입력을 마치고 다음 칸으로 이동할 때 검사. 필수 약관에 동의해야 '가입하기' 활성화.
export default function SignupScreen({ onSubmit, onBack, onLogin, busy, error, errorField }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });

  const markTouched = (field: keyof typeof touched) => setTouched((t) => ({ ...t, [field]: true }));

  const emailOk = isValidEmail(email);
  const passwordOk = isValidPassword(password);
  const confirmOk = confirm.length > 0 && confirm === password;
  const canSubmit = name.trim().length >= 1 && name.trim().length <= 20 && emailOk && passwordOk && confirmOk && agreed;

  return (
    <Screen
      scroll
      header={<ScreenHeader onBack={onBack} />}
      paddingTop={4}
      gap={7}
      footer={
        <Stack gap={2}>
          <Button
            label={busy ? '가입 중…' : '가입하기'}
            disabled={!canSubmit || busy}
            onPress={() => onSubmit({ email, password, name, agreements: { terms: agreed, privacy: agreed } })}
            accessibilityHint={!agreed ? '약관에 동의해 주세요' : undefined}
          />
          {!agreed && (
            <Text variant="caption" color="textSecondary" style={styles.center}>
              약관에 동의해 주세요
            </Text>
          )}
          <Row justify="center" gap={1}>
            <Text variant="label" weight="regular" color="textSecondary">
              이미 계정이 있나요?
            </Text>
            <Pressable onPress={onLogin} accessibilityRole="link" style={styles.loginLink}>
              <Text variant="label">로그인</Text>
            </Pressable>
          </Row>
        </Stack>
      }
    >
      <ScreenTitle title="회원가입" description="보호자와 당사자 모두 같은 방법으로 가입해요." />

      <Stack gap={5}>
        {error && errorField !== 'email' && errorField !== 'name' && <Text accessibilityRole="alert">{error}</Text>}
        <TextField label="이름" value={name} onChangeText={setName} maxLength={20} autoComplete="name" error={errorField === 'name' ? error : undefined} />
        <TextField
          label="이메일"
          value={email}
          onChangeText={setEmail}
          onBlur={() => markTouched('email')}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={errorField === 'email' ? error : touched.email && !emailOk ? '이메일 주소를 다시 확인해 주세요' : undefined}
        />
        <TextField
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          onBlur={() => markTouched('password')}
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
          onBlur={() => markTouched('confirm')}
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
          <Text variant="label" weight="medium">
            <Text variant="label">[필수]</Text> 이용약관 및 개인정보 처리방침에 동의해요
          </Text>
        </CheckboxRow>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  loginLink: {
    minHeight: touch.guardianMin,
    paddingHorizontal: space[1],
    justifyContent: 'center',
  },
});
