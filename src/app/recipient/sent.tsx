import { backToIdle } from '@/features/recipient';
import RecipientSentScreen from '@/screens/recipient/RecipientSentScreen';

export default function RecipientSentRoute() {
  return <RecipientSentScreen onDone={backToIdle} />;
}
