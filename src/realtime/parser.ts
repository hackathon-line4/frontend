export type ServerEvent = { id: string; event: string; data: string };

/** Incremental SSE framing. Newlines, UTF-8 and fields may be split between network chunks. */
export function createEventParser(initialId = '') {
  let buffer = '', id = initialId, event = '', data: string[] = [];
  let first = true;
  let dataSize = 0;
  return {
    feed(chunk: string): ServerEvent[] {
      if (first && chunk) { chunk = chunk.replace(/^\uFEFF/, ''); first = false; }
      buffer += chunk;
      if (buffer.length > 1024 * 1024) throw new Error('SSE frame too large');
      const events: ServerEvent[] = [];
      for (;;) {
        const match = /\r\n|\r|\n/.exec(buffer);
        if (!match || (match[0] === '\r' && match.index === buffer.length - 1)) break;
        const line = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        if (!line) {
          if (data.length) events.push({ id, event: event || 'message', data: data.join('\n') });
          data = []; dataSize = 0; event = ''; continue;
        }
        if (line.startsWith(':')) continue;
        const colon = line.indexOf(':');
        const field = colon < 0 ? line : line.slice(0, colon);
        let value = colon < 0 ? '' : line.slice(colon + 1);
        if (value.startsWith(' ')) value = value.slice(1);
        if (field === 'id' && !value.includes('\0')) id = value;
        if (field === 'event') event = value;
        if (field === 'data') { data.push(value); dataSize += value.length + 1; }
        if (dataSize > 1024 * 1024) throw new Error('SSE frame too large');
      }
      return events;
    },
  };
}
