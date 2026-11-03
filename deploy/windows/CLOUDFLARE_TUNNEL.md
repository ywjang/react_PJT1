# Cloudflare Tunnel 연결 절차

2026-11-02 / 상태: 설정 준비, 실제 서버 설치·공개 터널 실행 미완료.
기존 공개 80/443 포트 방식 대신 아래 구성을 사용한다.

```text
GitHub Pages React
  → https://발급주소/api (Authorization 헤더)
  → Cloudflare Tunnel
  → 같은 서버의 Caddy 127.0.0.1:18091 (인증·CORS·쓰기 차단)
  → 같은 서버의 Spring Boot 127.0.0.1:8091 (public 프로필)
  → Oracle (내부망)
```

서버는 192.168.0.130, Windows 계정은 DESKTOP-J9J4700\user로 사용자가 확인했다.
서버의 8091 연결 거부가 마지막 보고 상태다. 이 문제가 먼저 해결되어야 한다.
개발 PC의 localhost와 서버의 localhost는 다르다. 아래 1~5는 서버에서 수행한다.

## 1. 백엔드 시작

Java 17로 기존 안내의 JAR를 oracle11g,public 프로필로 실행한다.
초기화 never, ddl-auto none, 주소 127.0.0.1, 포트 8091을 유지한다.
실행 창을 닫지 않는다. 서버 브라우저에서 다음 응답을 확인한다.

```text
http://127.0.0.1:8091/api/system
```

connected=true, mode=oracle여야 한다. 연결 거부이면 터널로 해결되지 않는다.

## 2. 도구와 파일 준비

서버 C:\AcademicPJT1에 공식 Windows x64 실행 파일을 준비한다.

- cloudflared.exe: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
- caddy.exe: https://caddyserver.com/download

도구의 공식 릴리스 체크섬을 확인한다. cloudflared는 설치/검증했다고 기록하지 않는다.
프로젝트 deploy\windows 폴더도 C:\AcademicPJT1\deploy\windows로 복사한다.
Caddyfile.tunnel, Start-TunnelGateway.ps1, Start-QuickTunnel.ps1을 함께 둔다.
예전 Start-HttpsProxy.ps1은 직접 HTTPS 공개 방식용이므로 이번 방식에서는 실행하지 않는다.

## 3. 웹 조회 계정 준비

기존 Save-OracleSecret.ps1이 만든 private 디렉터리는 권한 제한이 적용된다.
없으면 해당 스크립트를 먼저 실행하여 생성한다. 생성된 oracle.xml은 외부로 복사하거나 Git에 올리지 않는다.
이 디렉터리가 이미 있다면 스크립트가 중단하는 것이 정상이다. 기존 내용을 덮어쓰지 않는다.

서버에서 다음 명령을 실행한다. 웹 비밀번호는 Oracle/Windows와 다른 새 비밀번호를 사용한다.

```powershell
& 'C:\AcademicPJT1\caddy.exe' hash-password |
    Set-Content -Encoding ascii -LiteralPath 'C:\ProgramData\AcademicPJT1\private\viewer.hash'
```

명령 실행 후 도구가 요청하는 숨김 입력으로 비밀번호를 입력한다.
기존 viewer.hash가 있다면 먼저 사용 계정/영향을 확인하고 무작정 덮어쓰지 않는다.
비밀번호·해시·터널 토큰을 GitHub, 채팅, VITE 변수에 저장하지 않는다.

## 4. 게이트웨이 시작 (서버의 두 번째 PowerShell)

```powershell
cd C:\AcademicPJT1\deploy\windows
.\Start-TunnelGateway.ps1 -ViewerUser viewer
```

이 창을 유지한다. 서버 브라우저에서 http://127.0.0.1:18091/api/system에 접속하면
웹 계정 인증이 요청되어야 한다. viewer와 웹 비밀번호로 응답을 확인한다.
무인증 요청은 401, 쓰기 요청은 403으로 차단한다.
Caddyfile.tunnel은 18091을 127.0.0.1에만 바인딩한다. 외부 인바운드 허용 규칙이 필요하지 않다.

