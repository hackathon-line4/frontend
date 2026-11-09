# 공통 API와 로그인 세션

## 실행 설정

`.env.example`을 참고해 프로젝트 루트에 `.env.local`을 만들고 백엔드 주소를 입력합니다.

```dotenv
EXPO_PUBLIC_API_URL=https://실제-백엔드-호스트
```

`/api/v1`은 자동으로 붙습니다. 값에 이미 포함돼 있어도 중복하지 않습니다.
서버 주소가 비어 있으면 요청 시 설정 오류를 보여주며 가짜 로그인은 하지 않습니다.
휴대폰에서 로컬 서버를 호출할 때는 PC의 LAN IP를 사용합니다.
환경변수 변경 후 앱을 전체 새로고침합니다. 이 값에는 비밀키를 넣지 않습니다.

`expo-secure-store`, `expo-crypto`를 추가했으므로 설치된 커스텀 development build는 다시 빌드해야 합니다.
전체 앱의 네이티브 기능 확인은 기존 팀의 development build/APK 절차를 따릅니다.

## 요청 작성

```ts
import { api, ApiError } from '@/api';

const me = await api.request('/me');

// 생성/전송 API는 creation을 명시합니다. UUID가 자동으로 붙습니다.
await api.request(`/links/${linkId}/messages`, {
  method: 'POST',
  creation: true,
  body: { signalId },
});
```

- 경로는 `/me`처럼 `/api/v1` 이후부터 씁니다.
- 공개 API에는 `auth: false`를 지정합니다.
- 기본 타임아웃은 15초이며 `timeoutMs`와 `signal`로 조절할 수 있습니다.
- 성공 시 `data`를 반환하고 `204`에서는 `undefined`를 반환합니다.
- 오류는 `ApiError`이며 `code`, `message`, `field`, `details`, `requestId`를 제공합니다.
- 생성 실패의 `idempotencyKey`를 보관해 **같은 본문의 같은 작업 재시도**에 전달합니다.
  새로운 작업에는 기존 키를 재사용하지 않습니다. 토큰 갱신 후 재전송은 자동으로 같은 키를 유지합니다.
- ack/재생 보고/터치 응답/열람 API는 `creation`을 지정하지 않습니다.
- 네트워크 오류나 타임아웃에 쓰기 요청을 무조건 자동 재전송하지 않습니다.

## 로그인 흐름

가입/로그인 → 토큰 저장 → `GET /me` → 역할·연결·승인 대기로 화면을 결정합니다.
회원가입은 이름과 필수 약관 동의 값을 보내며 비밀번호 확인은 앱 안에서만 검사합니다.

앱 시작 시 저장된 토큰이 없으면 첫 실행은 온보딩, 이후는 로그인으로 갑니다.
토큰이 있으면 `/me`로 최신 상태를 복원합니다.

| 상태 | 화면 |
| --- | --- |
| 역할 없음 | `/auth/role` |
| 연결 없는 보호자 | `/link/guardian` |
| 연결 없는 당사자 | `/link/recipient` |
| 승인 대기 중인 당사자 | `/link/recipient/confirm` |
| 연결된 보호자 | `/guardian` |
| 연결된 당사자 | `/recipient` |

승인 대기 화면은 복원한 상대 이름을 표시하고, 화면이 열린 동안 5초마다 `/me`를 확인합니다.
향후 SSE 연동 시 이 확인 부분을 이벤트로 대체할 수 있습니다.
기존의 연결 코드 입력·요청 생성 흐름은 이번 작업의 API 연동 범위에 포함하지 않습니다.

`TOKEN_EXPIRED`일 때만 refresh를 실행합니다. 동시 요청은 갱신 요청 한 번을 공유하고 원래 요청을 한 번 재시도합니다.
새 refresh 토큰도 함께 저장합니다. `UNAUTHORIZED`와 `INVALID_REFRESH_TOKEN`은 세션을 지웁니다.
인터넷 오류나 서버 오류로 복원이 실패하면 토큰을 보존하고 재시도 화면을 보여줍니다.
네이티브에서는 SecureStore를 사용하고 웹 미리보기에서는 토큰을 메모리에만 보관합니다.

보호자 설정의 로그아웃은 서버 응답과 관계없이 로컬 세션을 지웁니다.
기기 등록을 구현할 때 `getInstallationId()`를 재사용해야 로그아웃 시 동일한 기기 등록을 해제할 수 있습니다.
푸시 토큰 등록, SSE, 연결 생성 및 나머지 화면의 mock 데이터 교체는 후속 작업입니다.
개발용 `/dev` 화면 목록은 서버 없이 화면을 미리 볼 수 있도록 역할 미리보기를 유지합니다.

## 검증

```sh
npm test
npm run lint
npm run typecheck
```

`npm test`는 Node에서 API 응답·동시 갱신·중복 방지 키·세션 복원을 mock transport/storage로 확인합니다.
실제 서버와 실기기의 SecureStore 저장/재실행은 서버 주소 설정 후 별도로 확인해야 합니다.
Expo Router의 자동 생성 타입이 오래돼 경로 오류가 나면 `npx expo start`로 타입을 재생성한 뒤 검사합니다.
