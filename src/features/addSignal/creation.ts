import type { AddSignalDraft } from './store';
import type { SignalCreation } from './api';
export function signalCreation(draft: AddSignalDraft): SignalCreation {
  return draft.source === 'basic' ? { source: 'TEMPLATE', templateId: draft.basicId ?? '' }
    : { source: 'CUSTOM', name: draft.name.trim(), description: draft.description.trim(), icon: draft.icon, category: draft.category.toUpperCase(),
        rhythm: draft.beats.map(b => ({ S: 'SHORT', M: 'MEDIUM', L: 'LONG' } as const)[b]), ...(draft.presetId ? { presetId: draft.presetId } : {}) };
}
