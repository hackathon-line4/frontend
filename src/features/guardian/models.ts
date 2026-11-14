import type { SignalStatus } from '@/components/Badge';
import type { IconName } from '@/components/Icon';
import type { HelpRequestRecord, SignalRecord } from '@/features/history/types';
import type { Activity, NoReplyRecord, RecipientStatus } from '@/features/home/types';
import type { Signal, SignalCategory } from '@/features/signals/types';
import { beatsToPulses, pulsesToBeats } from '@/theme/rhythm';
import type { GuardianHome, GuardianMessage, HelpDetail, MessageDetail, ServerSignal } from './types';
import { toDateKey } from '@/features/history/date';

export const localTime = (value: string | null | undefined) => {
  if (!value || !Number.isFinite(Date.parse(value))) return '—';
  const d = new Date(value); return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
};
const elapsed = (at: string, now: number) => Math.max(0, Math.floor((now - Date.parse(at)) / 60000));
export function toSignal(s: ServerSignal): Signal {
  const category = ({ DAILY: 'daily', OUTING: 'outing', CHECK: 'check', EMERGENCY: 'emergency' } as Record<string, SignalCategory>)[s.category] ?? 'daily';
  const icons: readonly IconName[] = ['sig-person', 'sig-bowl', 'sig-pill', 'sig-arrow', 'sig-clock', 'sig-door', 'sig-question', 'sig-lifebuoy', 'pencil', 'warning'];
  const beats = (s.rhythm ?? []).map(b => ({ SHORT: 'S', MEDIUM: 'M', LONG: 'L' } as const)[b]);
  const pulses = s.pulses?.length ? s.pulses : beatsToPulses(beats);
  return { id: s.id, name: s.name, description: s.description ?? undefined, source: s.source === 'CUSTOM' ? 'custom' : 'basic', category,
    icon: icons.includes(s.icon as IconName) ? s.icon as IconName : category === 'emergency' ? 'warning' : 'sig-person',
    pulses, beats: s.rhythm?.length ? beats : pulsesToBeats(pulses), untrained: !s.practiced };
}
export function messageStatus(m: Pick<GuardianMessage, 'delivery' | 'response'>): SignalStatus {
  if (m.delivery.status === 'FAILED') return 'failed';
  if (m.delivery.status !== 'DELIVERED') return 'unconfirmed';
  if (m.response.status === 'RESPONDED') return 'replied';
  if (m.response.status === 'NO_RESPONSE') return 'noReply';
  return m.response.status === 'WAITING' ? 'waiting' : 'delivered';
}
export function homeRecipient(home: GuardianHome, now = Date.now()): RecipientStatus {
  const r = home.recipient;
  return { name: r.name, connected: r.connection.state === 'CONFIRMED', waitMinutes: 10,
    state: r.status.type, signalName: r.status.signalName ?? undefined,
    pendingMinutes: r.status.elapsedMinutes ?? undefined,
    lastReply: r.lastResponse ? { label: r.lastResponse.signalName, minutesAgo: elapsed(r.lastResponse.respondedAt, now) } : undefined };
}
export function homeActivities(home: Pick<GuardianHome, 'recentActivities'>): Activity[] {
  const map: Record<string, SignalStatus> = { SENDING: 'unconfirmed', FAILED: 'failed', UNCONFIRMED: 'unconfirmed', WAITING: 'waiting', DELIVERED_ONLY: 'delivered', RESPONDED: 'replied', NO_RESPONSE: 'noReply' };
  return home.recentActivities.map(item => ({ id: item.id, signalName: item.title, sentAt: localTime(item.occurredAt).slice(0, 5),
    status: map[item.summaryStatus] ?? 'unconfirmed' }));
}
export function toRecord(m: GuardianMessage, now = Date.now()): SignalRecord {
  const d = new Date(m.createdAt);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const delivered = m.delivery.status === 'DELIVERED' && !!m.delivery.deliveredAt;
  const wait = m.response.waitUntil && m.delivery.deliveredAt ? Math.max(0, Math.ceil((Date.parse(m.response.waitUntil) - Date.parse(m.delivery.deliveredAt)) / 60000)) : 10;
  return { id: m.id, type: 'signal', date, signalId: m.signal.id, name: m.signal.name, meaning: m.signal.description ?? '', sentAt: localTime(m.createdAt),
    delivery: delivered ? { kind: 'delivered', at: localTime(m.delivery.deliveredAt), vibratedAt: m.playback.count > 0 ? localTime(m.playback.lastReportedAt) : undefined }
      : m.delivery.status === 'FAILED' ? { kind: 'failed', reason: '당사자 기기에 전달하지 못했어요' }
        : m.delivery.status === 'REQUESTED' ? { kind: 'requesting' } : { kind: 'unknown' },
    response: !delivered || m.kind === 'PRACTICE' ? null : m.response.status === 'RESPONDED' && m.response.respondedAt
      ? { kind: 'replied', at: localTime(m.response.respondedAt), afterSec: m.response.secondsToRespond ?? Math.max(0, Math.floor((Date.parse(m.response.respondedAt) - Date.parse(m.delivery.deliveredAt!)) / 1000)) }
      : m.response.status === 'NO_RESPONSE' ? { kind: 'noReply', waitMin: wait }
        : m.response.status === 'WAITING' ? { kind: 'waiting', elapsedMin: elapsed(m.delivery.deliveredAt!, now) } : null };
}
export function toNoReply(detail: MessageDetail): NoReplyRecord {
  const m = detail.message;
  const labels: Record<string, string> = { SENT: '보냄', REQUESTED: '보냄', DELIVERED: '기기에 도착', PLAYED: '진동 재생 (기기 보고)', RESPONDED: '화면 터치 응답', NO_RESPONSE: '화면 터치 없음', WAIT_EXTENDED: '응답 대기 연장', UNCONFIRMED: '전달 확인 안 됨', FAILED: '전달 실패', EMERGENCY_WARNING: '긴급 신호 응답 대기 알림' };
  return { id: m.id, signalId: m.signal.id, signalName: m.signal.name, recipientName: m.receiver.name,
    sentAtLabel: new Date(m.createdAt).toLocaleString(), steps: detail.timeline.map(row => ({ label: labels[row.step] ?? '상태 변경', time: localTime(row.at), done: true,
      detail: row.count ? `${row.count}회 재생 보고` : undefined })) };
}

