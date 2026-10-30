import { router } from 'expo-router';
import { useState } from 'react';

import { LINK_CODE_TTL_MS, createMockLinkCode } from '@/features/link/code';
import { mockLinkCode } from '@/features/link/mock';
import GuardianLinkCodeScreen from '@/screens/link/GuardianLinkCodeScreen';

// TODO: 코드 생성 API. 당사자가 코드를 입력하거나 QR을 인식하면 푸시 알림 + /link/guardian/request
export default function GuardianLinkCodeRoute() {
  const [link, setLink] = useState(() => ({ code: mockLinkCode, expiresAt: Date.now() + LINK_CODE_TTL_MS }));

  return (
    <GuardianLinkCodeScreen
      code={link.code}
      expiresAt={link.expiresAt}
      onBack={() => router.back()}
      onRenew={() => setLink({ code: createMockLinkCode(), expiresAt: Date.now() + LINK_CODE_TTL_MS })}
    />
  );
}
