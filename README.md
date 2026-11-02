# react_PJT1 · 학사관리 시스템

첨부 이미지의 상단 제목, 메뉴 탭, 파란 안내 배너, 통계 카드 네 개, 빠른 실행 카드 세 개, 하단 요약을 한글로 구현한 React + Spring Boot 프로젝트입니다.

## 1. 실행 위치

공유폴더는 보관용입니다. Vite와 Windows CMD의 UNC 경로 문제를 피하려면 로컬 폴더에서 실행하세요. 현재 실행용 복사본: C:\Temp\react_study\react_PJT1

첫 설치: npm ci

터미널 1 (프로젝트 폴더): npm run backend

Oracle 비밀번호를 숨김 입력합니다. 기존 react18과 같은 Oracle 11g, 192.168.0.130:1521:HJDB, scott 계정을 사용합니다. 비밀번호는 파일에 저장하지 않습니다. 다른 계정은 ORACLE_JDBC_URL, ORACLE_USERNAME, ORACLE_PASSWORD 환경변수로 지정합니다.

터미널 2 (같은 폴더): npm run dev

화면: http://127.0.0.1:5181
API: http://localhost:8091
기존 react18의 5179/8086과 충돌하지 않습니다.

## 2. 화면과 동작

- 대시보드: 전체 학생, 수강 학생, 미수강 학생, 전체 과목. 실제 COUNT와 EXISTS 조회를 사용합니다. 재학/휴학 컬럼이 없으므로 이미지의 활성/비활성 통계를 수강 유무로 해석했습니다.
- 학생: 학번, 학생명, 학과, 학년, 반, 성별, 키, 몸무게. 등록/상세/수정/삭제, 검색, 10건 단위 페이징.
- 과목: 과목번호, 과목명, 담당교수, 대상 학년, 개설 학과. 등록/상세/수정/삭제와 검색.
- 수강·성적: 학번과 과목번호를 연결하고 학생명/과목명을 JOIN 조회. 등록/상세/성적 수정/삭제와 검색.
- 수강 내역이 있는 학생·과목은 삭제 불가. 수강 내역 삭제 후 삭제 가능합니다.
- 식별 번호는 수정 불가. 수강은 과목번호+학번 복합 식별자로 처리합니다.
- 검색어는 바인딩 변수, 테이블·컬럼명은 고정 목록. Oracle 11g ROWNUM 기반 정렬 페이징입니다.
- 프런트 입력값 검증, 서버 재검증, 저장 중 중복 클릭 방지, 오류 시 입력 보존, 삭제 확인, 모달 키보드 이동 적용.

## 3. 테이블과 학습 규칙

기존 STUDENT, SUBJECT, ENROL을 사용하며 Oracle 테이블 생성/초기화/샘플 삽입은 수행하지 않습니다. ddl-auto=none, sql.init.mode=never입니다.

학생 필수: 학번(1~99999999 정수), 이름(20자 이하), 학과(20자 이하), 학년(1~4), 반(1자), 성별. 키(50~250), 몸무게(10~300)는 선택 입력입니다.
과목 필수: 과목번호(1~999 정수), 과목명/담당교수/학과(20자 이하), 학년(1~4).
수강 필수: 존재하는 과목번호/학번, 성적(0~100 정수). 0점도 유효합니다.
이 범위는 애플리케이션의 실습 규칙입니다. 기존 DB의 바이트 길이, 제약조건, 트리거에 따른 거절은 409 한글 오류로 안내합니다.

## 4. 강의 내용 연결

컴포넌트/props로 대시보드·목록·입력창 분리 → useState/useEffect로 화면과 API 상태 관리 → Axios로 요청 → Controller → Service → Repository → Oracle.
12강 REST API, 13강 계층 구조, 14~15강 Oracle 연결·조회, 16강 CRUD, 17강 검색·페이징, 18강 입력값 검증·예외처리를 통합했습니다. 로그인·권한·배포는 이 프로젝트의 구현 범위에 포함하지 않았습니다.

