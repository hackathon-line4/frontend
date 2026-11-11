import { canRetryRecipient, type RecipientApi } from './api';
import type { IncomingSignal } from './incoming';
import { NO_REPLY_TIMEOUT_MS } from './timing';

export type DeliveryExit = 'replied' | 'dismissed' | 'timeout';

/** One received message, including its retry state. Pause on blur/background; dispose on replacement. */
export function createIncomingDelivery(options: {
  signal: IncomingSignal;
  api: Pick<RecipientApi, 'acknowledge' | 'playback' | 'respond'>;
  valid: () => boolean;
  preview?: boolean;
  play: (onPlay: () => void, remainingMaxMs?: number) => () => void;
  feedback: (kind: 'sent' | 'failed') => void;
  onReplying: (replying: boolean) => void;
  onDone: (reason: DeliveryExit) => void;
}) {
  const { signal } = options;
  const receivedAt = signal.receivedAt ?? new Date().toISOString();
  let deadline = signal.waitUntil ? Date.parse(signal.waitUntil) : Date.now() + NO_REPLY_TIMEOUT_MS;
  let active: AbortController | undefined;
  let disposed = false;
  let finished = false;
  let acknowledged = false;
  let touchedAt: string | undefined;
  let replyPending = false;
  let playCount = 0;
  let reportedCount = 0;
  let reporting = false;
  let stopPlaying: (() => void) | undefined;
  let firstPlaybackAt: number | undefined;
  let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
  const retries = new Set<ReturnType<typeof setTimeout>>();
  const stopPlayback = () => { stopPlaying?.(); stopPlaying = undefined; };
  const current = (scope: AbortController) => active === scope && !scope.signal.aborted && !finished && options.valid();

  function pause() {
    active?.abort(); active = undefined;
    retries.forEach(clearTimeout); retries.clear();
    clearTimeout(deadlineTimer); stopPlayback(); reporting = false;
  }
  function finish(reason: DeliveryExit) {
    if (finished || !active || !current(active)) return;
    finished = true; pause();
    if (reason === 'replied') options.feedback('sent');
    options.onDone(reason);
  }
  function scheduleDeadline() {
    clearTimeout(deadlineTimer);
    if (replyPending || !active) return;
    const remaining = Math.max(0, deadline - Date.now());
    deadlineTimer = setTimeout(() => finish('timeout'), remaining);
  }
  function retry<T>(
    scope: AbortController,
    job: () => Promise<T>,
    success: (result: T) => void,
    terminal: () => void,
    transient?: () => void,
  ) {
    let failures = 0;
    const attempt = async () => {
      if (!current(scope)) return;
      try {
        const result = await job();
        if (current(scope)) success(result);
      } catch (error) {
        if (!current(scope)) return;
        if (!canRetryRecipient(error)) { terminal(); return; }
        transient?.();
        const delay = Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5));
        const timer = setTimeout(() => { retries.delete(timer); void attempt(); }, delay);
        retries.add(timer);
      }
    };
    void attempt();
  }
  function reportPlayback(scope: AbortController) {
    if (options.preview || reporting || playCount <= reportedCount || !current(scope)) return;
    reporting = true;
    let sentCount = playCount;
    retry(scope, () => {
      sentCount = playCount;
      return options.api.playback(signal.messageId, sentCount, scope.signal);
    }, () => {
      reporting = false; reportedCount = sentCount;
      reportPlayback(scope);
    }, () => { reporting = false; });
  }
  function startPlayback(scope: AbortController) {
    if (!current(scope) || replyPending || stopPlaying) return;
    if (Date.now() >= deadline) { finish('timeout'); return; }
    scheduleDeadline();
    firstPlaybackAt ??= Date.now();
    const remainingMaxMs = signal.maxPlayMs == null ? undefined :
      Math.max(0, firstPlaybackAt + signal.maxPlayMs - Date.now());
    if (remainingMaxMs === 0) return;
    stopPlaying = options.play(() => {
      if (!current(scope)) return;
      playCount++;
      reportPlayback(scope);
    }, remainingMaxMs);
  }
  function sendReply(scope: AbortController) {
    retry(scope, () => options.api.respond(signal.messageId, touchedAt!, scope.signal), () => finish('replied'), () => {
      replyPending = false; options.onReplying(false); options.feedback('failed'); scheduleDeadline();
    });
  }
  return {
    resume() {
      if (disposed || finished || active || !options.valid()) return;
      const scope = new AbortController(); active = scope;
      reportPlayback(scope);
      if (replyPending) { options.onReplying(true); sendReply(scope); return; }
      if (options.preview) { startPlayback(scope); return; }
      if (acknowledged) { startPlayback(scope); return; }
      // Send ack before vibrating. A temporary network failure must not hide an incoming tactile signal.
      retry(scope, () => options.api.acknowledge(signal.messageId, receivedAt, scope.signal), (ack) => {
        acknowledged = true;
        if (ack.waitUntil) deadline = Date.parse(ack.waitUntil);
        scheduleDeadline(); startPlayback(scope);
      }, () => options.feedback('failed'), () => startPlayback(scope));
    },
    respond() {
      if (!active || !current(active) || replyPending) return;
      if (options.preview || signal.isPractice) { finish('dismissed'); return; }
      replyPending = true; touchedAt ??= new Date().toISOString();
      stopPlayback(); clearTimeout(deadlineTimer); options.onReplying(true);
      sendReply(active);
    },
    dismiss() { if (!replyPending) finish('timeout'); },
    pause,
    dispose() { disposed = true; pause(); },
  };
}
