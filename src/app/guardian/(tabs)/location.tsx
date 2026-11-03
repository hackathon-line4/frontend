import { mockLocation } from '@/features/home';
import { mockRecipient } from '@/features/link/mock';
import LocationTabScreen from '@/screens/guardian/LocationTabScreen';

export default function LocationTabRoute() {
  return (
    <LocationTabScreen
      recipientName={mockRecipient.name}
      location={mockLocation}
      onRefresh={() => {
        // TODO: 당사자 휴대폰에 현재 위치 1회 요청 (서버 푸시) 후 결과 반영
      }}
    />
  );
}
