import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { requestHelp, sendSignal } from './actions';

export function useRecipientSend() {
  const scope = useRef<AbortController | null>(null);
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  useFocusEffect(useCallback(() => {
    const activate = () => { scope.current = new AbortController(); sending.current = false; setBusy(false); };
    if (!AppState.currentState || AppState.currentState === 'active') activate();
    const subscription = AppState.addEventListener('change', (state) => {
      scope.current?.abort(); scope.current = null;
      if (state === 'active') activate();
    });
    return () => { scope.current?.abort(); scope.current = null; subscription.remove(); };
  }, []));
  const submit = async (help: boolean) => {
    const current = scope.current;
    if (!current || current.signal.aborted || sending.current) return;
    sending.current = true; setBusy(true);
    const ok = await (help ? requestHelp : sendSignal)(current.signal);
    if (scope.current !== current || current.signal.aborted) return;
    sending.current = false; setBusy(false);
    if (ok) router.replace('/recipient/sent');
  };
  return { busy, sendCall: () => { void submit(false); }, sendHelp: () => { void submit(true); } };
}
