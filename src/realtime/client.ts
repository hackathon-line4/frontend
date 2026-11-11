import { ApiError } from '@/api/errors';
import { createEventParser, type ServerEvent } from './parser';

/** One foreground connection. Its cursor survives pause/resume, never logout/account replacement. */
export function createRealtimeClient(options: {
  open: (signal: AbortSignal, lastEventId?: string) => Promise<Response>;
  valid: () => boolean;
  onEvent: (event: ServerEvent) => void | Promise<void>;
  onConnected: () => void;
}) {
  let running = false, generation = 0, failures = 0, cursor = '';
  let controller: AbortController | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let reconnect: ReturnType<typeof setTimeout> | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const seen = new Set<string>();
  const alive = (epoch: number) => running && generation === epoch && options.valid();
  const touch = (scope: AbortController) => {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => scope.abort(), 45_000);
  };
  async function connect(epoch: number) {
    if (!alive(epoch)) return;
    const scope = new AbortController(); controller = scope; touch(scope);
    try {
      const response = await options.open(scope.signal, cursor || undefined);
      if (!alive(epoch)) { await response.body?.cancel(); return; }
      const stream = response.body;
      if (!stream) throw new Error('Empty event stream');
      const activeReader = stream.getReader(); reader = activeReader;
      const parser = createEventParser(cursor), decoder = new TextDecoder();
      options.onConnected();
      for (;;) {
        const chunk = await activeReader.read();
        if (!alive(epoch)) return;
        if (chunk.done) break;
        touch(scope); failures = 0;
        for (const event of parser.feed(decoder.decode(chunk.value, { stream: true }))) {
          if (!alive(epoch)) return;
          if (!event.id || !seen.has(event.id)) {
            await options.onEvent(event);
            if (!alive(epoch)) return;
            if (event.id) { seen.add(event.id); if (seen.size > 256) seen.delete(seen.values().next().value!); }
          }
          cursor = event.id;
        }
      }
    } catch (error) {
      if (error instanceof ApiError && ['UNAUTHORIZED', 'INVALID_REFRESH_TOKEN', 'ROLE_REQUIRED', 'SESSION_CHANGED'].includes(error.code)) {
        if (alive(epoch)) running = false;
      }
    } finally {
      if (generation === epoch) {
        clearTimeout(watchdog);
        await reader?.cancel().catch(() => {}); reader = undefined;
        if (alive(epoch)) {
          const delay = Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5));
          reconnect = setTimeout(() => { void connect(epoch); }, delay);
        }
      }
    }
  }
  return {
    start() { if (running || !options.valid()) return; running = true; void connect(++generation); },
    stop() {
      running = false; generation++;
      clearTimeout(reconnect); clearTimeout(watchdog); controller?.abort();
      void reader?.cancel().catch(() => {}); reader = undefined;
    },
  };
}
