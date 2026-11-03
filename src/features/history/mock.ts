import { shiftDateKey, todayKey } from './date';
import type { HistoryRecord } from './types';

// 서버 연결 전 화면 확인용 (design/screens/LogList · LogDetail · LogHelp).
// 날짜는 오늘·어제 기준으로 만든다.
// TODO: 기록 API 연결. 보관 기간·삭제 정책 확정 필요.

const today = todayKey();
const yesterday = shiftDateKey(today, -1);

export const mockHistory: readonly HistoryRecord[] = [
  {
    id: 'r-visitor',
    type: 'signal',
    date: today,
    signalId: 'visitor',
    name: '누가 왔어',
    meaning: '다른 사람이 찾아왔다고 알려요',
    sentAt: '18:40:05',
    delivery: { kind: 'requesting' },
    response: null,
  },
  {
    id: 'r-waiting',
    type: 'signal',
    date: today,
    signalId: 'wait',
    name: '기다려',
    meaning: '그 자리에서 잠시 기다려 달라고 알려요',
    sentAt: '18:31:10',
    delivery: { kind: 'delivered', at: '18:31:12', vibratedAt: '18:31:12' },
    response: { kind: 'waiting', elapsedMin: 9 },
  },
  {
    id: 'r-no-reply',
    type: 'signal',
    date: today,
    signalId: 'go',
    name: '가자',
    meaning: '함께 이동하자고 알려요',
    sentAt: '18:02:30',
    delivery: { kind: 'delivered', at: '18:02:32', vibratedAt: '18:02:33' },
    response: { kind: 'noReply', waitMin: 10 },
  },
  {
    id: 'r-replied',
    type: 'signal',
    date: today,
    signalId: 'here',
    name: '나 여기 있어',
    meaning: '보호자가 가까이 있다고 알려요',
    sentAt: '17:55:02',
    delivery: { kind: 'delivered', at: '17:55:04', vibratedAt: '17:55:04' },
    response: { kind: 'replied', at: '17:58:10', afterSec: 186 },
  },
  {
    id: 'r-failed',
    type: 'signal',
    date: today,
    signalId: 'wait',
    name: '기다려',
    meaning: '그 자리에서 잠시 기다려 달라고 알려요',
    sentAt: '16:20:44',
    delivery: { kind: 'failed', reason: '네트워크 연결 끊김' },
    response: null,
  },
  {
    id: 'r-help-follow',
    type: 'signal',
    date: today,
    signalId: 'here',
    name: '나 여기 있어',
    meaning: '보호자가 가까이 있다고 알려요',
    sentAt: '14:07:20',
    delivery: { kind: 'delivered', at: '14:07:21', vibratedAt: '14:07:22' },
    response: { kind: 'replied', at: '14:08:02', afterSec: 41 },
    relatedHelpId: 'r-help',
  },
  {
    id: 'r-help',
    type: 'help',
    date: today,
    sentAt: '14:05:12',
    arrivedAt: '14:05:13',
    openedAt: '14:06:40',
    // TODO: 실제 공유 위치 (요청 순간 1회). 주소는 역지오코딩 결과
    location: {
      address: '[공유된 주소]',
      latitude: 37.5665,
      longitude: 126.978,
      at: '14:05:12',
      accuracyM: 20,
    },
    followUpIds: ['r-help-follow'],
  },
  {
    id: 'r-unknown',
    type: 'signal',
    date: yesterday,
    signalId: 'meal',
    name: '밥 먹자',
    meaning: '식사 시간이라고 알려요',
    sentAt: '19:10:00',
    delivery: { kind: 'unknown' },
    response: null,
  },
  {
    id: 'r-yesterday',
    type: 'signal',
    date: yesterday,
    signalId: 'okay',
    name: '괜찮아?',
    meaning: '괜찮은지 물어봐요',
    sentAt: '12:30:15',
    delivery: { kind: 'delivered', at: '12:30:17', vibratedAt: '12:30:17' },
    response: { kind: 'replied', at: '12:31:00', afterSec: 43 },
  },
];
