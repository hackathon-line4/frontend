import { AppRegistry } from 'react-native';

import { answerLocationRequest } from '@/features/location/recipient';
import { getSession, restoreSession } from '@/features/session/store';

// 화면 없이 실행되는 작업. 네이티브 SonullimHeadlessService가 이름으로 부른다.
// 앱이 꺼져 있으면 이 파일이 화면보다 먼저 실행되므로 로그인 정보를 직접 읽어 온다.

AppRegistry.registerHeadlessTask('SonullimLocationRequest', () => async (data: { requestId?: string }) => {
  if (!data?.requestId) return;
  if (getSession().status !== 'authenticated') await restoreSession().catch(() => {});
  await answerLocationRequest(data.requestId, { background: true });
});
