import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { stopVibration } from '@/native/vibration';

/** 이 화면을 떠나거나 다른 화면에 가려지면 울리던 진동을 멈춘다 (긴 신호가 다음 화면까지 이어지지 않게) */
export function useStopVibrationOnBlur() {
  useFocusEffect(useCallback(() => stopVibration, []));
}
