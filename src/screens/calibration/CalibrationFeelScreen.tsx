import { Button, Screen, ScreenTitle, Stack } from '@/components';
import { StatusPill } from '@/features/calibration';
import { useRoleScale } from '@/features/session';

type Props = {
  /** 세기 강하게 · 길이 보통 · 반복 2번 */
  summary: string;
  onGood: () => void;
  onStronger: () => void;
  onRetest: () => void;
};

// 06-3 진동 느낌 확인 · 두 역할 공통 (design/screens/Calib3.dc.html)
export default function CalibrationFeelScreen({ summary, onGood, onStronger, onRetest }: Props) {
  const scale = useRoleScale();

  return (
    <Screen
      gap={4}
      paddingTop={10}
      footer={
        <Stack gap={scale.buttonGap}>
          <Button label="잘 느껴져요" icon="check" size={scale.buttonSize} onPress={onGood} />
          <Button label="조금 더 강하게" icon="arrow-up" variant="secondary" size={scale.buttonSize} onPress={onStronger} />
          <Button label="다시 테스트하기" icon="retry" variant="secondary" size={scale.buttonSize} onPress={onRetest} />
        </Stack>
      }
    >
      <StatusPill icon="check" label="테스트 끝" tone="outline" live />
      <ScreenTitle
        title={'진동이 잘\n느껴졌나요?'}
        description={summary}
        size={scale.titleSize}
        descriptionSize={scale.descriptionSize}
      />
    </Screen>
  );
}
