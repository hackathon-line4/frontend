# 위치 공유

당사자 위치는 두 경우에만 한 번씩 보낸다. 이동 경로는 저장하지 않는다.

| 상황 | 흐름 |
|---|---|
| 도움 요청 (3초 길게 누르기) | `locationStatus: 'PENDING'`으로 요청을 먼저 보내고, 위치를 재는 대로 `PUT /help-requests/{id}/location` |
| 보호자 위치 새로고침 | `POST /links/{linkId}/location-requests` → 당사자 앱이 `POST /location-requests/{id}/fulfill` |

- 당사자가 설정에서 공유를 켜야 한다(`/me/location-sharing`, 서버 기본값 꺼짐). 켤 때 위치 권한을 묻는다.
- 보호자 새로고침에 답하는 길은 둘이다.
  - 앱이 켜져 있으면 실시간 이벤트 `location_request.created` → `answerLocationRequest`.
  - 앱이 꺼져 있으면 FCM `LOCATION_REQUEST` → 네이티브 `SonullimHeadlessService` → JS 작업 `SonullimLocationRequest`(`src/headless.ts`, 앱 시작 파일 `index.js`에서 등록). 위치 권한이 **'항상 허용'**이어야 하고, 아니면 `PERMISSION_DENIED`로 답한다.
- 같은 요청에는 한 번만 답한다. 위치를 15초 안에 못 재면 `POSITION_UNAVAILABLE`.

## 지도

지도 SDK와 API 키 없이 OpenStreetMap 지도 조각을 좌표로 계산해 깔고 핀과 정확도 원을 그린다(`TileMap`). 끌기·확대는 없다. 크게 볼 때는 '지도 앱에서 보기'(`geo:` 링크)로 휴대폰 지도 앱을 연다. 서버는 주소를 채우지 않으므로 좌표만 쓴다.

## 테스트

- `adb logcat -s Sonullim` → "위치 요청 → JS 작업 시작"
- 당사자 앱을 최근 앱에서 지운 뒤 보호자 위치 탭에서 새로고침 → 핀이 새 시각으로 바뀌는지
