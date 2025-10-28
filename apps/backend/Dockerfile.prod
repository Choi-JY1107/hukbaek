# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 루트 설정 파일들 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# 패키지 파일들 복사
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/tsconfig.json ./apps/backend/tsconfig.json

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# shared 패키지 빌드
RUN cd packages/shared && pnpm build

# Backend 빌드
RUN cd apps/backend && pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 루트 설정 파일들 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 패키지 파일들 복사
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/backend/package.json ./apps/backend/package.json

# production 의존성만 설치
RUN pnpm install --frozen-lockfile --prod

# 빌드된 파일 복사
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# 환경 변수 설정
ENV NODE_ENV=production

EXPOSE 4000

# Production 모드로 실행
CMD ["node", "apps/backend/dist/main.js"]
