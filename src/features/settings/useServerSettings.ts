import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { getNotificationPermission } from '@/native/deviceSettings';
import { useSession } from '@/features/session';
import { reloadMe } from '@/features/session/store';
import { getSettingsScope, serverSettings } from './client';
import type { LocationPermission, NotificationPermission } from './types';

export function useServerSettings() {
  const session = useSession();
  const snapshot = useSyncExternalStore(serverSettings.subscribe, serverSettings.getSnapshot, serverSettings.getSnapshot);
  const scope = getSettingsScope(), key = scope?.key;
  const [permissions, setPermissions] = useState<{ location: LocationPermission; notification: NotificationPermission }>({ location: 'unknown', notification: 'unknown' });
  useFocusEffect(useCallback(() => {
    let alive = true;
    let lastReadAt = 0;
    const refresh = async () => {
      if (!alive || (AppState.currentState && AppState.currentState !== 'active')) return;
      serverSettings.bind(); if (key) { void serverSettings.load(); void serverSettings.pollCheck(); void reloadMe().catch(() => {}); }
      lastReadAt = Date.now();
      let location: LocationPermission = 'unknown';
      try {
        if (Platform.OS === 'android') {
          const [fine, coarse] = await Promise.all([PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION), PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)]);
          location = fine ? 'whileInUse' : coarse ? 'approximate' : 'denied';
        }
        const notification = getNotificationPermission();
        if (alive) setPermissions({ location, notification: notification === null ? 'unknown' : notification ? 'granted' : 'denied' });
      } catch { if (alive) setPermissions({ location: 'unknown', notification: 'unknown' }); }
    };
    void refresh();
    const timer = setInterval(() => { if (!AppState.currentState || AppState.currentState === 'active') { void serverSettings.pollCheck(); if (Date.now() - lastReadAt >= 15000) void refresh(); } }, 2000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); else serverSettings.stop(); });
    return () => { alive = false; clearInterval(timer); subscription.remove(); serverSettings.stop(); };
  }, [key]));
  return { data: scope?.key === snapshot.scope ? snapshot : null, scope, session, permissions };
}
