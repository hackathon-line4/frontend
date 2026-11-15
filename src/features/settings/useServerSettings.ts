import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { useSession } from '@/features/session';
import { reloadMe } from '@/features/session/store';
import { getSettingsScope, serverSettings } from './client';
import { readSettingsPermissions, type SettingsPermissions } from './permissions';

export function useServerSettings() {
  const session = useSession();
  const snapshot = useSyncExternalStore(serverSettings.subscribe, serverSettings.getSnapshot, serverSettings.getSnapshot);
  const scope = getSettingsScope(), key = scope?.key;
  const [permissions, setPermissions] = useState<SettingsPermissions>({ location: 'unknown', notification: 'unknown' });
  useFocusEffect(useCallback(() => {
    let alive = true;
    let lastReadAt = 0;
    let permissionRead = 0;
    const refresh = async () => {
      if (!alive || (AppState.currentState && AppState.currentState !== 'active')) return;
      serverSettings.bind(); if (key) { void serverSettings.load(); void serverSettings.pollCheck(); void reloadMe().catch(() => {}); }
      lastReadAt = Date.now();
      const version = ++permissionRead;
      const next = await readSettingsPermissions();
      if (alive && version === permissionRead && (!AppState.currentState || AppState.currentState === 'active')) setPermissions(next);
    };
    void refresh();
    const timer = setInterval(() => { if (!AppState.currentState || AppState.currentState === 'active') { void serverSettings.pollCheck(); if (Date.now() - lastReadAt >= 15000) void refresh(); } }, 2000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); else { permissionRead++; serverSettings.stop(); } });
    return () => { alive = false; permissionRead++; clearInterval(timer); subscription.remove(); serverSettings.stop(); };
  }, [key]));
  return { data: scope?.key === snapshot.scope ? snapshot : null, scope, session, permissions };
}
