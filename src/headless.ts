import { AppRegistry } from 'react-native';

import { api } from '@/api';
import { answerLocationRequest } from '@/features/location/recipient';
import { getSession, restoreSession } from '@/features/session/store';

// 화면 없이 실행되는 작업. 네이티브 SonullimHeadlessService가 이름으로 부른다.
// 앱이 꺼져 있으면 이 파일이 화면보다 먼저 실행되므로 로그인 정보를 직접 읽어 온다.

AppRegistry.registerHeadlessTask('SonullimLocationRequest', () => async (data: { requestId?: string }) => {
  if (!data?.requestId) return;
  if (getSession().status !== 'authenticated') await restoreSession().catch(() => {});
  await answerLocationRequest(data.requestId, { background: true });
});

// 연결 확인 요청(CONNECTION_CHECK 푸시): 앱이 꺼져 있어도 '받았음'만 서버에 알린다. 화면 · 진동 없음
AppRegistry.registerHeadlessTask('SonullimConnectionCheck', () => async (data: { checkId?: string }) => {
  if (!data?.checkId) return;
  if (getSession().status !== 'authenticated') await restoreSession().catch(() => {});
  if (getSession().status !== 'authenticated') return;
  await api.request(`/connection-checks/${encodeURIComponent(data.checkId)}/ack`, { method: 'POST' }).catch(() => {});
});
