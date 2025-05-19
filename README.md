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

## Docker Compose

```bash
docker compose -f docker-compose.yaml up -d --build
```

## Docker Compose auth 서비스

```bash
docker compose -f docker-compose.yaml up -d auth_service mongo_db
```

## Docker Compose gateway 서비스

```bash
docker compose -f docker-compose.yaml up -d gateway_service mongo_db
```

## Docker Compose event 서비스

```bash
docker compose -f docker-compose.yaml up -d event_service mongo_db
```

### AUTH

#### 인증 전략: 쿠키 기반 인증

인증 서비스는 다음과 같은 이유로 쿠키 기반 인증을 사용합니다:

1. **동일 출처 보안**

   - 대부분의 서비스(이벤트 등)가 동일한 도메인에서 제공될 예정
   - 쿠키는 동일 도메인에 대한 요청에 자동으로 포함됨

2. **향상된 보안**

   - `httpOnly` 플래그로 JavaScript에서 토큰 접근 방지
   - `secure` 플래그로 HTTPS 통신에서만 토큰 전송
   - `sameSite: strict`로 CSRF 공격 방지
   - 토큰이 응답 본문이나 localStorage에 노출되지 않음

3. **자동 토큰 관리**

   - 브라우저가 자동으로 쿠키 만료 처리
   - 클라이언트 측 토큰 저장 로직 불필요
   - XSS 공격을 통한 토큰 유출 위험 감소

4. **단순화된 클라이언트 구현**
   - 요청에 토큰을 수동으로 첨부할 필요 없음
   - 자동 토큰 갱신 처리
   - 원활한 인증으로 향상된 사용자 경험

서비스는 두 가지 유형의 쿠키를 사용합니다:

- 액세스 토큰 (15분 만료)
- 리프레시 토큰 (7일 만료)

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
