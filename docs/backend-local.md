# 로컬 Docker 백엔드 연결

기존 API 클라이언트와 로그인·계정 연결 흐름을 그대로 사용한다. 백엔드 최신 `dev`는 PostgreSQL과 Spring Boot를 함께 실행하며 기본 API 포트는 `8080`이다.

## 백엔드 실행 (PowerShell)

Docker Desktop을 설치하고 Linux 컨테이너 엔진이 실행 중이어야 한다. 최초 설치 시 WSL 2 설치와 Windows 재시작이 필요할 수 있다.

이미 있는 형제 폴더 `backend`에서 실행한다. 새 환경에서는 먼저 `git clone https://github.com/hackathon-line4/backend.git`으로 받는다.

```powershell
cd ..\backend
git checkout dev
git pull --ff-only origin dev
docker compose up -d --build
docker compose ps
docker compose logs --tail 100 app
```

`--build`는 일반 하이픈 두 개를 쓴다. 로컬 DB 계정과 JWT 개발용 키는 Compose에 기본값이 있어 `.env` 없이 실행할 수 있다. 값 변경이 필요할 때만 백엔드의 `.env.example`을 `.env`로 복사한다.

형제 폴더의 백엔드를 최신화한 뒤에는 프론트 폴더에서도 `npm run backend:up`, `npm run backend:status`, `npm run backend:logs`, `npm run backend:down`으로 관리할 수 있다.

준비 여부는 `http://localhost:8080/v3/api-docs`, API 목록은 `http://localhost:8080/swagger-ui/index.html`에서 확인한다. 컨테이너가 시작돼도 최초 이미지 빌드와 앱 초기화가 끝날 때까지 기다린다.

## 프론트 실행

프로젝트 루트의 Git에서 제외된 `.env.local`에 휴대폰에서 접근 가능한 PC 주소를 지정한다.

```dotenv
EXPO_PUBLIC_API_URL=http://<PC의 Wi-Fi IPv4 주소>:8080
```

PowerShell의 `ipconfig`로 실제 Wi-Fi 어댑터의 IPv4 주소를 확인한다. VMware 등 가상 어댑터 주소를 쓰지 않는다. Wi-Fi가 바뀌면 주소를 갱신한다. `/api/v1`은 기존 클라이언트가 자동으로 붙인다.

```powershell
cd ..\frontend
npx expo start --dev-client
```

앱을 전체 새로고침한 뒤 로그인한다. PC와 휴대폰을 같은 네트워크에 연결하고, 휴대폰 브라우저에서도 `http://<PC 주소>:8080/v3/api-docs`가 열리는지 확인한다. 열리지 않으면 Windows 방화벽의 로컬 TCP 8080 허용과 학교·공용 Wi-Fi의 기기 간 접속 제한을 확인한다.

Android 에뮬레이터는 `http://10.0.2.2:8080`, 같은 PC의 웹은 `http://localhost:8080`을 사용할 수 있다. 현재 백엔드 SecurityConfig에는 웹용 CORS 설정이 없으므로 브라우저 프론트 연결은 별도 설정이 필요하다. 모바일 development build를 기준으로 검증한다.

보호자·당사자 계정으로 가입 → 역할 선택 → 연결 코드 생성 → 코드 입력 → 요청 → 승인 → 앱 재실행 후 연결 복원을 확인한다. 최신 백엔드 `dev`에는 `/me`의 실제 연결·승인 대기 조회와 연결 요청 API가 포함되어 있다.

로컬 프로파일의 푸시는 로그로만 남는다. 컨테이너 실행만으로 실기기 FCM 푸시가 활성화되지는 않는다.

## 종료

```powershell
cd ..\backend
docker compose down
```

DB 데이터는 볼륨에 보존된다. `down -v`는 사용하지 않는다.
