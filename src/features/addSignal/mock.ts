import type { IconName } from '@/components/Icon';
import type { SignalCategory } from '@/features/signals';
import type { Beat } from '@/theme';

// 서버 연결 전 화면 확인용 데이터.
// 리듬은 자리 표시용 예시 (현장 촉신호 어휘·전문가 검증 후 확정).

/** 현장 촉신호 어휘 (기본 신호 목록) */
export type BasicSignalEntry = {
  id: string;
  name: string;
  /** 보호자 화면에 보이는 뜻 */
  meaning: string;
  icon: IconName;
  category: SignalCategory;
  beats: readonly Beat[];
};

// TODO: 촉신호 어휘 API
export const basicSignalCatalog: readonly BasicSignalEntry[] = [
  { id: 'here', name: '나 여기 있어', meaning: '가까이 있다는 뜻', icon: 'sig-person', category: 'daily', beats: ['L', 'S'] },
  { id: 'sleep', name: '잘 시간', meaning: '잠잘 시간이라는 뜻', icon: 'sig-clock', category: 'daily', beats: ['L', 'L', 'L', 'S'] },
  { id: 'wash', name: '씻자', meaning: '씻으러 가자는 뜻', icon: 'sig-person', category: 'daily', beats: ['S', 'L', 'S', 'S'] },
  { id: 'bus', name: '버스 타자', meaning: '버스에 함께 타자는 뜻', icon: 'sig-arrow', category: 'outing', beats: ['S', 'S', 'L', 'L'] },
  { id: 'stairs', name: '계단 있어', meaning: '앞에 계단이 있다는 뜻', icon: 'warning', category: 'outing', beats: ['L', 'S', 'L'] },
  { id: 'sit', name: '앉아', meaning: '자리에 앉자는 뜻', icon: 'sig-person', category: 'outing', beats: ['L', 'S', 'S', 'S'] },
  { id: 'go', name: '가자', meaning: '함께 이동하자는 뜻', icon: 'sig-arrow', category: 'outing', beats: ['S', 'L', 'S'] },
  { id: 'cross', name: '길 건너자', meaning: '횡단보도를 건너자는 뜻', icon: 'sig-arrow', category: 'outing', beats: ['S', 'L', 'L'] },
  { id: 'wait', name: '기다려', meaning: '그 자리에서 기다리라는 뜻', icon: 'sig-clock', category: 'outing', beats: ['L', 'L'] },
  { id: 'visitor', name: '누가 왔어', meaning: '누군가 찾아왔다는 뜻', icon: 'sig-door', category: 'outing', beats: ['S', 'S', 'L'] },
  { id: 'okay', name: '괜찮아?', meaning: '괜찮은지 묻는 뜻', icon: 'sig-question', category: 'check', beats: ['S', 'S', 'L', 'S'] },
  { id: 'done-yet', name: '다 했어?', meaning: '끝났는지 묻는 뜻', icon: 'sig-question', category: 'check', beats: ['S', 'M', 'S'] },
  { id: 'stop', name: '멈춰', meaning: '바로 멈추라는 뜻', icon: 'warning', category: 'emergency', beats: ['L', 'L', 'L'] },
  { id: 'help', name: '도와줘', meaning: '도움이 필요하다는 뜻', icon: 'sig-lifebuoy', category: 'emergency', beats: ['M', 'M', 'M', 'M'] },
];

/** 2단계 프리셋 리듬 (design/screens/Add2Preset) */
export const rhythmPresets: readonly (readonly Beat[])[] = [
  ['S', 'S', 'S'],
  ['L', 'S', 'S'],
  ['S', 'L', 'S'],
  ['S', 'S', 'L'],
  ['L', 'L', 'S'],
  ['S', 'L', 'L'],
  ['L', 'S', 'L'],
  ['S', 'S', 'S', 'S'],
];

// TODO: 당사자 진동 보정(06) 저장값에서 가져오기
export const mockRecipientVibration = '세기 강하게 · 반복 2번';
