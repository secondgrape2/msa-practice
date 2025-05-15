# 1. Build Stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# 전체 소스 코드 복사
COPY . .

RUN yarn build gateway

# 2. Production Stage
FROM node:18-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist/apps/gateway ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

# (선택적) 프로덕션 의존성만 다시 설치 (이미지 크기 최적화)
# RUN yarn install --production --frozen-lockfile

EXPOSE 3000

CMD ["node", "dist/main.js"]