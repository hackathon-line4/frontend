import { router, useLocalSearchParams } from 'expo-router';

import { requestStatusMessage } from '@/features/link/api';
import { LinkFeedback } from '@/features/link/LinkFeedback';
import { useRecipientLink } from '@/features/link/useRecipientLink';
import RecipientConfirmScreen from '@/screens/link/RecipientConfirmScreen';

export default function RecipientConfirmRoute() {
  const params = useLocalSearchParams<{ code?: string; requestId?: string }>();
  const code = typeof params.code === 'string' ? params.code : '';
  const id = typeof params.requestId === 'string' ? params.requestId : '';
  const resource = useRecipientLink(code, id);
  if (resource.busy) return <LinkFeedback message="연결 요청을 처리하고 있어요…" busy />;
  if (resource.request && resource.request.status !== 'PENDING') return <LinkFeedback
    message={requestStatusMessage[resource.request.status]} onBack={() => router.replace('/link/recipient')} />;
  if (!resource.data) return <LinkFeedback message={resource.error ?? '연결 대상을 확인하고 있어요…'} busy={!resource.error}
    onRetry={resource.error ? resource.retry : undefined} onBack={resource.error ? () => router.replace('/link/recipient') : undefined} />;
  const guardianName = resource.data.kind === 'verified' ? resource.data.target.guardian.name : resource.data.request.guardian.name;
  return <RecipientConfirmScreen guardianName={guardianName} waiting={!!resource.request} error={resource.error}
    onRetry={resource.retry} onConfirm={resource.create} onCancel={resource.cancel} />;
}
