import { getSession } from '@/features/session/store';
import { locationApi } from './api';
import { captureOnce, lastPermission, readPermission } from './device';

// 당사자 쪽 위치 보내기. 공유 켜기/끄기와 권한 요청은 설정(features/settings)에서 한다. 서버 기본값은 꺼짐.
// 위치는 두 경우에만 한 번씩 잰다: 도움 요청을 보낼 때, 보호자가 위치를 확인할 때.
// 앱이 꺼져 있을 때도 답하려면 위치 권한이 '항상 허용'이어야 한다.

const isRecipient = () => {
  const s = getSession();
  return s.status === 'authenticated' && s.role === 'recipient' && !!s.tokens;
};

/**
 * 도움 요청을 만들 때 보낼 위치 상태. 위치를 기다리지 않고 요청을 먼저 보낸다.
 * 권한이 있으면 PENDING으로 보내고 attachHelpLocation으로 나중에 붙인다.
 * 공유가 꺼져 있으면 서버가 NOT_SHARED로 바꾼다.
 */
export function helpLocationStatus(): 'PENDING' | 'UNAVAILABLE' {
  return lastPermission() === 'denied' ? 'UNAVAILABLE' : 'PENDING';
}

export async function attachHelpLocation(helpRequestId: string) {
  try {
    await locationApi.attachToHelp(helpRequestId, await captureOnce());
  } catch {
    // 위치 없이도 도움 요청은 이미 도착했다
  }
}

const answered = new Set<string>();

/**
 * 보호자의 위치 확인 요청에 한 번 답한다.
 * 앱이 켜져 있으면 실시간 이벤트로, 꺼져 있으면 푸시 → 백그라운드 작업(src/headless.ts)으로 불린다.
 */
export async function answerLocationRequest(requestId: string, options: { background?: boolean } = {}) {
  if (!requestId || answered.has(requestId) || !isRecipient()) return;
  answered.add(requestId);
  try {
    await locationApi.fulfill(requestId, await captureOnce(options));
  } catch {
    answered.delete(requestId);
  }
}

// 앱이 켜질 때 한 번 권한을 읽어 둔다 (도움 요청 직전에 기다리지 않도록)
void readPermission();
