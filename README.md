# 흑과백 (Black & White)

모바일 기준 2인 대전 웹게임

## 현재 상태 (2025-10-20)

- ✅ PostgreSQL Docker 실행 중
- ✅ 프론트엔드 구조 완성
- ✅ 백엔드 구조 완성
- ⚠️  백엔드 TypeScript 빌드 이슈 (paths alias 문제)

## 빠른 시작

### 1. PostgreSQL 실행

```bash
docker run -d --name hukbaek-db \
  -e POSTGRES_DB=hukbaek \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  -p 5432:5432 \
  postgres:latest
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

### 3. 의존성 설치

```bash
pnpm install
```

### 4. Shared 패키지 빌드

```bash
cd packages/shared && pnpm build
```

### 5. 백엔드 실행 (임시 해결책)

```bash
cd apps/backend
npm install -g ts-node tsconfig-paths
ts-node -r tsconfig-paths/register src/main.ts
```

### 6. 프론트엔드 실행

```bash
cd apps/frontend
pnpm dev
```

## 기술 스택

- **Frontend**: React + TypeScript + Vite + Zustand + SCSS Module (BEM)
- **Backend**: Nest.js + TypeScript + WebSocket (Socket.io)
- **Database**: PostgreSQL + TypeORM
- **Infrastructure**: AWS EC2 + Nginx + PM2 + HTTPS (Certbot)

## 게임 규칙

- 타일: 0~8 (흑: 0,2,4,6,8 / 백: 1,3,5,7)
- 1라운드 선공 랜덤, 이후 승자 선공
- 무승부 시 선공 유지
- 딜러(서버)만 타일 숫자 확인 → 승패만 통지
- 매치 포맷: bo1, bo3, bo5 (연장 여부 선택 가능)

## 알려진 이슈

### TypeScript Paths Alias 문제

Nest.js의 `nest build`가 `@shared/*` paths를 해결하지 못하는 문제.

**해결 방법 1**: `ts-node` 사용
```bash
cd apps/backend
ts-node -r tsconfig-paths/register src/main.ts
```

**해결 방법 2**: 상대 경로로 변경
모든 `@shared/*` import를 상대 경로로 변경
```typescript
// Before
import { RoomFormat } from '@shared/types/game.js';

// After
import { RoomFormat } from '../../../packages/shared/types/game.js';
```

**해결 방법 3**: ttsc (TypeScript Transformer) 사용
```bash
pnpm add -D ttypescript typescript-transform-paths
```

## 프로젝트 구조

```
black-and-white/
├── apps/
│   ├── frontend/        # React 프론트엔드
│   └── backend/         # Nest.js 백엔드
├── packages/
│   └── shared/          # 공용 타입 및 상수
└── infra/               # 인프라 설정
```

## 라이선스

MIT