export function helpRecords(detail: HelpDetail): { record: HelpRequestRecord; followUps: SignalRecord[] } {
  const h = detail.helpRequest;
  return {
    record: { id: h.id, type: 'help', date: toDateKey(new Date(h.sentAt)), sentAt: localTime(h.sentAt),
      arrivedAt: h.guardianDeliveredAt ? localTime(h.guardianDeliveredAt) : '확인 안 됨', openedAt: h.guardianOpenedAt ? localTime(h.guardianOpenedAt) : undefined,
      location: h.location ? { ...h.location, address: h.location.address || '주소 정보가 없어요', at: new Date(h.location.capturedAt).toLocaleString() } : null,
      followUpIds: detail.followingMessages.map(m => m.id) },
    followUps: detail.followingMessages.map(m => ({ id: m.id, type: 'signal', date: toDateKey(new Date(m.sentAt)), signalId: '', name: m.signalName, meaning: '', sentAt: localTime(m.sentAt),
      delivery: m.deliveredAt ? { kind: 'delivered', at: localTime(m.deliveredAt) } : { kind: 'unknown' },
      response: m.deliveredAt && m.respondedAt ? { kind: 'replied', at: localTime(m.respondedAt), afterSec: Math.max(0, Math.floor((Date.parse(m.respondedAt) - Date.parse(m.deliveredAt)) / 1000)) } : null })),
  };
}
