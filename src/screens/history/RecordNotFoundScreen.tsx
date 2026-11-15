import { Screen, ScreenHeader, ScreenTitle } from '@/components';

// 기록 id가 없거나 보관 기간이 지나 지워진 경우
export default function RecordNotFoundScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen header={<ScreenHeader title="신호 기록" onBack={onBack} />} paddingTop={3}>
      <ScreenTitle title="기록을 찾을 수 없어요" description="지워졌거나 보관 기간이 지난 기록이에요." />
    </Screen>
  );
}
