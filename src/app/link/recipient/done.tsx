import { router, useLocalSearchParams } from 'expo-router';

import { LinkFeedback } from '@/features/link/LinkFeedback';
import { useCompletedLink } from '@/features/link/useCompletedLink';
import RecipientLinkDoneScreen from '@/screens/link/RecipientLinkDoneScreen';

export default function RecipientLinkDoneRoute() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const resource = useCompletedLink(typeof requestId === 'string' ? requestId : '');
  if (resource.error) return <LinkFeedback message={resource.error} onRetry={resource.retry} onBack={() => router.replace('/recipient')} />;
  if (!resource.request) return <LinkFeedback message="연결 결과를 확인하고 있어요…" busy />;
  if (resource.request.status !== 'APPROVED') return <LinkFeedback message="아직 연결이 완료되지 않았어요." onBack={() => router.replace('/link/recipient')} />;
  return <RecipientLinkDoneScreen guardianName={resource.request.guardian.name} onDone={() => router.replace({ pathname: '/recipient/setup', params: { from: 'link' } })} />;
}
