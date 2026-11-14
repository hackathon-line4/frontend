import { api } from '@/api';
import { getSession, getSessionRevision, reloadMe } from '@/features/session/store';
import { createSettingsApi } from './api';
import { createSettingsController, type SettingsScope } from './controller';
import { createConnectionInbox } from './connectionInbox';
export function getSettingsScope(): SettingsScope | null {
  const session = getSession();
  if (session.status !== 'authenticated' || !session.tokens || !session.user || !session.role) return null;
  const link = session.links.find(l => l.status === 'ACTIVE');
  return { key: `${session.user.id}:${getSessionRevision()}:${link?.id ?? ''}`, userId: session.user.id, role: session.role, linkId: link?.id };
}
export const settingsApi = createSettingsApi(api);
export const serverSettings = createSettingsController({ api: settingsApi, scope: getSettingsScope, confirmed: id => {
  void reloadMe().then(() => serverSettings.clearCheck(id)).catch(() => {});
} });

const inbox = createConnectionInbox({ scope: getSettingsScope, api: settingsApi, onAcknowledged: () => { void reloadMe().catch(() => {}); } });
export const queueConnectionCheck = inbox.queue;
export const acknowledgeConnectionChecks = inbox.acknowledge;
