import { Button, Screen, ScreenHeader, ScreenTitle, Stack } from '@/components';
import {
  HintList,
  StatusPill,
  StepperCard,
  calibrationTitle,
  canDecrease,
  canIncrease,
  device,
  ranges,
  valueCaption,
  valueLabel,
  type CalibrationKey,
  type CalibrationValues,
} from '@/features/calibration';
import { useRoleScale } from '@/features/session';

type Props = {
  values: CalibrationValues;
  /** 저장값과 다름 → '바꾼 설정 · 아직 저장 안 함' */
  isDraft: boolean;
  onBack: () => void;
  onStep: (key: CalibrationKey, delta: 1 | -1) => void;
  onTest: () => void;
};

const stepLabels: Record<CalibrationKey, [decrease: string, increase: string]> = {
  strength: ['세기 낮추기', '세기 높이기'],
  length: ['길이 줄이기', '길이 늘리기'],
  repeat: ['반복 줄이기', '반복 늘리기'],
};

// 06-1 내 진동 설정 · 두 역할 공통 (design/screens/Calib1.dc.html)
export default function CalibrationSettingsScreen({ values, isDraft, onBack, onStep, onTest }: Props) {
  const scale = useRoleScale();
  const keys: CalibrationKey[] = device.strengthSupported ? ['strength', 'length'] : ['length'];

  return (
    <Screen
      scroll
      gap={4}
      paddingTop={1}
      header={<ScreenHeader onBack={onBack} size={scale.headerSize} />}
      footer={<Button label="진동 테스트" icon="play" size={scale.buttonSize} onPress={onTest} />}
    >
      <ScreenTitle
        title="내 진동 설정"
        description="나에게 잘 느껴지는 진동으로 맞춰요."
        size={scale.titleSize}
        descriptionSize={scale.descriptionSize}
      />
      {isDraft ? (
        <StatusPill icon="pencil" label="바꾼 설정 · 아직 저장 안 함" tone="brand" live />
      ) : (
        <StatusPill icon="check" label="저장된 설정" tone="muted" live />
      )}
      <Stack gap={3}>
        {!device.strengthSupported && (
          <HintList items={[{ icon: 'info', text: '이 기기는 세기를 바꿀 수 없어요' }]} textVariant={scale.bodyVariant} />
        )}
        {keys.map((key) => {
          const [decreaseLabel, increaseLabel] = stepLabels[key];
          return (
            <StepperCard
              key={key}
              title={calibrationTitle[key]}
              note={key === 'strength' ? `이 기기: ${ranges.strength.max}단계까지` : undefined}
              value={valueLabel(key, values[key])}
              caption={valueCaption(key, values[key])}
              decreaseLabel={decreaseLabel}
              increaseLabel={increaseLabel}
              canDecrease={canDecrease(values, key)}
              canIncrease={canIncrease(values, key)}
              onDecrease={() => onStep(key, -1)}
              onIncrease={() => onStep(key, 1)}
            />
          );
        })}
      </Stack>
    </Screen>
  );
}
