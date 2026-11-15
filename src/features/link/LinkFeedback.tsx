import { Button, Screen, Text } from '@/components';

export function LinkFeedback({ message, onRetry, onBack, busy = false }: { message: string; onRetry?: () => void; onBack?: () => void; busy?: boolean }) {
  return <Screen gap={4} reserveHeader="lg">
    <Text accessibilityRole={busy ? undefined : 'alert'} accessibilityLiveRegion="polite">{message}</Text>
    {onRetry && <Button label="다시 시도" size="lg" onPress={onRetry} disabled={busy} />}
    {onBack && <Button label="돌아가기" size="lg" variant="secondary" onPress={onBack} disabled={busy} />}
  </Screen>;
}
