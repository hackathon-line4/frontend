import type { IncomingMessage } from '@/api/types';

export type ServerSignal = {
  id: string; name: string; description: string | null; source: string; category: string; icon: string | null;
  rhythm: IncomingMessage['signal']['rhythm']; pulses: number[] | null; practiced: boolean; durationMs: number;
};
export type GuardianMessage = {
  id: string; linkId: string; kind: 'SIGNAL' | 'PRACTICE'; isEmergency: boolean;
  signal: { id: string; name: string; description: string | null };
  sender: { id: string; name: string }; receiver: { id: string; name: string }; createdAt: string;
  delivery: { status: 'REQUESTED' | 'DELIVERED' | 'UNCONFIRMED' | 'FAILED'; deliveredAt: string | null; failureReason: string | null };
  playback: { count: number; lastReportedAt: string | null };
  response: { status: 'WAITING' | 'RESPONDED' | 'NO_RESPONSE' | null; respondedAt: string | null; waitUntil: string | null; secondsToRespond: number | null; late: boolean };
};
export type MessageDetail = {
  message: GuardianMessage;
  timeline: { step: string; at: string; count: number | null }[];
  canResend: boolean; canExtendWait: boolean;
};
export type HistoryItem = {
  id: string; kind: 'GUARDIAN_SIGNAL' | 'PRACTICE' | 'RECIPIENT_SIGNAL' | 'HELP_REQUEST';
  title: string; description: string | null; occurredAt: string;
  delivery: { status: string; at: string | null; failureReason: string | null };
  response: { status: string; at: string | null } | null; summaryStatus: string;
};
export type GuardianHome = {
  recipient: { id: string; name: string; connection: { state: string; lastConfirmedAt: string | null };
    status: { type: 'OK' | 'WAITING' | 'NO_RESPONSE' | 'HELP_REQUESTED'; messageId: string | null; signalName: string | null; elapsedMinutes: number | null };
    lastResponse: { messageId: string; signalName: string; respondedAt: string } | null };
  favoriteSignals: ServerSignal[]; location: { sharingEnabled: boolean; last: unknown }; recentActivities: HistoryItem[];
};
export type HelpDetail = {
  helpRequest: { id: string; linkId: string; sender: { id: string; name: string }; sentAt: string;
    guardianDeliveredAt: string | null; guardianOpenedAt: string | null; locationStatus: string;
    location: { latitude: number; longitude: number; accuracyM: number; address: string | null; capturedAt: string } | null };
  followingMessages: { id: string; signalName: string; sentAt: string; deliveredAt: string | null; respondedAt: string | null }[];
};
export type GuardianScope = { key: string; linkId: string; userId: string };
