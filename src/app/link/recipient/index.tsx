import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { linkApi } from '@/features/link/client';
import { useLinkResource } from '@/features/link/useLinkResource';
import RecipientCodeEntryScreen from '@/screens/link/RecipientCodeEntryScreen';

export default function RecipientCodeEntryRoute() {
  const resource = useLinkResource(useCallback(async () => null, []));
  const [edited, setEdited] = useState(false);
  const submit = (code: string) => {
    setEdited(false);
    void resource.run(() => linkApi.verify(code), () => router.push({ pathname: '/link/recipient/confirm', params: { code } }));
  };
  return <RecipientCodeEntryScreen busy={resource.busy} error={edited ? undefined : resource.error}
    onChange={() => setEdited(true)} onBack={() => router.back()} onSubmit={submit} />;
}
