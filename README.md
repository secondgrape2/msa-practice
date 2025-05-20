# MSA Practice

## 사전 요구사항

- Node.js (v18 이상)
- Docker와 Docker Compose
- Yarn 패키지 매니저

## 시작하기

### 1. 의존성 설치

```bash
yarn install
```

### 2. 환경 변수 설정

각 서비스 디렉토리에 `.env` 파일을 생성하세요:

- `apps/auth/.env`
- `apps/gateway/.env`
- `apps/event/.env`

각 서비스는 고유한 환경 변수가 필요합니다.

### 3. 애플리케이션 실행

개발 모드:

```bash
yarn start:dev:auth
yarn start:dev:gateway
yarn start:dev:event
```

### 4. 테스트 실행

```bash
# 단위 테스트
yarn test

# 통합 테스트
yarn test:integration
```

### 5. 접속 방법

```bash
# 게이트웨이
http://localhost:3000/api/docs
```

## Docker Compose

```bash
docker compose -f docker-compose.yaml up -d --build
```

### DB 접속

```bash
url=mongodb://mongo1:27017,mongo2:27018,mongo3:27019/?replicaSet=rs0
```

### 조건 테스트

시스템은 이벤트 조건 테스트를 위해 mock 사용자 상태를 사용합니다. 현재 모든 사용자는 다음과 같은 mock 상태를 가집니다:

```typescript
{
  level: 15,
  loginStreak: 10
}
```

이 mock 상태를 기반으로 다양한 조건 구성을 테스트할 수 있습니다. 다음은 테스트 케이스 예시입니다:

1. 레벨 기반 조건:

```typescript
// 통과 (사용자 레벨 15 >= 필요 레벨 10)
{
  operator: 'AND',
  rules: [{ type: 'level', params: { minLevel: 10 } }]
}

// 실패 (사용자 레벨 15 < 필요 레벨 20)
{
  operator: 'AND',
  rules: [{ type: 'level', params: { minLevel: 20 } }]
}
```

2. 로그인 스트릭 조건:

```typescript
// 통과 (사용자 스트릭 10 >= 필요 일수 7)
{
  operator: 'AND',
  rules: [{ type: 'login_streak', params: { days: 7 } }]
}

// 실패 (사용자 스트릭 10 < 필요 일수 15)
{
  operator: 'AND',
  rules: [{ type: 'login_streak', params: { days: 15 } }]
}
```

3. 복합 조건:

```typescript
// 통과 (모든 조건 충족)
{
  operator: 'AND',
  rules: [
    { type: 'level', params: { minLevel: 10 } },
    { type: 'login_streak', params: { days: 7 } }
  ]
}

// 통과 (하나 이상의 조건 충족)
{
  operator: 'OR',
  rules: [
    { type: 'level', params: { minLevel: 20 } },
    { type: 'login_streak', params: { days: 7 } }
  ]
}
```
