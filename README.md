# 손울림

**시청각장애인 당사자와 보호자를 진동 신호로 잇는 안드로이드 앱**

보호자가 신호를 보내면 당사자 휴대폰이 촉신호를 옮긴 진동으로 울리고, 당사자는 화면 어디든 터치해 응답해요. 당사자는 화면을 보지 않고도 두 번 탭 · 길게 누르기 · 전원 버튼만으로 보호자를 부르거나 도움을 요청할 수 있어요.

[**⬇ APK 받기 (v1.0.0)**](https://github.com/hackathon-line4/frontend/releases/tag/v1.0.0) · 안드로이드 8.0 이상 실기기

---

## 주요 기능

### 보호자
- **신호 보내기**: 촉신호를 옮긴 기본 신호(나 여기 있어 · 밥 먹자 · 가자 · 기다려 · 누가 왔어 · 위험해)와 직접 만든 신호, 긴급 신호
- **신호 만들기**: 리듬 프리셋에서 고르거나 짧게 · 중간 · 길게를 이어 붙여 직접 조합, 이 휴대폰에서 미리 느껴 보기
- **알려주기**: 당사자 휴대폰에 연습 진동을 보내 옆에서 뜻을 알려 줌
- **기록**: 보낸 신호(↗) · 받은 신호(↙), 기기 도착 · 진동 재생 · 터치 응답 · 응답 없음, 다시 보내기
- **알림**: 도움 요청(가장 강하게) · 보호자 부르기 · 응답 · 응답 없음
- **위치**: 당사자의 현재 위치를 지도로 확인 (요청한 순간 1회, 이동 경로는 남기지 않음)
- **연결 확인**: 당사자 휴대폰이 신호를 받을 수 있는 상태인지 확인

### 당사자
- **화면 전체가 하나의 터치 영역**: 한 번 탭 연결 확인 · 두 번 탭 보호자 부르기 · 3초 길게 도움 요청
- **신호 받기**: 앱이 꺼져 있어도(FCM) 잠금화면 위로 켜지고, 응답할 때까지 진동 반복
- **전원 버튼 3번**: 화면이 꺼진 상태에서 1초에 한 번씩 세 번 누르면 손울림이 켜짐
- **내 진동 설정**: 세기 · 길이를 바꾸고 직접 느껴 본 뒤 저장
- **휴대폰 설정 안내**: 알림 · 다른 앱 위에 표시 · 배터리 최적화 제외 등을 한 화면에서 켜기
- 스크린리더(TalkBack) 사용자 지정 동작 지원

## 진동 신호

촉신호는 등 · 팔 위에서 손이 닿고 움직이고 떨어지는 동작이에요. 손이 닿아 있는 시간을 진동이 울리는 시간으로, 손이 떨어진 시간을 쉬는 시간으로 옮겨 `[울림, 쉼, 울림, …]` ms 배열(`pulses`)로 저장해요.

| 신호 | 원래 동작 | 진동 |
|---|---|---|
| 나 여기 있어 | 팔꿈치 뒤를 두 번 두드림 | `[150,150,150]` |
| 밥 먹자 | 위팔에 원 하나 | `[700]` |
| 가자 | 두 손가락으로 등을 걸어 가로지름 | 두드림 4번 |
| 위험해 | 큰 X를 세 번 | 긴 진동 2번 × 3 |

직접 만드는 신호는 짧게 150 · 중간 700 · 길게 1000ms(사이 150ms)를 2~5박자로 이어 붙여요. 진동 엔진은 `src/features/vibration/`, 변환 규칙의 상수는 `src/theme/rhythm.ts`에 있어요.

## 기술 스택

- **앱**: Expo SDK 58 · React Native 0.88 (New Architecture) · Expo Router · TypeScript
- **네이티브**: 로컬 Expo 모듈 `modules/sonullim-native` (Kotlin) — 진동, 포그라운드 서비스, 전원 버튼 감지, 잠금화면 실행, FCM 수신, 화면 없이 실행(HeadlessJS), 설정 화면 열기
- **실시간**: 앱이 열려 있으면 SSE(`GET /api/v1/events`), 닫혀 있으면 FCM data 푸시
- **위치 · 지도**: `expo-location`, OpenStreetMap 타일 (API 키 불필요)
- **백엔드**: Spring Boot + PostgreSQL ([hackathon-line4/backend](https://github.com/hackathon-line4/backend))

## 폴더 구조

```
src/
  app/          화면 경로 (Expo Router). guardian/ · recipient/ · link/ · calibration/ · auth/
  screens/      화면 그리기 (데이터 없이 props만 받음)
  features/     기능별 로직 · 상태 · API (guardian, recipient, signals, vibration, location, push …)
  components/   공용 UI 부품
  native/       네이티브 모듈 호출 (Expo Go · 웹에서는 아무 일도 안 함)
  realtime/     SSE 연결과 이벤트 처리
  api/          API 클라이언트 · 타입 · 에러 문구
  theme/        색 · 글자 · 리듬 단위
modules/sonullim-native/   Kotlin 네이티브 모듈
design/         디자인 시안 · 화면 지도(screen-map.md)
docs/           기능별 문서
tests/          node:test 테스트
```

## 개발 환경

필요한 것: Node 22, JDK 17, Android SDK(NDK · CMake 포함), 안드로이드 실기기(USB 또는 무선 디버깅)

```bash
npm ci --legacy-peer-deps      # lockfile 그대로 설치
cp .env.example .env.local     # API 주소 설정 (아래 '서버' 참고)
npx expo prebuild -p android   # android/ 생성 (git에 올리지 않음)
npx expo run:android           # 개발 빌드 설치 + Metro 실행
```

- 네이티브 코드가 들어 있어 **Expo Go로는 동작하지 않아요.** 개발 빌드(expo-dev-client)를 설치해 쓰고, JS는 Metro에서 받아요.
- 네이티브 코드(`modules/`, `app.json`, 네이티브 패키지)가 바뀌면 APK를 다시 빌드해야 해요.
- `android/` · `ios/`는 prebuild로 만들어지므로 직접 고치지 않아요. 네이티브 설정은 `app.json` · `app.config.js` · `modules/`에서 해요.
- **Windows**: 네이티브 빌드 경로가 260자를 넘어 실패하면 레지스트리 `LongPathsEnabled=1`을 켜고, Android SDK `cmake/3.22.1/bin/ninja.exe`를 ninja 1.12 이상으로 바꿔 주세요.

### 서버

`.env.local`의 `EXPO_PUBLIC_API_URL`로 정해요 (`/api/v1`은 자동으로 붙음).

| 서버 | 주소 |
|---|---|
| 배포 서버 | `http://sonullim.duckdns.org:8080` ([Swagger](http://sonullim.duckdns.org:8080/swagger-ui/index.html)) |
| 로컬 (실기기) | `http://<PC Wi-Fi IP>:8080`, 또는 `adb reverse tcp:8080 tcp:8080` 후 `http://localhost:8080` |
| 로컬 (에뮬레이터) | `http://10.0.2.2:8080` |

로컬 백엔드 실행은 [docs/backend-local.md](docs/backend-local.md)를 봐 주세요 (`npm run backend:up`).

### 푸시 (FCM)

`google-services.json`(Firebase 프로젝트 `sonullim`)이 저장소에 들어 있어 빌드하면 푸시가 켜져요. 서버가 푸시를 보내려면 백엔드에 서비스 계정 키가 필요해요 — 키는 저장소에 올리지 않아요. 자세한 흐름은 [docs/push-fcm.md](docs/push-fcm.md).

## 확인 · 테스트

```bash
npm run typecheck
npm run lint
npm test
```

개발 빌드에서는 왼쪽 아래 **DEV** 버튼(또는 `sonullim://dev`)으로 화면 목록, 진동 테스트, 신호 수신 시뮬레이션, 백그라운드 서비스 상태를 볼 수 있어요. 출시용 빌드에서는 보이지 않아요.

## 빌드

```bash
# 개발용 APK (arm64)
cd android && ./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a

# 출시용 APK (64 · 32비트)
cd android && ./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a

# EAS 클라우드 빌드 (preview 프로필에 배포 서버 주소가 들어 있음)
npx eas-cli build -p android --profile preview
```

출시용 빌드도 서버가 http라서 cleartext 통신을 허용해 두었어요 (`app.config.js`, https 전환 후 제거).

## 문서

| 문서 | 내용 |
|---|---|
| [design/screen-map.md](design/screen-map.md) | 화면 목록과 화면별 동작 규칙 |
| [docs/ui-conventions.md](docs/ui-conventions.md) | UI 규칙 |
| [docs/api-session.md](docs/api-session.md) | API 클라이언트 · 로그인 세션 |
| [docs/account-link.md](docs/account-link.md) | 계정 연결 |
| [docs/recipient-api.md](docs/recipient-api.md) | 당사자 송수신 |
| [docs/guardian-realtime.md](docs/guardian-realtime.md) | 보호자 홈 · 실시간 |
| [docs/signals-history-settings.md](docs/signals-history-settings.md) | 신호 · 기록 · 설정 |
| [docs/push-fcm.md](docs/push-fcm.md) | 앱이 꺼져 있을 때 신호 받기 |
| [docs/location.md](docs/location.md) | 위치 공유 |
| [docs/backend-local.md](docs/backend-local.md) | 로컬 백엔드 실행 |

## 알려진 제한 (v1.0.0)

- 백엔드가 http라 출시용 빌드에서 cleartext 허용
- 디버그 키로 서명된 APK (스토어 배포 시 정식 키로 다시 빌드)
- 안드로이드 전용 (iOS 미지원)
- 다음 버전: 응답이 없을 때 10분마다 다시 울리기, 직접 만든 신호의 리듬 수정

## 라이선스

MIT — [LICENSE](LICENSE)
