# MSA Practice

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Yarn package manager

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Set up environment variables

Create `.env` files in each service directory:

- `apps/auth/.env`
- `apps/gateway/.env`
- `apps/event/.env`

Each service requires its own environment variables.

### 3. Run the application

Development mode:

```bash
yarn start:dev:auth
yarn start:dev:gateway
yarn start:dev:event
```

### 4. Run tests

```bash
# Unit tests
yarn test

# Integration tests
yarn test:integration:auth
yarn test:integration:gateway
yarn test:integration:event
```

## Docker Compose

```bash
docker compose -f docker-compose.yaml up -d
```

## Docker Compose auth service

```bash
docker compose -f docker-compose.yaml up -d auth_service mongo_db
```

## Docker Compose gateway service

```bash
docker compose -f docker-compose.yaml up -d gateway_service mongo_db
```

## Docker Compose event service

```bash
docker compose -f docker-compose.yaml up -d event_service mongo_db
```
