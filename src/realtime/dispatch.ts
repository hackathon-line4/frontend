import type { IncomingMessage } from '@/api/types';
import { isGuardianMessage } from '@/features/guardian/api';
import type { GuardianMessage } from '@/features/guardian/types';
import type { ServerEvent } from './parser';

export function createEventDispatcher(options: {
  role: () => string | null; valid: () => boolean;
  onMessage: (message: GuardianMessage) => void;
  onIncoming: (message: IncomingMessage) => void;
  onSession: () => void;
  onRefresh: () => void;
}) {
  return (event: ServerEvent) => {
    if (!options.valid()) return;
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    if (!data || typeof data !== 'object') return;
    if (event.event === 'message.updated' && options.role() === 'guardian' && isGuardianMessage(data.message)) {
      options.onMessage(data.message);
    } else if (event.event === 'message.created' && options.role() === 'recipient') {
      const m = data.message as IncomingMessage | undefined;
      if (m?.id && m.signal && m.playbackPolicy && ['SIGNAL', 'PRACTICE'].includes(m.kind)) options.onIncoming(m);
    } else if (event.event.startsWith('link.') || event.event.startsWith('link_request.')) {
      options.onSession();
    }
    if (/^(message|recipient_signal|help_request|connection_check|location|settings)\./.test(event.event)) options.onRefresh();
  };
}
