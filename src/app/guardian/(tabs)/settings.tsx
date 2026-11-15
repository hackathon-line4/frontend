import { useSession } from '@/features/session';
import Preview from '@/features/settings/preview/guardian';
import { ConnectedGuardianSettings } from '@/features/settings/ConnectedSettings';
export default function SettingsRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedGuardianSettings />;
}
