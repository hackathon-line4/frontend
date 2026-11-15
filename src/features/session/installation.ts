import { randomUUID } from 'expo-crypto';

import { readStored, writeStored } from './storage';

let flight: Promise<string> | undefined;
// Reuse this ID when the native push module registers PUT /me/devices/{installationId}.
export function getInstallationId(): Promise<string> {
  if (!flight) {
    flight = (async () => {
      const stored = await readStored('sonullim.installation');
      if (stored) return stored;
      const id = randomUUID();
      await writeStored('sonullim.installation', id);
      return id;
    })().catch((error) => { flight = undefined; throw error; });
  }
  return flight;
}
