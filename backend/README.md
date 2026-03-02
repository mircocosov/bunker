# backend

NestJS приложение с Prisma и WS чатом.

## ENV

Используйте только:

- `DATABASE_URL`
- `JWT_SECRET`
- `TWITCH_CHANNEL`
- `ADMINS=nick1,nick2`
- `FRONTEND_URL=http://localhost:5173`

Пример `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bunker?schema=public"
JWT_SECRET="change-me"
TWITCH_CHANNEL="your_channel"
ADMINS="nick1,nick2"
FRONTEND_URL="http://localhost:5173"
```

## Запуск (порядок)

```bash
cp .env.example .env
# отредактировать .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

## Основные фичи

- Auth по 6-значному коду (TTL 15 сек) через Twitch чат.
- Роли USER/ADMIN по `ADMINS` (строгое сравнение ника).
- Singleton лобби.
- Site chat (WS) с антиспамом и фильтром слов.
- Swagger на `/bunker/swagger`.
