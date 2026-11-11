import { Button, Screen, ScreenTitle, Stack, Text } from '@/components';

export function GuardianFeedback({ message, onRetry, onLink }: { message: string; onRetry?: () => void; onLink?: () => void }) {
  return <Screen paddingTop={6}><Stack gap={4}>
    <ScreenTitle title={message} />
    {onRetry && <Button label="다시 시도" onPress={onRetry} />}
    {onLink && <><Text>계정을 연결하면 신호를 보내고 상태를 확인할 수 있어요.</Text><Button label="당사자 연결하기" onPress={onLink} /></>}
  </Stack></Screen>;
}
