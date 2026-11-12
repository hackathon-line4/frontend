# 앱이 꺼져 있을 때 신호 받기 (FCM, B-8)

앱이 열려 있으면 SSE(`GET /events`)로 신호를 받는다. 앱이 꺼져 있으면 서버가 FCM으로 data 푸시를 보내고, 앱이 깨어나 같은 입구(`handleIncoming`)로 07-4를 연다.

## 흐름

1. 로그인하면 `PushRegistration`이 이 기기의 FCM 토큰을 `PUT /me/devices/{installationId}`로 등록한다. 앱이 앞으로 올 때마다 다시 확인하고, 토큰이 같으면 요청하지 않는다.
2. 보호자가 신호를 보내면 서버가 당사자 토큰으로 FCM에 data 푸시를 맡긴다.
3. 앱이 꺼져 있어도 시스템이 `SonullimMessagingService`(네이티브)를 깨운다. `type`이 `SIGNAL` · `PRACTICE`면 당사자 화면(`sonullim://recipient`)을 잠금화면 위로 띄운다(B-7과 같은 방식, '다른 앱 위에 표시' 권한 필요).
4. 앱이 뜨면 `IncomingSync`가 `/messages/incoming`을 읽어 `handleIncoming` → 07-4 + 리듬 진동. SSE로 같은 신호가 와도 한 번만 처리된다.

앱이 이미 화면에 떠 있으면 3번은 아무것도 하지 않는다(SSE · `IncomingSync`가 처리).

## 서버에 부탁한 발송 형식

- notification 없이 **data만**: `{ "type": "SIGNAL", "linkId": "…", "messageId": "…" }`
- Android 우선순위 **high**. 보통 우선순위는 화면이 꺼진 폰(Doze)에서 몇 분 늦게 올 수 있다.

## google-services.json

백엔드가 만든 Firebase 프로젝트에서 받는다(Android 패키지 `com.sonullim.app`). 프로젝트 루트에 두면 `app.config.js`가 `android.googleServicesFile`로 넣고, 다시 prebuild · 빌드해야 적용된다.

파일이 없어도 빌드는 된다. 이때는 푸시만 꺼져 있다(`/dev`에 "FCM 꺼짐" 표시, 토큰 등록 안 함).

## 테스트

- **서버 없이:** `/dev` → "FCM 토큰 복사" → Firebase 콘솔 → Messaging → 테스트 메시지. 앱을 최근 앱에서 지운 뒤 data `type=SIGNAL`로 보내면 당사자 화면이 떠야 한다.
- **로컬 서버로:** 백엔드 FCM 발송 구현 후, 로컬 도커에 서비스 계정 키를 넣고 보호자 → 당사자 신호 전송.
- 로그: `adb logcat -s Sonullim` ("푸시 받음 type=SIGNAL priority=…")
