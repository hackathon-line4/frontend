import type { Link } from '@/api/types';
import type { ConnectionCheck, PartnerSettings } from './api';
import type { CalibrationSummary, ConnectionState } from './types';

export function connectionModel(link: Link | undefined, check: ConnectionCheck | null): ConnectionState {
  const status = check?.status === 'CONFIRMED' ? 'CONFIRMED' : check?.status === 'UNCONFIRMED' ? 'UNCONFIRMED' : link?.connection.state;
  const last = check?.status === 'CONFIRMED' ? check.confirmedAt : link?.connection.lastConfirmedAt;
  return { status: status === 'CONFIRMED' ? 'connected' : 'unconfirmed', lastCheckedAt: last ? new Date(last).toLocaleString() : '', linkedOn: link ? new Date(link.linkedAt).toLocaleDateString() : '아직 연결되지 않음' };
}
export function calibrationModel(partner: PartnerSettings | null): CalibrationSummary | null {
  if (!partner) return null;
  const v = partner.vibration;
  return { calibratedOn: v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() + ' 보정' : '기본값',
    strength: ({ WEAK: '약하게', NORMAL: '보통', STRONG: '강하게' } as Record<string, string>)[v.intensity ?? ''] ?? '기기 기본',
    length: ({ SHORT: '짧게', NORMAL: '보통', LONG: '길게' } as Record<string, string>)[v.length] ?? '기본', repeat: v.repeatCount };
}
