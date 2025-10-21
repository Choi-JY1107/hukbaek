# 흑과백 (Black & White)

2인용 타일 뒤집기 게임

## 🚀 빠른 시작 (Docker)

Docker만 있으면 한 번에 모든 것을 실행할 수 있습니다!

### 필요한 것
- Docker Desktop 설치 ([다운로드](https://www.docker.com/products/docker-desktop/))

### 실행 방법

```bash
# 1. Docker Compose로 모든 서비스 실행
docker-compose up

# 또는 백그라운드로 실행
docker-compose up -d
```

그게 전부입니다! 🎉

- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:4000/api
- **데이터베이스**: PostgreSQL (localhost:5432)

### 서비스 중지

```bash
# 중지
docker-compose down

# 중지 + 데이터 삭제
docker-compose down -v
```

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스만
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 재빌드

코드를 수정한 후:

```bash
# 이미지 재빌드 후 실행
docker-compose up --build
```

## 🎮 게임 규칙

1. 두 플레이어가 번갈아가며 타일을 뒤집습니다
2. 각 라운드마다 자신의 색깔이 많으면 승리
3. 총 5라운드 진행
4. 최종적으로 더 많은 라운드를 이긴 플레이어가 승리

## 🛠️ 기술 스택

- **Frontend**: React, TypeScript, Vite, Redux Toolkit, Socket.IO Client
- **Backend**: NestJS, TypeScript, Socket.IO, PostgreSQL
- **Database**: PostgreSQL 16
- **DevOps**: Docker, Docker Compose

## 📦 수동 설치 (Docker 없이)

Docker를 사용하지 않으려면:

### 필요한 것
- Node.js 20+
- pnpm
- PostgreSQL 16

### 설정

```bash
# 1. 의존성 설치
pnpm install

# 2. PostgreSQL 설정
createdb black_and_white
psql -d black_and_white -f apps/backend/src/database/schema.sql

# 3. 환경 변수 설정
# .env 파일 수정 (DATABASE_HOST=localhost로)

# 4. 백엔드 실행
cd apps/backend
pnpm dev

# 5. 프론트엔드 실행 (새 터미널)
cd apps/frontend
pnpm dev
```

## 🚢 프로덕션 배포

프로덕션 배포는 [DEPLOYMENT.md](DEPLOYMENT.md)를 참고하세요.

- **Backend**: Fly.io
- **Frontend**: Vercel
- **Database**: Neon PostgreSQL

## 🐛 문제 해결

### Docker 컨테이너가 시작되지 않을 때

```bash
# 모든 컨테이너와 볼륨 삭제 후 재시작
docker-compose down -v
docker-compose up --build
```

### 포트가 이미 사용 중일 때

```bash
# 5173, 4000, 5432 포트를 사용하는 프로세스 확인
lsof -i :5173
lsof -i :4000
lsof -i :5432

# 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 연결 오류

```bash
# 데이터베이스 헬스 체크
docker-compose ps

# DB 컨테이너 재시작
docker-compose restart db
```

## 📝 개발 팁

### Hot Reload
Docker Compose는 volume을 사용하므로, 코드를 수정하면 자동으로 반영됩니다.

### 데이터베이스 초기화

```bash
# 데이터베이스 볼륨 삭제
docker-compose down -v

# 재시작 (스키마 자동 생성)
docker-compose up
```

### 패키지 추가

```bash
# 로컬에서 패키지 추가
cd apps/backend  # 또는 apps/frontend
pnpm add <package-name>

# Docker 이미지 재빌드
docker-compose build backend  # 또는 frontend
docker-compose up
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
