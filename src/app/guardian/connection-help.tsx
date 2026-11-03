import { router } from 'expo-router';

import { mockRecipient } from '@/features/link/mock';
import { checkConnection, useSettings } from '@/features/settings';
import ConnectionHelpScreen from '@/screens/settings/ConnectionHelpScreen';

export default function ConnectionHelpRoute() {
  const { connection, checking } = useSettings();
  return (
    <ConnectionHelpScreen
      recipientName={mockRecipient.name}
      connection={connection}
      checking={checking}
      onBack={() => router.back()}
      onRecheck={checkConnection}
      onRelink={() => router.push('/link/guardian')}
    />
  );
}
