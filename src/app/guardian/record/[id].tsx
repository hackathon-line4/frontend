import { useSession } from '@/features/session';
import Preview from '@/features/guardian/preview/record';
import { useLocalSearchParams } from 'expo-router';
import { GuardianMessageDetails, GuardianOtherDetails } from '@/features/guardian/Details';

export default function RecordRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedRoute />;
}

function ConnectedRoute() {
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: string }>();
  return kind === 'HELP_REQUEST' || kind === 'RECIPIENT_SIGNAL'
    ? <GuardianOtherDetails id={id} kind={kind} /> : <GuardianMessageDetails id={id} />;
}
