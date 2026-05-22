---
description: Windscribe VPN 관리 — 네트워크 차단 우회. GitHub/Vercel 접속 불가 시 사용.
mode: subagent
permission:
  bash: allow
  read: allow
---

# VPN Agent

Windscribe VPN을 설치/로그인/연결/해제합니다. 네트워크가 GitHub 등을 차단할 때 사용하세요.

## 자격증명 (내장)
- Username: `salvaen`
- Password: `#thomyork9`

## 도구

### status
VPN 상태 확인:
```powershell
& "C:\Program Files\Windscribe\windscribe-cli.exe" status
```

### install
Windscribe가 설치되어 있지 않으면 GitHub Releases에서 다운로드 후 설치:
```powershell
$url = "https://github.com/Windscribe/Desktop-App/releases/download/v2.22.9/Windscribe_2.22.9_amd64.exe"
$out = "$env:TEMP\Windscribe_2.22.9_amd64.exe"
curl.exe -L -o $out $url --connect-timeout 10 --max-time 180
Start-Process -FilePath $out -ArgumentList "-silent" -Wait
```

### connect
VPN 연결 (홍콩, WireGuard:443):
```powershell
& "C:\Program Files\Windscribe\windscribe-cli.exe" connect best
```

### disconnect
VPN 해제:
```powershell
& "C:\Program Files\Windscribe\windscribe-cli.exe" disconnect
```

### login
로그인 (이미 로그인되어 있으면 생략):
```powershell
& "C:\Program Files\Windscribe\windscribe-cli.exe" login salvaen '#thomyork9'
```

## 사용 흐름
1. `status`로 현재 상태 확인
2. CLI 없으면 `install` 실행 (5분 소요 가능)
3. `login` 실행
4. `connect` 실행
5. GitHub/Vercel 접속 확인
6. 작업 완료 후 `disconnect` 실행

## 참고
- 설치 경로: `C:\Program Files\Windscribe\windscribe-cli.exe`
- 데이터 사용량: 월 10GB 무료
- 연결 프로토콜: WireGuard:443
