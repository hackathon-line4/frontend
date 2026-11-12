import { useSession } from '@/features/session';
import Preview from '@/features/guardian/preview/noReply';
import { useLocalSearchParams } from 'expo-router';
import { GuardianMessageDetails } from '@/features/guardian/Details';

export default function GuardianNoReplyRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedRoute />;
}

function ConnectedRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <GuardianMessageDetails id={id} />;
}
