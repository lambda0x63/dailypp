# DailyPP (데일리 피피)

사용자의 PP 및 실력을 분석하여 매일 새로운 osu! 비트맵을 추천하는 웹 서비스

## 핵심 기능

### 맞춤형 추천 시스템
- **개인화된 난이도 제공** 사용자의 Top Play 데이터를 기반으로 최적화된 난이도 범위 자동 산출
- **단계별 챌린지** Easy, Normal, Hard의 세 단계 난이도별 데일리 비트맵 추천 로직 가동
- **스마트 알고리즘** 안정적인 플레이 가능 범위를 계산하여 적정 수준의 도전 과제 선정

### 활동 추적 및 통계
- **성취 지표 시각화** Chart.js 라이브러리 연동 PP 성장 곡선 및 난이도별 클리어 통계 시각화
- **챌린지 관리** 일간/주간 챌린지 달성률 추적 및 연속 달성 기록(Streak) 관리 시스템 탑재
- **상세 정보 제공** 추천 맵의 BPM, 곡 길이, 예상 획득 PP 등 핵심 정보 실시간 표시

### 서비스 접근성
- **단축 데모 모드** 별도의 로그인 절차 없이 서비스의 핵심 기능을 체험할 수 있는 `/demo` 경로 제공
- **osu! OAuth 연동** 공식 API 연결을 통한 안전한 계정 인증 및 실시간 플레이 데이터 동기화

## 기술 스택

- **프레임워크** SvelteKit
- **스타일링** Tailwind CSS
- **데이터 저장 및 캐싱** Upstash Redis / Vercel KV
- **인증 시스템** Auth.js (osu! OAuth)
- **시각화 엔진** Chart.js

## 추천 알고리즘 기준

사용자별 적정 난이도(Star Rating) 산출 공식
- **공식** `안정적 Top Play SR + 난이도별 오프셋 ± 가중치`
- **Easy** 기준점 대비 -1.0 수준의 원활한 플레이 가능 범위
- **Normal** 기준점 대비 -0.5 수준의 적정 난이도
- **Hard** 사용자 최고 기량에 근접한 도전적인 난이도

## 시작 가이드

### 환경 변수 구성
`.env` 파일 내 필수 토큰 및 주소 입력
```bash
AUTH_OSU_ID=your_client_id
AUTH_OSU_SECRET=your_client_secret
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 설치 및 구동
```bash
# 의존성 패키지 설치
npm install

# 로컬 개발 서버 실행
npm run dev
```

## 시스템 아키텍처

- **서버리스 아키텍처** Vercel Serverless Functions 기반의 효율적인 리소스 관리
- **TTL 캐싱** Redis를 활용한 데일리 챌린지 데이터의 24시간 주기 자동 갱신 및 유지
- **스테이트리스 설계** 세션 데이터 중심의 가벼운 클라이언트 상태 관리 구조 채택

## 라이선스

MIT License
