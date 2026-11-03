import { backToIdle } from '@/features/recipient';
import RecipientRepliedScreen from '@/screens/recipient/RecipientRepliedScreen';

export default function RecipientRepliedRoute() {
  return <RecipientRepliedScreen onDone={backToIdle} />;
}
