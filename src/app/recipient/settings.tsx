import { useSession } from '@/features/session';
import Preview from '@/features/settings/preview/recipient';
import { ConnectedRecipientSettings } from '@/features/settings/ConnectedSettings';
export default function SettingsRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedRecipientSettings />;
}
