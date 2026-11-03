import type { IconName } from '@/components/Icon';
import type { Beat } from '@/theme';

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
  icon: IconName;
  /** basic: 현장 촉신호 어휘에서 가져온 신호 · custom: 보호자가 만든 신호 */
  source: 'basic' | 'custom';
  category: SignalCategory;
  /** 신호 사전(Signal registry)의 리듬. 진동 패턴은 이 값에서만 만든다 */
  beats: readonly Beat[];
  /** 아직 당사자에게 알려 주지 않음 → '연습 전' */
  untrained?: boolean;
};
