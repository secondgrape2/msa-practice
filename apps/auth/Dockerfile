FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build auth

FROM node:18-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist/apps/auth ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

# bcrypt 재빌드
RUN apk add --no-cache make gcc g++ python3 && \
    npm rebuild bcrypt --build-from-source && \
    apk del make gcc g++ python3


EXPOSE 3001

CMD ["node", "dist/main.js"]