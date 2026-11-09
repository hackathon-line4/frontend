const messages: Record<string, string> = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 맞지 않아요',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일이에요',
  AGREEMENT_REQUIRED: '필수 약관에 동의해 주세요',
  VALIDATION_FAILED: '입력한 내용을 다시 확인해 주세요',
  TOKEN_EXPIRED: '로그인 정보를 갱신해 주세요',
  UNAUTHORIZED: '다시 로그인해 주세요',
  INVALID_REFRESH_TOKEN: '다시 로그인해 주세요',
  ROLE_REQUIRED: '역할을 먼저 선택해 주세요',
  ROLE_ALREADY_SET: '이미 역할을 선택했어요',
  ROLE_MISMATCH: '이 역할에서는 사용할 수 없어요',
  TOO_MANY_ATTEMPTS: '잠시 후 다시 시도해 주세요',
  LINK_CODE_NOT_FOUND: '코드를 다시 확인해 주세요',
  LINK_CODE_EXPIRED: '코드가 만료됐어요. 새 코드를 받아 주세요',
  ALREADY_LINKED: '이미 연결된 상대가 있어요',
  LINK_ENDED: '연결이 해제됐어요. 계정을 다시 연결해 주세요',
  LINK_REQUEST_NOT_PENDING: '이미 처리된 연결 요청이에요',
  RHYTHM_INVALID: '박자를 2~5개 선택해 주세요',
  RHYTHM_DUPLICATE: '같은 리듬의 신호가 있어요',
  PRESET_IN_USE: '이미 사용 중인 리듬이에요',
  TEMPLATE_ALREADY_ADDED: '이미 추가한 기본 신호예요',
  SIGNAL_DELETED: '삭제된 신호예요',
  SIGNAL_NOT_EDITABLE: '이 신호는 수정할 수 없어요',
  FAVORITE_LIMIT_EXCEEDED: '자주 쓰는 신호는 6개까지 선택할 수 있어요',
  MESSAGE_NOT_WAITING: '현재는 대기 시간을 늘릴 수 없어요',
  MESSAGE_NOT_RESPONDABLE: '응답할 수 없는 신호예요',
  LOCATION_SHARING_OFF: '위치 공유가 꺼져 있어요',
  LOCATION_ALREADY_SET: '이미 위치가 등록됐어요',
  RESET_TOKEN_INVALID: '재설정 메일을 다시 요청해 주세요',
  FIELD_READ_ONLY: '변경할 수 없는 항목이에요',
  NOT_FOUND: '기록을 찾을 수 없어요',
  IDEMPOTENCY_KEY_REQUIRED: '요청을 준비하지 못했어요. 다시 시도해 주세요',
  IDEMPOTENCY_KEY_REUSED: '요청 정보가 달라졌어요. 새 작업으로 다시 시도해 주세요',
  INTERNAL_ERROR: '잠시 후 다시 시도해 주세요',
  NETWORK_ERROR: '인터넷 연결을 확인하고 다시 시도해 주세요',
  TIMEOUT: '응답이 늦어지고 있어요. 다시 시도해 주세요',
  ABORTED: '요청이 취소됐어요',
  INVALID_RESPONSE: '서버 응답을 확인하지 못했어요',
  CONFIGURATION_ERROR: '서버 주소가 설정되지 않았어요',
  SESSION_CHANGED: '로그인 상태가 변경됐어요. 다시 시도해 주세요',
  STORAGE_ERROR: '로그인 정보를 저장하지 못했어요. 다시 시도해 주세요',
};

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    options: { message?: string; status?: number; field?: string; details?: Record<string, unknown>; requestId?: string; idempotencyKey?: string } = {},
  ) {
    super(options.message || messages[code] || '요청을 처리하지 못했어요. 다시 시도해 주세요');
    this.name = 'ApiError';
    this.status = options.status;
    this.field = options.field;
    this.details = options.details;
    this.requestId = options.requestId;
    this.idempotencyKey = options.idempotencyKey;
  }
  readonly status?: number;
  readonly field?: string;
  readonly details?: Record<string, unknown>;
  readonly requestId?: string;
  // A manual retry must reuse this key and the original body.
  readonly idempotencyKey?: string;
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : '잠시 후 다시 시도해 주세요';
}
