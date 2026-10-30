export const LINK_CODE_LENGTH = 6;
/** 연결 코드 유효 시간 10분 */
export const LINK_CODE_TTL_MS = 10 * 60 * 1000;

/** '482913' → '482 913' (3자리씩 띄워 크게 표시) */
export function formatLinkCode(code: string): string {
  return code.replace(/(\d{3})(?=\d)/g, '$1 ');
}

/** '482913' → '4, 8, 2, 9, 1, 3' (스크린리더는 한 자리씩 읽음) */
export function spellLinkCode(code: string): string {
  return code.split('').join(', ');
}

/** 임시: 서버 연결 전 화면 확인용 코드 생성 */
export function createMockLinkCode(): string {
  return String(Math.floor(Math.random() * 10 ** LINK_CODE_LENGTH)).padStart(LINK_CODE_LENGTH, '0');
}
