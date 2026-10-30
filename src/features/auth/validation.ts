// 입력을 마치고 다음 칸으로 이동할 때(blur) 검사한다.

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** 8자 이상, 영문과 숫자를 함께 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export const PASSWORD_RULE = '8자 이상, 영문과 숫자를 함께 써 주세요.';
