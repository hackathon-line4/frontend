// 서버 연결 전 화면 확인용 데이터
export const mockGuardian = { name: '이영희' } as const;
export const mockRecipient = { name: '김하늘' } as const;
export const mockLinkCode = '482913';

export type LinkMethod = 'code' | 'qr';

export const linkMethodLabel: Record<LinkMethod, string> = {
  code: '코드 입력',
  qr: 'QR 인식',
};
