import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button, CodeInput, OrDivider, Screen, ScreenHeader, ScreenTitle, Text } from '@/components';
import { LINK_CODE_LENGTH } from '@/features/link/code';
import { fontFamily } from '@/theme';

type Props = {
  onBack: () => void;
  onScanQr: () => void;
  onSubmit: (code: string) => void;
  /** 실패 (코드 틀림·만료·거절) */
  error?: string;
};

// 04-R1 당사자 · 코드 입력 (design/screens/LinkR1.dc.html)
// 6자리가 모두 입력되면 '연결 요청하기' 활성화.
export default function RecipientCodeEntryScreen({ onBack, onScanQr, onSubmit, error }: Props) {
  const [code, setCode] = useState('');
  const complete = code.length === LINK_CODE_LENGTH;
  const countText = `${LINK_CODE_LENGTH}자리 중 ${code.length}자리 입력`;

  return (
    <Screen
      scroll
      header={<ScreenHeader size="lg" onBack={onBack} />}
      footer={
        <Button
          label="연결 요청하기"
          size="lg"
          disabled={!complete}
          onPress={() => onSubmit(code)}
          accessibilityHint={complete ? undefined : countText}
        />
      }
    >
      <ScreenTitle title="연결 코드 입력" description="보호자에게 받은 숫자 6자리" size={30} descriptionSize={18} style={styles.title} />

      <CodeInput
        value={code}
        onChangeText={setCode}
        size="lg"
        accessibilityLabel="연결 코드 입력, 보호자에게 받은 숫자 6자리"
        accessibilityHint={countText}
      />
      <Text color={error ? 'dangerFg' : 'textSecondary'} style={styles.count} accessibilityLiveRegion="polite">
        {error ?? countText}
      </Text>

      <OrDivider style={styles.or} />
      <Button label="QR 코드로 연결" icon="qr-scan" variant="secondary" size="lg" onPress={onScanQr} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 16,
    marginBottom: 28,
  },
  count: {
    marginTop: 12,
    fontFamily: fontFamily.medium,
  },
  or: {
    marginTop: 32,
    marginBottom: 20,
  },
});