주요 소스: src/App.jsx(화면), src/academic.js(한글 항목과 검증), src/App.css(첨부 디자인), backend/src/main/java/com/example/academic/(API 계층).

## 5. 테스트 및 실습 모드

npm run build / npm run lint / npm test
백엔드: cd backend 후 .\mvnw.cmd test

백엔드 통합 테스트는 H2 격리 DB를 사용하며 Oracle 원본 데이터를 변경하지 않습니다.
비밀번호 없이 화면을 확인하려면 npm run backend:demo를 사용합니다. 합성 학생 5명, 과목 5개, 수강 학생 3명을 메모리 DB에 생성하며 서버 종료 시 사라집니다. 화면에도 '실습 데이터 연결됨'을 표시합니다. Oracle과 구분해서 사용하세요.

Oracle 확인 순서: /api/system의 database=Oracle, mode=oracle, connected=true → /api/dashboard → 학생/과목/수강 목록 → 별도 실습용 번호를 등록하여 수정/삭제.

## 6. API

GET /api/system, GET /api/dashboard
GET /api/academic/students?q=&page=0&size=10 (subjects, enrolments도 동일)
POST/PUT /api/academic/{종류}: 테이블의 대문자 컬럼명을 JSON 키로 전달
DELETE /api/academic/students/{학번}
DELETE /api/academic/subjects/{과목번호}
DELETE /api/academic/enrolments/{과목번호}?student={학번}

종류는 students / subjects / enrolments입니다. 삭제·수정은 기존 Oracle DB에 실제 반영됩니다.

## 7. 현재 미리보기에서 Oracle로 전환

현재 5181/8091은 H2 실습 모드입니다. 프로젝트 폴더에서 .\scripts\stop-preview.ps1 -BackendOnly 로 실습 백엔드를 중지한 다음 npm run backend 를 실행하고 Oracle 비밀번호를 입력하세요. 프런트엔드는 계속 실행되므로 브라우저에서 새로고침하면 됩니다.
전체 미리보기 종료: .\scripts\stop-preview.ps1

## 8. Bootstrap 적용

Bootstrap 5.3.8을 npm 의존성으로 추가했습니다. 새 설치와 업데이트 시 프로젝트 루트에서 npm ci를 실행합니다. 기존 npm run backend / npm run backend:demo / npm run dev 명령과 8091/5181 포트를 그대로 사용합니다.

- src/main.jsx에서 Bootstrap CSS를 먼저 가져온 뒤 App.css를 적용합니다.
- 메뉴: nav/nav-pills, 통계·빠른 실행: row/col/card, 버튼: btn 계열.
- 입력: form-control/form-select/is-invalid/invalid-feedback, 오류·성공 안내: alert 계열.
- 목록: table/table-hover/table-responsive, 페이지 이동: pagination/page-link, 로딩: spinner-border.
- 입력·상세·삭제창: Bootstrap modal 구조를 사용하고 열기·닫기·키보드 이동은 기존 React 상태로 관리합니다. Bootstrap JavaScript 플러그인은 별도 로드하지 않습니다.
- App.css는 참조 이미지의 파란 배너·한글 글꼴·색상·여백을 유지하는 테마입니다.
- 좁은 화면에서는 통계 카드가 2열, 빠른 실행 카드와 입력 항목이 1열로 바뀝니다. 긴 목록은 표 영역에서 가로 스크롤됩니다.

공유폴더 보관본과 C:\Temp\react_study\react_PJT1 실행본에 함께 반영했습니다. 이번 변경은 화면 스타일과 마크업이며 API·DB 처리 코드는 변경하지 않았습니다.

공식 참고: https://getbootstrap.com/docs/5.3/getting-started/vite/

## 9. 친근한 학사관리 일러스트

대시보드 파란 안내 배너에 함께 공부하는 학생·책·노트북·화분 일러스트를 추가했습니다.

