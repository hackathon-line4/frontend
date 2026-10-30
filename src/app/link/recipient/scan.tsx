import { router } from 'expo-router';

import RecipientQrScanScreen from '@/screens/link/RecipientQrScanScreen';

export default function RecipientQrScanRoute() {
  return <RecipientQrScanScreen onClose={() => router.back()} onEnterCode={() => router.back()} />;
}
