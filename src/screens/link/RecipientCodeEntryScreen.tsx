import { useState } from 'react';

import { Button, CodeInput, OrDivider, Screen, ScreenHeader, ScreenTitle, Stack, Text } from '@/components';
import { LINK_CODE_LENGTH } from '@/features/link/code';

type Props = {
  onBack: () => void;
  onScanQr: () => void;
  onSubmit: (code: string) => void;
  /** 실패 (코드 틀림·만료·거절) */
  error?: string;
  busy?: boolean;
  onChange?: () => void;
};

// 04-R1 당사자 · 코드 입력 (design/screens/LinkR1.dc.html)
// 6자리가 모두 입력되면 '연결 요청하기' 활성화.
export default function RecipientCodeEntryScreen({ onBack, onScanQr, onSubmit, error, busy, onChange }: Props) {
  const [code, setCode] = useState('');
  const complete = code.length === LINK_CODE_LENGTH;
  const countText = `${LINK_CODE_LENGTH}자리 중 ${code.length}자리 입력`;

  return (
    <Screen
      scroll
      header={<ScreenHeader size="lg" onBack={onBack} />}
      paddingTop={4}
      gap={8}
      footer={
        <Button
          label={busy ? '확인하고 있어요…' : '연결 요청하기'}
          size="lg"
          disabled={!complete || busy}
          onPress={() => onSubmit(code)}
          accessibilityHint={complete ? undefined : countText}
        />
      }
    >
      <Stack gap={7}>
        <ScreenTitle title="연결 코드 입력" description="보호자에게 받은 숫자 6자리" size={30} descriptionSize={18} />
        <Stack gap={3}>
          <CodeInput
            editable={!busy}
            value={code}
            onChangeText={(value) => { setCode(value); onChange?.(); }}
            size="lg"
            accessibilityLabel="연결 코드 입력, 보호자에게 받은 숫자 6자리"
            accessibilityHint={countText}
          />
          <Text weight="medium" color={error ? 'dangerFg' : 'textSecondary'} accessibilityLiveRegion="polite">
            {error ?? countText}
          </Text>
        </Stack>
      </Stack>

      <Stack gap={5}>
        <OrDivider />
        <Button label="QR 코드로 연결" icon="qr-scan" variant="secondary" size="lg" onPress={onScanQr} disabled={busy} />
      </Stack>
    </Screen>
  );
}