- 파일: public/images/academic-friends.png (1536×1024, 투명 배경 PNG, AI 생성).
- App.jsx에서 /images/academic-friends.png를 불러오며 외부 이미지 서버가 필요하지 않습니다.
- 데스크톱에서는 배너 오른쪽, 모바일에서는 제목 아래에 배치합니다.
- 학생·과목·수강 목록에서는 배너를 간결하게 유지하도록 이미지가 숨겨집니다.
- 원본 이미지는 public에 보관되고 npm run build 시 dist/images에도 포함됩니다.

## 10. 밝은 캠퍼스 포털 테마

하늘색·아이보리·민트 팔레트와 기존 학생 일러스트를 결합한 포털 화면으로 단장했습니다.

- src/campus-theme.css를 Bootstrap과 App.css 다음에 불러옵니다. 기본 레이아웃과 테마를 구분해 관리합니다.
- 배너: 은은한 원형 장식, 확대된 일러스트, 학생 조회·등록 바로가기.
- 메뉴와 통계: 아이콘 메뉴, 색상별 카드, 인원·과목 단위, 실제 연결 상태 표시.
- 빠른 실행: 부드러운 색상과 큰 아이콘, 이동 표시, 가벼운 마우스 반응.
- 목록: 학생 이름 아바타, 학과 태그, 성적 배지, 검색 영역과 표 여백 정리.
- 학생 입력: 기본 정보와 선택 입력인 추가 정보 분리. 과목·수강 입력도 해당 정보 그룹으로 표시.
- 모바일에서는 제목을 두 줄로 정리하고 기존 반응형 카드·표·입력창을 유지합니다. 움직임 줄이기 설정도 존중합니다.

실행 명령과 포트는 기존과 같습니다. 화면을 이미 열었다면 새로고침하세요. 최신 화면은 preview-campus.jpg, 학생 목록은 preview-campus-students.jpg입니다.

## 11. 오늘의 날씨

대시보드에 Open-Meteo 실제 예보 API를 연결했습니다. 학사 DB가 Oracle이든 H2이든 날씨는 별도 외부 API에서 가져옵니다.

- 기본 지역 서울. 13개 도시(서울·인천·수원·춘천·강릉·대전·청주·대구·광주·전주·울산·부산·제주) 선택 가능.
- 위치 권한을 요청하지 않으며 고정된 도시 대표 좌표로 조회합니다. 선택은 브라우저 localStorage에 보관합니다.
- 현재 기온·날씨 코드·체감온도·습도·풍속(m/s), 오늘 최고/최저 기온과 일별 최대 강수확률을 표시합니다.
- 예보 모델 자료이며 실시간 관측값으로 표시하지 않습니다. API의 예보 기준 시각과 한국시간 날짜를 함께 표시합니다.
- 같은 도시의 응답은 sessionStorage에서 15분간 재사용하고 주기적으로 갱신합니다. 한국시간 날짜가 지난 캐시는 재사용하지 않습니다. 새로고침 버튼으로 다시 조회할 수도 있습니다.
- 12초 시간초과·연결 실패·요청 제한·잘못된 응답에 한글 오류와 재시도 제공. 이전 자료가 남아 있으면 이전 조회 결과임을 명시합니다.
- 기본 엔드포인트 https://api.open-meteo.com/v1/forecast, timezone=Asia/Seoul, temperature_unit=celsius, wind_speed_unit=ms, forecast_days=1. API 키 없이 사용하는 교육용 연동입니다. 인터넷 연결이 필요합니다.
- src/components/WeatherCard.jsx: 조회·지역 선택·상태·표시. src/weather.js: 도시 목록·코드 해석·정규화·단위·캐시 유효성. tests/weather.test.js: 데이터 처리 테스트.
- 자료 출처와 CC BY 4.0 링크를 카드에 표시했습니다. 문서: https://open-meteo.com/en/docs / 이용 조건: https://open-meteo.com/en/terms / 라이선스: https://open-meteo.com/en/licence. 무료 API는 비상업용 조건이며 상용 서비스 전환 시 이용 조건을 확인합니다.

