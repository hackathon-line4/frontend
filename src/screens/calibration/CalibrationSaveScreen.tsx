import { Button, Screen, ScreenTitle, Stack, Text } from '@/components';
import {
  HintList,
  SummaryList,
  calibrationTitle,
  device,
  valueLabel,
  type CalibrationKey,
  type CalibrationValues,
} from '@/features/calibration';
import { useRoleScale } from '@/features/session';

type Props = {
  values: CalibrationValues;
  onSave: () => void;
  onRetest: () => void;
  busy?: boolean;
  error?: string;
};

// 06-5 설정 저장 · 두 역할 공통 (design/screens/Calib5.dc.html)
export default function CalibrationSaveScreen({ values, onSave, onRetest, busy = false, error }: Props) {
  const scale = useRoleScale();
  const keys: CalibrationKey[] = device.strengthSupported ? ['strength', 'length', 'repeat'] : ['length', 'repeat'];

  return (
    <Screen
      scroll
      gap={5}
      paddingTop={10}
      footer={
        <Stack gap={scale.buttonGap}>
          {error && <Text variant={scale.bodyVariant} accessibilityRole="alert" color="dangerFg">{error}</Text>}
          <Button label={busy ? '저장 중이에요' : error ? '다시 저장하기' : '설정 저장하기'} disabled={busy} icon="save" size={scale.buttonSize} onPress={onSave} />
          <Button label="다시 테스트하기" disabled={busy} icon="retry" variant="secondary" size={scale.buttonSize} onPress={onRetest} />
        </Stack>
      }
    >
      <ScreenTitle title={'이 설정으로\n저장할까요?'} size={scale.titleSize} />
      <SummaryList
        large={scale.isRecipient}
        items={keys.map((key) => [calibrationTitle[key], valueLabel(key, values[key])] as [string, string])}
      />
      <HintList
        textVariant={scale.bodyVariant}
        items={[
          { icon: 'lock', text: '신호의 뜻은 바뀌지 않아요. 느낌의 세기와 길이만 바뀌어요.' },
          { icon: 'book', text: '신호끼리 잘 구분되는지는 촉신호 연습에서 확인해 보세요.' },
          { icon: 'retry', text: '설정 > 내 진동 설정에서 언제든 다시 맞출 수 있어요.' },
        ]}
      />
    </Screen>
  );
}
