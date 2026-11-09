import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Web previews keep credentials only for this tab; native credentials use encrypted storage.
const memory = new Map<string, string>();
let writes: Promise<void> = Promise.resolve();

export async function readStored(key: string): Promise<string | null> {
  await writes;
  if (Platform.OS === 'web') return memory.get(key) ?? null;
  return SecureStore.getItemAsync(key);
}

export function writeStored(key: string, value: string | null): Promise<void> {
  const operation = writes.then(async () => {
    if (Platform.OS === 'web') {
      if (value === null) memory.delete(key); else memory.set(key, value);
    } else if (value === null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  });
  writes = operation.catch(() => {});
  return operation;
}
