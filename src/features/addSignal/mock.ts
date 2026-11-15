import type { IconName } from '@/components/Icon';
import { fromBeats, fromPulses, tactilePulses, type Signal, type SignalCategory } from '@/features/signals';
import type { Beat } from '@/theme';

// 서버 연결 전 화면 확인용 데이터.
// 촉신호 변환 규칙으로 만든 신호는 진동 배열(tactilePulses)을 쓰고,
// 촉신호 원문이 아직 없는 신호는 박자로 자리 표시한다 (원문을 받으면 같은 규칙으로 변환).

/** 현장 촉신호 어휘 (기본 신호 목록) */
export type BasicSignalEntry = {
  id: string;
  name: string;
  /** 보호자 화면에 보이는 뜻 */
  meaning: string;
  icon: IconName;
  category: SignalCategory;
} & Pick<Signal, 'pulses' | 'beats'>;

// TODO: 촉신호 어휘 API
export const basicSignalCatalog: readonly BasicSignalEntry[] = [
  { id: 'meal', name: '밥 먹자', meaning: '같이 밥 먹자는 뜻', icon: 'sig-bowl', category: 'daily', ...fromPulses(tactilePulses.meal) },
  { id: 'here', name: '나 여기 있어', meaning: '가까이 있다는 뜻', icon: 'sig-person', category: 'daily', ...fromPulses(tactilePulses.here) },
  { id: 'sleep', name: '잘 시간', meaning: '잠잘 시간이라는 뜻', icon: 'sig-clock', category: 'daily', ...fromBeats(['L', 'L', 'L', 'S']) },
  { id: 'wash', name: '씻자', meaning: '씻으러 가자는 뜻', icon: 'sig-person', category: 'daily', ...fromBeats(['S', 'L', 'S', 'S']) },
  { id: 'bus', name: '버스 타자', meaning: '버스에 함께 타자는 뜻', icon: 'sig-arrow', category: 'outing', ...fromBeats(['S', 'S', 'L', 'L']) },
  { id: 'stairs', name: '계단 있어', meaning: '앞에 계단이 있다는 뜻', icon: 'warning', category: 'outing', ...fromBeats(['L', 'S', 'L']) },
  { id: 'sit', name: '앉아', meaning: '자리에 앉자는 뜻', icon: 'sig-person', category: 'outing', ...fromBeats(['L', 'S', 'S', 'S']) },
  { id: 'go', name: '가자', meaning: '함께 이동하자는 뜻', icon: 'sig-arrow', category: 'outing', ...fromPulses(tactilePulses.go) },
  { id: 'cross', name: '길 건너자', meaning: '횡단보도를 건너자는 뜻', icon: 'sig-arrow', category: 'outing', ...fromBeats(['S', 'L', 'L']) },
  { id: 'wait', name: '기다려', meaning: '그 자리에서 기다리라는 뜻', icon: 'sig-clock', category: 'outing', ...fromPulses(tactilePulses.wait) },
  { id: 'visitor', name: '누가 왔어', meaning: '누군가 찾아왔다는 뜻', icon: 'sig-door', category: 'outing', ...fromPulses(tactilePulses.visitor) },
  { id: 'okay', name: '괜찮아?', meaning: '괜찮은지 묻는 뜻', icon: 'sig-question', category: 'check', ...fromBeats(['S', 'S', 'L', 'S']) },
  { id: 'done-yet', name: '다 했어?', meaning: '끝났는지 묻는 뜻', icon: 'sig-question', category: 'check', ...fromBeats(['S', 'M', 'S']) },
  { id: 'danger', name: '위험해', meaning: '위험하니 바로 멈추라는 뜻', icon: 'warning', category: 'emergency', ...fromPulses(tactilePulses.danger) },
  { id: 'help', name: '도와줘', meaning: '도움이 필요하다는 뜻', icon: 'sig-lifebuoy', category: 'emergency', ...fromBeats(['M', 'M', 'M', 'M']) },
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
  // 원래 S·S·S·S였지만 진동이 기본 신호 '가자'(두드림 4번)와 같아 항상 '사용 중'이 되어 바꿈 (서버 시드와 같게)
  ['S', 'S', 'L', 'L'],
];

// TODO: 당사자 진동 보정(06) 저장값에서 가져오기
export const mockRecipientVibration = '세기 강하게 · 반복 2번';