## 5. 임시 Quick Tunnel 시작 (서버의 세 번째 PowerShell)

```powershell
cd C:\AcademicPJT1\deploy\windows
.\Start-QuickTunnel.ps1
```

이 창에 실제 https://임의이름.trycloudflare.com 주소가 표시된다. 그 주소를 사용한다.
도메인·Cloudflare 계정 없이 테스트 가능하다. 프로세스를 종료하면 주소가 끊기고 새 실행에서 주소가 달라진다.
Quick Tunnel은 개발 검증용이며 운영 가용성을 보장하지 않는다.
학교 방화벽이 연결을 막으면 담당자에게 cloudflared의 외부 7844 UDP/TCP 연결 정책을 확인한다.
Windows/공유기 인바운드 80,443,8091,1521,3389를 열지 않는다.

검증:

```powershell
.\Test-PublicBackend.ps1 -BaseUrl 'https://실제로발급된주소.trycloudflare.com/'
```

웹 조회 계정(viewer)으로 검사한다. 위 예시 주소 자체를 입력하지 않는다.
외부 HTTPS·인증·CORS·Oracle 응답 확인이 모두 성공해야 다음으로 간다.

## 6. 개발 PC에서 GitHub Pages 연결

GitHub 저장소 Settings → Secrets and variables → Actions → Variables.
Repository variable VITE_API_BASE_URL의 값을 실제 발급 주소 뒤에 /api를 붙여 설정한다.

```text
https://실제주소.trycloudflare.com/api
```

기존 deploy.yml은 vars.VITE_API_BASE_URL을 빌드에 전달한다.
배포 파일이 GitHub에 반영되었는지 확인 후 Actions에서 Run workflow로 다시 빌드한다.
브라우저 강력 새로고침만으로 빌드 환경변수는 바뀌지 않는다.
사이트의 '서버 로그인'에서 viewer와 웹 비밀번호로 접속한다.
이 자격증명은 페이지 메모리에만 두며 새로고침 후 다시 입력한다.
공개 사이트는 조회 전용이며 등록/수정/삭제 API는 차단된다.

## 7. 고정 주소 전환

고정 운영 주소에는 Cloudflare 계정과 Cloudflare에서 관리하는 도메인이 필요하다.
Cloudflare 대시보드 Networking → Tunnels → Create Tunnel에서 academic-pjt1을 만든다.
화면의 Windows 커넥터 설치 안내를 서버에서 수행한다. 터널 토큰은 비밀이며 채팅에 붙이지 않는다.
Published application route의 공개 호스트를 api.보유도메인으로 정하고,
Service URL을 http://127.0.0.1:18091로 설정한다. 직접 8091로 지정하면 인증/CORS 계층을 우회하므로 금지한다.
cloudflared 서비스 시작, Caddy·Java의 재부팅 후 시작 및 장애 복구도 별도로 구성·검증한다.
cloudflared만 서비스로 설치해도 Java/Caddy는 자동 서비스가 되지 않는다.
고정 주소 검증 후 GitHub 변수 변경·재배포하고 기존 Quick Tunnel을 종료한다.

## 미실행 항목

실제 서버 파일 복사, cloudflared 다운로드/설치, 실제 터널 생성, 서비스 등록,
Cloudflare 계정 인증, DNS 연결, GitHub 변수 변경, 서버 재시작은 이 문서 작성만으로 수행되지 않는다.
기존 DB의 테이블/데이터 변경은 필요하지 않으며 이번 구성에서 수행하지 않는다.

## 공식 문서

- https://developers.cloudflare.com/tunnel/get-started/
- https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
- https://caddyserver.com/docs/caddyfile/directives/basic_auth
