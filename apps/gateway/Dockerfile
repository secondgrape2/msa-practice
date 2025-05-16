# 1. Build Stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

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


EXPOSE 3000

CMD ["node", "dist/main.js"]