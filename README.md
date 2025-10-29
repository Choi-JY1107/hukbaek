# 흑과백 (Black & White)

2인용 실시간 타일 뒤집기 게임


<details>
<summary>📖 게임 설명</summary>

## 게임 규칙

**흑과백**은 두 명의 플레이어가 실시간으로 대결하는 전략 타일 게임입니다.

### 기본 규칙
1. 각 플레이어는 흑색 또는 백색 진영을 맡습니다
2. 두 플레이어가 번갈아가며 타일을 뒤집습니다
3. 각 라운드마다 자신의 색깔 타일이 많으면 승리
4. 총 5라운드 진행
5. 최종적으로 더 많은 라운드를 이긴 플레이어가 승리

### 게임 플레이
- WebSocket 기반 실시간 대전
- 로비에서 방 생성 또는 참여
- 준비 완료 후 자동 게임 시작
- 상대방 패 메모 기능 제공

</details>

<br><br>

## 🛠️ 기술 스택

### Frontend
<p>
  <img src="https://img.shields.io/badge/Svelte-FF3E00?style=flat&logo=Svelte&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=TypeScript&logoColor=white">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=Vite&logoColor=white">
  <img src="https://img.shields.io/badge/SCSS-CC6699?style=flat&logo=Sass&logoColor=white">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=flat&logo=Socket.io&logoColor=white">
</p>

### Backend
<p>
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=NestJS&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=TypeScript&logoColor=white">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=flat&logo=Socket.io&logoColor=white">
  <img src="https://img.shields.io/badge/TypeORM-FE0803?style=flat&logo=TypeORM&logoColor=white">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=PostgreSQL&logoColor=white">
</p>

### DevOps
<p>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=Docker&logoColor=white">
  <img src="https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white">
</p>

<br><br>

## ✨ 특징

### 🏗️ Feature-Sliced Design (FSD)
```
src/
├── app/          # 애플리케이션 초기화 및 라우팅
├── pages/        # 페이지 컴포넌트 (Lobby, Room, Game)
├── widgets/      # 복합 UI 블록 (RoomList, GameBoard, GameHistory)
├── features/     # 사용자 시나리오 (RoomCreate, RoomJoin, GamePlayTile)
├── entities/     # 비즈니스 엔티티 (room, player, game stores)
└── shared/       # 재사용 가능한 코드 (types, websocket, styles)
```

<br>


### 🎨 BEM 방법론
SCSS Modules에 BEM(Block Element Modifier) 네이밍 적용
```scss
.game-board {        /* Block */
  &__cell {          /* Element */
    &--black { }     /* Modifier */
    &--white { }     /* Modifier */
  }
}
```

<br>

### 🤖 100% AI 활용
Claude Code (Max Plan)를 활용하여 100% AI로 개발

<br><br>

## 🚀 실행 방법

### 1. 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:
```env
# Database
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=black_and_white

# Backend
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=user
DATABASE_PASSWORD=pass
DATABASE_NAME=black_and_white

# Frontend
VITE_BACKEND_URL=http://localhost:4000
```

### 2. Docker Compose 실행
```bash
# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 3. 접속
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:4000/api
- **데이터베이스**: localhost:5432

### 4. 중지
```bash
# 컨테이너 중지
docker-compose down

# 데이터까지 삭제
docker-compose down -v
```

<br><br>

## 📌 버전

### v0.0.2 (2025.10.24)
- React → Svelte 마이그레이션 완료
- Zustand → Svelte Stores로 상태관리 변경
- 성능 최적화 (번들 크기 감소, 더 빠른 렌더링)
- FSD 및 BEM 구조 유지

### v0.0.1 (2025.10.22)
- 첫 배포
- 흑과 백 기본 게임 기능
- 상대 패 메모 기능
- FSD 아키텍처 적용

### 기획 시작 (2025.10.20)
- 프로젝트 첫 커밋

<br><br>

## 🔮 추후 계획

### Database 분리
- 외부 PostgreSQL 서비스로 분리 (Neon, Supabase 등)
- 개발/프로덕션 환경 분리
- 데이터베이스 마이그레이션 시스템 구축

### CI/CD 구축
- GitHub Actions를 통한 자동 빌드 및 테스트
- Docker 이미지 자동 배포
- 프론트엔드 자동 배포 (Vercel/Netlify)
- 백엔드 자동 배포 (Fly.io/Railway)

<br><br>

## 📂 프로젝트 구조

```
hukbaek/
├── apps/
│   ├── frontend/          # Svelte 프론트엔드 (FSD 구조)
│   │   └── src/
│   │       ├── app/       # 앱 초기화 및 라우팅
│   │       ├── pages/     # 페이지 컴포넌트
│   │       ├── widgets/   # 복합 UI 블록
│   │       ├── features/  # 기능 단위
│   │       ├── entities/  # 비즈니스 엔티티
│   │       └── shared/    # 공용 코드
│   └── backend/           # NestJS 백엔드
├── packages/
│   └── shared/            # 공용 타입 및 상수
├── docker-compose.yml     # Docker Compose 설정
└── .env                   # 환경 변수
```

<br><br>

## 📝 라이선스

MIT
