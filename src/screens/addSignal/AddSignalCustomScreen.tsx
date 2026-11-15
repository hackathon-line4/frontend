import { useState } from 'react';

import { Button, Chip, Grid, Screen, ScreenHeader, Stack, Text, TextField } from '@/components';
import { AddSignalHeader, StepIntro, TypePill } from '@/features/addSignal';
import { signalCategories, signalCategoryLabel, type SignalCategory } from '@/features/signals';

const NAME_MAX = 12;

export type CustomSignalValues = {
  name: string;
  category: SignalCategory;
  description: string;
};

type Props = {
  initialValues: CustomSignalValues;
  onBack: () => void;
  onClose: () => void;
  onNext: (values: CustomSignalValues) => void;
  /** 신호 수정에 쓸 때: 헤더 · 버튼 문구가 바뀌고 단계 안내를 숨긴다 */
  edit?: {
    /** 기본 신호는 이름을 바꿀 수 없다 (촉신호 의미 유지) */
    nameLocked: boolean;
    busy?: boolean;
    error?: string;
  };
};

// 10-3 신호 추가 1 · 직접 만들기 (design/screens/Add1Custom.dc.html)
export default function AddSignalCustomScreen({ initialValues, onBack, onClose, onNext, edit }: Props) {
  const [name, setName] = useState(initialValues.name);
  const [category, setCategory] = useState<SignalCategory>(initialValues.category);
  const [description, setDescription] = useState(initialValues.description);

  const trimmedName = name.trim();
  const nameLength = [...name].length;

  return (
    <Screen
      scroll
      gap={6}
      header={edit ? <ScreenHeader title="신호 수정" onBack={onBack} /> : <AddSignalHeader onBack={onBack} onClose={onClose} />}
      footer={
        <Button
          label={edit ? '저장하기' : '다음 · 리듬 만들기'}
          disabled={!trimmedName || edit?.busy}
          accessibilityHint={trimmedName ? undefined : '신호 이름을 입력해 주세요'}
          onPress={() => onNext({ name: trimmedName, category, description: description.trim() })}
        />
      }
    >
      {!edit && <StepIntro step={1} title="직접 만들기" titleAccessory={<TypePill type="custom" label="직접 만든 신호" />} />}
      {edit?.error && <Text accessibilityRole="alert" color="dangerFg">{edit.error}</Text>}

      <Stack gap={5}>
        <Stack gap={2}>
          <TextField
            label="신호 이름"
            value={name}
            onChangeText={setName}
            maxLength={NAME_MAX}
            returnKeyType="next"
            editable={!edit?.nameLocked}
            helper={edit?.nameLocked ? '기본 신호의 이름과 리듬은 실제 촉신호와 뜻을 맞추기 위해 바꿀 수 없어요.' : undefined}
          />
          <Stack align="flex-end">
            <Text variant="small" color="textSecondary">
              {`${nameLength} / ${NAME_MAX}자`}
            </Text>
          </Stack>
        </Stack>

        <Stack gap={2} accessibilityRole="radiogroup" accessibilityLabel="카테고리">
          <Text variant="label">카테고리</Text>
          <Grid columns={4} gap={2}>
            {signalCategories.map((value) => (
              <Chip
                key={value}
                label={signalCategoryLabel[value]}
                selected={category === value}
                onPress={() => setCategory(value)}
              />
            ))}
          </Grid>
        </Stack>

        <TextField
          label="뜻 설명 (선택)"
          value={description}
          onChangeText={setDescription}
          helper="보호자 화면과 기록에만 보여요."
        />
      </Stack>
    </Screen>
  );
}
