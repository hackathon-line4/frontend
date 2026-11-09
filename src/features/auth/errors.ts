import { ApiError, errorMessage } from '@/api';

export type AuthFailure = { message: string; field?: string };

export function signupFailure(error: unknown): AuthFailure {
  if (error instanceof ApiError) {
    if (error.code === 'EMAIL_ALREADY_EXISTS') {
      return { message: '이미 가입된 이메일이에요. 다른 이메일을 입력하거나 로그인해 주세요.', field: 'email' };
    }
    return { message: errorMessage(error), field: error.field };
  }
  return { message: errorMessage(error) };
}

export function loginFailure(error: unknown): AuthFailure {
  if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') {
    return { message: '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.', field: 'password' };
  }
  return { message: errorMessage(error) };
}
