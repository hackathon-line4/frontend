import type { IconName } from '@/components/Icon';
import type { Beat, Pulses } from '@/theme';

export type SignalCategory = 'daily' | 'outing' | 'check' | 'emergency';

export const signalCategoryLabel: Record<SignalCategory, string> = {
  daily: '일상',
  outing: '외출',
  check: '확인',
  emergency: '긴급',
};

export const signalCategories: readonly SignalCategory[] = ['daily', 'outing', 'check', 'emergency'];

export type Signal = {
  id: string;
  name: string;
  description?: string;
  icon: IconName;
  /** basic: 현장 촉신호 어휘에서 가져온 신호 · custom: 보호자가 만든 신호 */
  source: 'basic' | 'custom';
  category: SignalCategory;
  /**
   * 진동 배열 [울림, 쉼, …] ms. 진동 재생·길이 계산은 이 값으로만 한다.
   * basic: 촉신호 변환 규칙으로 만든 값 · custom: 직접 조합한 박자에서 만든 값
   */
  pulses: Pulses;
  /** 그림·스크린리더용 박자 (울림 하나당 박자 하나). basic은 pulses에서 만든다 */
  beats: readonly Beat[];
  /** 아직 당사자에게 알려 주지 않음 → '연습 전' */
  untrained?: boolean;
};
