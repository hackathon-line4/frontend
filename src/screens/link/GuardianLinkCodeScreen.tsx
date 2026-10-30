import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Share, StyleSheet, View } from 'react-native';

import { Button, Screen, ScreenHeader, ScreenTitle, StatusMessage } from '@/components';
import { formatLinkCode } from '@/features/link/code';
import { LinkCodeCard } from '@/features/link/LinkCodeCard';
import { useCountdown } from '@/features/link/useCountdown';

type Props = {
  code: string;
  /** 코드 만료 시각 (ms) */
  expiresAt: number;
  onBack: () => void;
  onRenew: () => void;
};

// 04-G2 보호자 · 연결 코드 (design/screens/LinkG2.dc.html)
// 만료되면 코드 영역에 '만료됨' 표시, '새 코드 만들기'를 주 버튼으로 바꾼다.
export default function GuardianLinkCodeScreen({ code, expiresAt, onBack, onRenew }: Props) {
  const remaining = useCountdown(expiresAt);
  const expired = remaining <= 0;
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  useEffect(() => {
    if (expired) AccessibilityInfo.announceForAccessibility('연결 코드가 만료됐어요. 새 코드를 만들어 주세요.');
  }, [expired]);

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    AccessibilityInfo.announceForAccessibility('연결 코드를 복사했어요');
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const share = () =>
    Share.share({ message: `손울림 연결 코드: ${formatLinkCode(code)}\n손울림 앱에서 '연결 코드 입력'에 넣어 주세요.` });

  return (
    <Screen
      scroll
      header={<ScreenHeader title="계정 연결" onBack={onBack} />}
      footer={
        expired ? (
          <Button label="새 코드 만들기" icon="retry" onPress={onRenew} />
        ) : (
          <View>
            <StatusMessage icon="more">당사자의 입력을 기다리고 있어요</StatusMessage>
            <Button label="새 코드 만들기" variant="text" onPress={onRenew} style={styles.renew} />
          </View>
        )
      }
    >
      <ScreenTitle title={'당사자 휴대폰에\n이 코드를 입력해 주세요'} size={24} style={styles.title} />
      <View style={styles.card}>
        <LinkCodeCard code={code} remainingSeconds={remaining} />
      </View>
      <View style={styles.actions}>
        <Button
          label={copied ? '복사됨' : '코드 복사'}
          icon={copied ? 'check' : 'copy'}
          variant="secondary"
          size="sm"
          disabled={expired}
          onPress={copy}
          style={styles.action}
        />
        <Button
          label="공유하기"
          icon="share"
          variant="secondary"
          size="sm"
          disabled={expired}
          onPress={share}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 12,
  },
  card: {
    marginTop: 20,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
  },
  renew: {
    marginTop: 8,
  },
});
