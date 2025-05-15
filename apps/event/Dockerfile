# 1. Build Stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# 모노레포 전체 package.json 및 lock 파일 복사
COPY package.json yarn.lock ./

# 의존성 설치 (Yarn Workspaces 고려)
# 전체 의존성 설치 후 필요한 것만 추릴 수도 있고,
# yarn workspaces focus --production @app/gateway 처럼 특정 워크스페이스만 설치도 가능 (복잡도 증가)
# 여기서는 전체 설치 후 빌드
RUN yarn install --frozen-lockfile

# 전체 소스 코드 복사
COPY . .

RUN yarn build event

# 2. Production Stage
FROM node:18-alpine

WORKDIR /usr/src/app

# 환경변수 설정
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# 빌드 스테이지에서 빌드된 애플리케이션과 node_modules 복사
# package.json은 프로덕션 의존성만 설치하기 위해 필요할 수 있음
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist/apps/event ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

# (선택적) 프로덕션 의존성만 다시 설치 (이미지 크기 최적화)
# RUN yarn install --production --frozen-lockfile

EXPOSE 3002

CMD ["node", "dist/main.js"]