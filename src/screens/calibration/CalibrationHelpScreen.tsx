import { Button, Screen, ScreenHeader, ScreenTitle, Stack } from '@/components';
import {
  HintList,
  OptionCard,
  StatusPill,
  canIncrease,
  device,
  valueLabel,
  type CalibrationKey,
  type CalibrationValues,
} from '@/features/calibration';
import { useRoleScale } from '@/features/session';

type Props = {
  values: CalibrationValues;
  onBack: () => void;
  /** 고른 값을 1단계 올리고 바로 06-2 */
  onChoose: (key: Exclude<CalibrationKey, 'strength'>) => void;
  onBackToSettings: () => void;
};

const options = [
  { key: 'length', icon: 'lengthen', title: '길이를 길게' },
  { key: 'repeat', icon: 'repeat', title: '반복을 늘리기' },
] as const;

// 06-4 다른 설정 시험하기 · 두 역할 공통 (design/screens/Calib4.dc.html)
// '조금 더 강하게'를 골랐지만 세기가 이미 최대(또는 세기 조절 미지원)일 때
export default function CalibrationHelpScreen({ values, onBack, onChoose, onBackToSettings }: Props) {
  const scale = useRoleScale();
  const available = options.filter(({ key }) => canIncrease(values, key));

  return (
    <Screen
      scroll
      gap={6}
      paddingTop={1}
      header={<ScreenHeader onBack={onBack} size={scale.headerSize} />}
      footer={<Button label="처음 설정으로 돌아가기" variant="dark" size={scale.buttonSize} onPress={onBackToSettings} />}
    >
      <Stack gap={3}>
        <StatusPill
          icon="info"
          label={device.strengthSupported ? '세기가 이미 가장 강해요' : '이 기기는 세기를 바꿀 수 없어요'}
          tone="brand"
          live
        />
        <ScreenTitle
          title={'다른 방법도\n시험해 볼까요?'}
          description={available.length > 0 ? '하나를 고르면 바로 테스트해요.' : undefined}
          size={scale.isRecipient ? 28 : 24}
          descriptionSize={scale.descriptionSize}
        />
      </Stack>
      {available.length > 0 && (
        <Stack gap={scale.buttonGap}>
          {available.map(({ key, icon, title }) => (
            <OptionCard
              key={key}
              icon={icon}
              title={title}
              caption={`${valueLabel(key, values[key])} → ${valueLabel(key, values[key] + 1)}`}
              large={scale.isRecipient}
              onPress={() => onChoose(key)}
            />
          ))}
        </Stack>
      )}
      <HintList
        boxed
        accessibilityLabel="도움말"
        textVariant={scale.bodyVariant}
        items={[
          { icon: 'phone', text: '두꺼운 케이스를 빼거나, 휴대폰을 손바닥에 올려 시험해 보세요.' },
          { icon: 'people', text: '그래도 어렵다면 보호자와 함께 다시 맞춰 보세요.' },
        ]}
      />
    </Screen>
  );
}
