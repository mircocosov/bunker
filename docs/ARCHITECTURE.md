# Bunker Open Architecture (MVP baseline)

## Monorepo
- `apps/web`: Next.js PWA + `/admin` UI shell.
- `apps/api`: NestJS REST + WebSocket gateway (`/rooms` namespace).
- `packages/shared`: Zod contracts (config + WS payload validation).
- `infra`: local docker-compose for PostgreSQL + Redis.

## Iteration 1 fixes
- Root workspace scripts are valid and run `api + web` in parallel.
- Prisma has a real init migration SQL in `apps/api/prisma/migrations/0001_init/migration.sql`.
- DB schema aligns closer to spec: `User.status=guest_pending`, timestamps added to `FeatureFlag` and `LocalizationKey`, safe relations for room host and ruleset.

## Iteration 2 (minimal)
- Added `RoomsGateway` with handlers:
  - `room.join`
  - `room.ready`
- Payloads validated through `@bunker/shared` Zod schemas.
- Emits `room.state_updated` with `event_seq` placeholder.
- In-memory room registry (`Map`) with TODO for Redis/Postgres persistence.

## How to run
```bash
cp .env.example .env

docker compose -f infra/docker-compose.yml up -d

npm install

npm run -w @bunker/api prisma:generate
npm run -w @bunker/api prisma:migrate:dev
npm run -w @bunker/api prisma:seed

npm run dev
```

API: `http://localhost:3001/api/v1/health`
Web: `http://localhost:3000`
WS namespace: `ws://localhost:3001/rooms`
