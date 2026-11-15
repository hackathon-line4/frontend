import { useState } from 'react';

import { Button, Screen, Stack } from '@/components';
import { AddSignalHeader, MethodCard, StepIntro } from '@/features/addSignal';

export type AddSignalMethod = 'list' | 'custom';

type Props = {
  initialMethod?: AddSignalMethod;
  onBack: () => void;
  onClose: () => void;
  onNext: (method: AddSignalMethod) => void;
  /**
   * 기본 신호는 연결할 때 모두 추가된다. 보호자가 지운 기본 신호가 있을 때만 이 화면이 나오며,
   * 그때 첫 선택지는 '기본 신호 다시 추가'가 된다. (미리보기에서는 원래 문구)
   */
  restoreCount?: number;
};

// 10-1 신호 추가 1 · 종류 선택 (design/screens/Add1Choose.dc.html)
export default function AddSignalChooseScreen({ initialMethod = 'list', onBack, onClose, onNext, restoreCount }: Props) {
  const [method, setMethod] = useState<AddSignalMethod>(initialMethod);

  return (
    <Screen
      scroll
      gap={6}
      header={<AddSignalHeader onBack={onBack} onClose={onClose} />}
      footer={<Button label="다음" onPress={() => onNext(method)} />}
    >
      <StepIntro step={1} eyebrow="1단계 · 어떤 신호인가" title={'어떤 신호를\n추가할까요?'} />
      <Stack gap={3} accessibilityRole="radiogroup" accessibilityLabel="신호 추가 방법">
        <MethodCard
          icon="book"
          title={restoreCount ? '기본 신호 다시 추가' : '촉신호 목록에서 고르기'}
          description={
            restoreCount
              ? `지운 기본 신호 ${restoreCount}개를 다시 추가할 수 있어요. 리듬은 촉신호 그대로예요.`
              : '현장에서 쓰는 촉신호 어휘에서 골라요. 리듬이 미리 정해져 있어요.'
          }
          type="basic"
          typeLabel="기본 신호"
          selected={method === 'list'}
          onPress={() => setMethod('list')}
        />
        <MethodCard
          icon="pencil"
          title="직접 만들기"
          description="우리 가족만 쓰는 신호를 이름과 리듬부터 새로 만들어요."
          type="custom"
          typeLabel="직접 만든 신호"
          selected={method === 'custom'}
          onPress={() => setMethod('custom')}
        />
      </Stack>
    </Screen>
  );
}
