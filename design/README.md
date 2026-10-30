# 손울림 디자인 핸드오프 (Claude Code용)

이 폴더를 앱 저장소에 `design/` 같은 이름으로 넣고, Claude Code에게 아래처럼 시키면 돼요.

## 들어 있는 것
- `screens/*.dc.html` — 와이어프레임 화면 원본 (HTML + 인라인 CSS). 레이아웃·간격·문구·접근성 레이블의 기준.
  - 캔버스 전용 형식이라 브라우저에서 단독으로 열면 일부 깨질 수 있어요. 코드로 읽는 참고 자료로 쓰세요.
  - `{{accent}}` 같은 자리는 `#F5C84C`(yellow-500)로 바꿔 읽으면 돼요.
- `screens/DS-*.dc.html` — 디자인 기준 · 공통 컴포넌트 · 에셋 시트
- `tokens.json` — 컬러·타이포·간격·반경·그림자·터치 영역·리듬 표기 토큰
- `screen-map.md` — 화면 번호/파일 목록 + 화면별 인터랙션 메모 원문
- `canvas.json` — 캔버스 배치 정보 (참고용)

## Claude Code에 줄 첫 지시 예시
```
design/ 폴더의 README, tokens.json, screen-map.md를 먼저 읽어 줘.
tokens.json으로 테마(색·타이포·간격)를 만들고,
DS-Components 시트를 보고 Button, TextField, SignalBadge, StatusChip,
RhythmGlyph, Card, TabBar, RecipientScreen 컴포넌트를 먼저 구현해 줘.
그다음 screen-map 순서대로 screens/*.dc.html을 하나씩 화면으로 옮겨 줘.
문구·aria-label·상태 정의는 원본 그대로 유지해.
```

## 꼭 지켜야 할 규칙
- 상태는 색 + 아이콘 + 글자를 함께. 색만으로 구분하지 않기
- 보호자 앱 터치 영역 최소 48, 당사자 앱 최소 72 (주요 조작은 화면 전체)
- '기기 전달'과 '터치 응답'은 별도 상태. 진동 재생 = 인지 아님, '응답 완료' = 명시적 터치가 서버에 기록된 경우만
- '읽음', '이해함' 표현 금지
- 진동 리듬은 신호 데이터에서만 생성. 박자 길이(0.2/0.5/0.9초)와 확인·실패 진동은 아직 검증 전 값
- 위치는 정책 확정 전 (도움 요청 시 1회 공유 vs 위치 탭 상시 공유 — 기획 결정 필요)
