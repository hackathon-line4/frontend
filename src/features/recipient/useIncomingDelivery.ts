import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { getSession, getSessionRevision } from '@/features/session/store';
import { playFeedback, repeatSignal } from '@/features/vibration';

import { recipientApi } from './api';
import { createIncomingDelivery } from './delivery';
import { clearIncoming, type IncomingSignal } from './incoming';

export function useIncomingDelivery(signal: IncomingSignal | null, preview: boolean) {
  const [replying, setReplying] = useState(false);
  const revision = getSessionRevision();
  const delivery = useMemo(() => signal && createIncomingDelivery({
    signal, api: recipientApi, preview,
    valid: () => getSessionRevision() === revision && (preview ||
      (getSession().status === 'authenticated' && getSession().role === 'recipient')),
    play: (onPlay, remainingMaxMs) => repeatSignal(signal.pulses, signal.repeatGapMs, remainingMaxMs, onPlay),
    feedback: playFeedback, onReplying: setReplying,
    onDone: (reason) => {
      clearIncoming(signal.messageId);
      router.replace(reason === 'replied' ? '/recipient/replied' : '/recipient');
    },
  }), [signal, preview, revision]);
  useFocusEffect(useCallback(() => {
    setReplying(false);
    if (!AppState.currentState || AppState.currentState === 'active') delivery?.resume();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') delivery?.resume();
      else delivery?.pause();
    });
    return () => { subscription.remove(); delivery?.pause(); };
  }, [delivery]));
  // Focus cleanup cancels all work; returning to a covered screen resumes the pending touch.
  return { replying, reply: () => delivery?.respond(), dismiss: () => delivery?.dismiss() };
}
