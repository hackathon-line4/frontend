import { ApiError } from '@/api';

import { canRetryRecipient, type RecipientApi, type SendBody, type SendKind } from './api';

export type RecipientContext = { owner: string; linkId: string };

/** A manual retry of an uncertain creation reuses both its body and creation key. */
export function createRecipientSender(options: {
  api: Pick<RecipientApi, 'send'>;
  context: () => RecipientContext | null;
  createKey: () => string;
  feedback: (kind: 'sent' | 'failed') => void;
}) {
  const pending = new Map<SendKind, { context: RecipientContext; body: SendBody; key: string; flight?: Promise<boolean> }>();
  return function send(kind: SendKind, signal?: AbortSignal): Promise<boolean> {
    const context = options.context();
    if (!context || signal?.aborted) {
      if (!signal?.aborted) options.feedback('failed');
      return Promise.resolve(false);
    }
    let intent = pending.get(kind);
    if (intent?.context.owner !== context.owner || intent.context.linkId !== context.linkId) intent = undefined;
    if (intent?.flight) return intent.flight;
    intent ??= { context, body: { sentAt: new Date().toISOString() }, key: options.createKey() };
    pending.set(kind, intent);
    const current = intent;
    const stillCurrent = () => {
      const next = options.context();
      return !signal?.aborted && next?.owner === context.owner && next.linkId === context.linkId;
    };
    current.flight = (async () => {
      try {
        await options.api.send(kind, context.linkId, current.body, current.key, signal);
        if (!stillCurrent()) return false;
        if (pending.get(kind) === current) pending.delete(kind);
        options.feedback('sent');
        return true;
      } catch (error) {
        // Abort/timeouts can happen after the server committed. Keep the intent for a manual retry.
        if (!canRetryRecipient(error) && !(error instanceof ApiError && ['ABORTED', 'INVALID_RESPONSE'].includes(error.code))) {
          if (pending.get(kind) === current) pending.delete(kind);
        }
        if (stillCurrent()) options.feedback('failed');
        return false;
      } finally { current.flight = undefined; }
    })();
    return current.flight;
  };
}
