// 당사자 앱 동작. 서버·진동 연결 전 자리.

/** 07-1 한 번 탭: 전송 없음. 연결 상태 확인 진동만 */
export function playConnectionCheck() {
  // TODO: 연결 상태 확인 진동 (패턴은 검증 후 확정)
}

/** 3초 길게 누르기: 도움 요청 */
export function requestHelp() {
  // TODO: 누르는 동안 1초마다 짧은 진동, 3초가 되면 서버로 도움 요청 전송 + 확인 진동
}

/**
 * 07-2 신호 보내기. 서버가 전송 요청을 받았다고 확인하면 true.
 * 실패하면 false → '보냄'을 표시하지 않고 07-2 유지
 */
export async function sendSignal(_signalName: string): Promise<boolean> {
  // TODO: 서버로 신호 전송. 성공 시 확인 진동 1회 / 실패 시 실패 진동 (패턴은 검증 후 확정)
  return true;
}

/**
 * 07-4 응답 보내기. 서버가 터치 응답을 받았다고 확인하면 true.
 * 실패하면 false → 07-4 유지 + 자동 재시도
 */
export async function replyToSignal(): Promise<boolean> {
  // TODO: 반복 진동 중단 + 서버로 터치 응답 전송. 실패 시 자동 재시도
  return true;
}

/** 07-4 신호 진동 반복 시작 / 중단 */
export function startIncomingVibration() {
  // TODO: 신호 사전의 리듬 + 내 진동 설정(보정값)으로 반복 재생 (간격·횟수는 검증 후 결정)
}

export function stopIncomingVibration() {
  // TODO: 반복 진동 중단
}