기존 실행 명령과 5181/8091 포트는 그대로 사용합니다. 브라우저에서 새로고침하면 날씨 카드가 표시됩니다.

## 12. 지도와 이동 안내

지도 기능 검토 후 API 키 없이 바로 표시할 수 있는 OpenStreetMap 임베드와 카카오맵 공식 바로가기 URL을 적용했습니다.

| 항목 | 현재 반영 범위 |
|---|---|
| 지역 지도 | 13개 도시 중심 지도·마커·확대/축소·크게 보기 |
| 공통 지역 | App의 공통 상태로 날씨/지도 지역 선택 동기화, 기존 선택 저장 키 유지 |
| 학교·장소 검색 | 학교명·주소·역 이름을 입력하면 카카오맵 검색을 새 창으로 열기 |
| 길찾기 | 선택 지역 중심지 좌표를 카카오맵 목적지로 연결 |
| 교통정보 | 카카오맵에서 교통정보 레이어를 직접 켜 확인하도록 연결·안내 |

학교 주소가 지정되어 있지 않아 지역 중심지를 표시합니다. 화면에서도 학교 위치로 오인하지 않도록 명시했습니다. 학교의 정확한 위치는 장소 검색으로 확인합니다. 위치 권한은 요청하지 않습니다.

현재 앱 내부 지도는 일반 지도이며 실시간 소통 색상·속도·정체 데이터를 표시하거나 생성하지 않습니다. 앱 안에 교통 레이어를 직접 표시하는 확장은 카카오 지도 JavaScript 키 발급·허용 도메인 등록 후 검토할 수 있습니다. 이번 작업에서는 계정 생성·키 발급을 수행하지 않았습니다.

주요 파일: src/components/MapCard.jsx(표시·검색), src/maps.js(좌표·링크), src/regions.js(공통 지역 저장), tests/maps.test.js(유효 범위·링크·검색 인코딩·지역 저장 테스트). 지도 표시 지연 시 다시 불러오기와 새 창 보기로 복구할 수 있습니다. iframe의 load 이벤트만으로 모든 외부 지도 타일의 성공을 판정할 수는 없습니다.

출처: https://www.openstreetmap.org/copyright / 임베드 안내: https://wiki.openstreetmap.org/wiki/Export / 카카오맵 URL과 키 안내: https://apis.map.kakao.com/web/guide/ . 지도에 저작권·ODbL 출처를 표시했습니다.

## Oracle 실제 데이터 전환 및 오늘 달력 · 2026-10-30

- 사용자 승인 후 기존 H2의 학생6·과목5·수강3을 backend/backups/h2-before-oracle-20261030.json으로 보존.
- PJT1을 Oracle11g 프로필로 별도8092에서 사전 조회한 뒤 demo 서버를 종료하고 Oracle 서버8091·프런트5181 재시작.
- /api/system: database=Oracle, mode=oracle, connected=true. 학생10·과목11·수강12건이 기존 react18 Oracle 조회 건수와 모두 일치. 수강학생8·미수강학생2.
- 기존 테이블·데이터를 그대로 사용. Oracle DDL/DML은 실행하지 않음. 별도 테이블 생성·삭제나 샘플 데이터 이관이 불필요함.
- Oracle 실행 JAR: C:\Temp\react_study\react_PJT1\backend\target\academic-pjt1-oracle.jar. 비밀번호는 프로세스 환경으로 전달하고 코드·설정 파일에 저장하지 않음. 다음 수동 실행은 npm run backend에서 비밀번호 숨김 입력.
- 우측 상단 TodayCalendar 컴포넌트에 한국시간 월 달력과 오늘 날짜 강조. 날짜를 30초마다 확인하여 자동 갱신.
- frontend build·lint·기존15개 테스트 통과. 브라우저에서 Oracle 연결 표시·통계·실제 학생10행 확인. 모바일 가로 넘침 없음.