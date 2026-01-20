# DailyPP

osu! 개인 맞춤형 비트맵 추천 및 데일리 챌린지 서비스

## 추천 알고리즘 상세

### 1. 안정 난이도 기준점 계산 (Stable Top Play Stars)

```typescript
// 사용자의 Best 10 플레이 중 95% 이상 정확도 상위 3개 추출
const highAccuracyScores = bestScores
  .filter(score => score.accuracy >= 0.95)
  .slice(0, 3)

// 모드별 난이도 보정
if (mods.includes('DT') || mods.includes('NC')) {
  difficulty *= 1.4  // Double Time 보정
}
if (mods.includes('HR')) {
  difficulty *= 1.05  // Hard Rock 보정
}
if (mods.includes('EZ') || mods.includes('HT')) {
  return 0  // Easy/Half Time 제외
}

stableTopPlayStars = max(adjustedDifficulties)
```

### 2. PP 구간별 난이도 범위

#### 초급 구간 (PP < 1000)
```
PP <= 300:
  EASY:   2.0 ~ 2.3★
  NORMAL: 2.3 ~ 2.6★
  HARD:   2.6 ~ 2.9★

PP 301-600:
  EASY:   2.5 ~ 2.8★
  NORMAL: 2.8 ~ 3.1★
  HARD:   3.1 ~ 3.4★

PP 601-999:
  EASY:   3.0 ~ 3.3★
  NORMAL: 3.3 ~ 3.6★
  HARD:   3.6 ~ 4.0★
```

#### 중급 이상 (PP >= 1000)
```
난이도 = stableTopPlayStars + offset ± 0.3

offset:
  EASY:   -1.0
  NORMAL: -0.5
  HARD:    0.0

최소 난이도: 2.0★ (하한선)
```

### 3. 비트맵 검색 조건

#### 필수 조건
- 상태: ranked (랭크 맵만)
- 모드: osu! (스탠다드)
- 길이: 30~300초 (3개 범위 중 랜덤)
  - 30~120초 (짧은 곡)
  - 120~180초 (중간 곡)
  - 180~300초 (긴 곡)

#### 정렬 방식 (랜덤 선택)
- `popularity_desc`: 인기순
- `difficulty_desc`: 난이도 높은순
- `difficulty_asc`: 난이도 낮은순
- `plays_desc`: 플레이 수 많은순
- `random`: 무작위

#### 중복 방지
- 최근 선정된 비트맵셋 2개 제외
- 검색 결과 상위 30개 중 랜덤 선택

## 챌린지 시스템

### 생성 규칙
```typescript
// 매일 00:00 KST 기준 새로운 챌린지 생성
challengeKey = `challenge:${userId}:${YYYY-MM-DD}`

// 3개 난이도별 비트맵 병렬 생성
challenges = await Promise.all([
  findSuitableBeatmap(userPP, 'EASY', userId),
  findSuitableBeatmap(userPP, 'NORMAL', userId),
  findSuitableBeatmap(userPP, 'HARD', userId)
])

// Redis 24시간 TTL 캐싱
await kv.setex(challengeKey, 86400, challengeData)
```

### 클리어 조건
- S랭크 이상 (정확도 90%+)
- 24시간 이내 플레이
- Fail 기록 제외

### 통계 추적
- 일간/주간 완료율
- 연속 달성 기록 (Streak)
- PP 성장 그래프
- 난이도별 클리어 통계

## 기술 스택

- SvelteKit (SSR + API Routes)
- TypeScript
- Tailwind CSS
- Chart.js (통계 시각화)
- Upstash Redis (Vercel KV)
- osu! OAuth 2.0
- JWT (세션 관리)
- date-fns (날짜 처리)

## 설치

```bash
npm install
npm run dev
```

## 환경 변수

```env
# osu! OAuth
OSU_CLIENT_ID=...
OSU_CLIENT_SECRET=...
OSU_REDIRECT_URI=http://localhost:5173/auth/callback

# Auth
AUTH_SECRET=...  # openssl rand -base64 32

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## 구조

```
src/
├── lib/
│   ├── server/
│   │   ├── osu-api.ts       # osu! API v2 연동
│   │   ├── kv.ts            # Redis 캐싱
│   │   ├── config.ts        # 환경 설정
│   │   └── errors.ts        # 에러 핸들링
│   └── types.ts             # 타입 정의
├── routes/
│   ├── api/
│   │   ├── challenges/      # 챌린지 생성/완료/피드백
│   │   └── user/            # 사용자 통계/히스토리
│   ├── auth/                # OAuth 콜백
│   ├── dashboard/           # 대시보드
│   └── profile/             # 프로필
└── hooks.server.ts          # 세션 검증
```

## API 엔드포인트

- `GET /api/challenges` - 오늘의 챌린지 조회/생성
- `POST /api/challenges/complete` - 챌린지 완료 확인
- `POST /api/challenges/feedback` - 난이도 피드백
- `GET /api/user/dashboard` - 대시보드 데이터
- `GET /api/user/stats` - 통계 조회
- `GET /api/user/history` - 챌린지 히스토리
- `GET /api/user/pp-history` - PP 성장 기록
