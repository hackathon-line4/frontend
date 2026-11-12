import { randomUUID } from 'expo-crypto';
import { api } from '@/api';
import { getGuardianScope } from '@/features/guardian/client';
import { createSignalApi } from './api';
import { createSignalSaver } from './saver';
export const signalApi = createSignalApi(api);
export const saveSignal = createSignalSaver({ scope: getGuardianScope, createKey: randomUUID, create: signalApi.create });
