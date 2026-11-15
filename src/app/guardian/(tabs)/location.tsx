import { mockLocation } from '@/features/home';
import { useGuardianState } from '@/features/guardian/hooks';
import { mockRecipient } from '@/features/link/mock';
import { openInMaps, toRecipientLocation, useGuardianLocation } from '@/features/location';
import { useSession } from '@/features/session';
import LocationTabScreen from '@/screens/guardian/LocationTabScreen';

export default function LocationTabRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedRoute />;
}

/** 서버 없이 화면만 볼 때 (/dev) */
function Preview() {
  return <LocationTabScreen recipientName={mockRecipient.name} location={mockLocation} onRefresh={() => {}} />;
}

function ConnectedRoute() {
  const { data } = useGuardianState();
  const { view, refreshing, notice, refresh } = useGuardianLocation();
  const name = data?.home?.recipient.name ?? '당사자';
  const last = view?.sharingEnabled ? view.last : null;
  return (
    <LocationTabScreen
      recipientName={name}
      location={toRecipientLocation(view)}
      hasPoint={!!last}
      refreshing={refreshing}
      notice={notice}
      onRefresh={() => { void refresh(); }}
      onOpenMap={last ? () => { void openInMaps(last, `${name}의 위치`); } : undefined}
    />
  );
}
