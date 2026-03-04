# Аудит источников данных (игра "Бункер")

## Найденный скрытый/жёстко-зашитый контент и правила

| Файл | Что хранит | Почему не в БД | Как мигрировано |
|---|---|---|---|
| `frontend/src/pages/LobbyPage.tsx` | Жёсткие `phase="VOTE"` и `timerSec={86}` | UI показывал фиктивную фазу/таймер, не из сервера | Переведено на данные `lobby.phase`, `voteTimerSec/revealTimerSec` из API. |
| `frontend/src/pages/LobbyPage.tsx` | Поле `environment` с локальными вариантами | Не влияло на серверную игру и не управлялось админкой | Оставлено как UI-черновик (deprecated), игровой старт теперь использует `gameRulesId` из БД. |
| `frontend/src/pages/AdminPage.tsx` (Game section) | Раздел «Игра» без CRUD | Админ не мог менять правила, игра не имела источника правды для ruleset | Добавлен CRUD для `GameRules` через `/admin/game-rules`. |
| `backend/src/lobby/lobby.service.ts` | Логика дефолтов фазы/таймеров только из env | Нет выделенной сущности правил (ruleset) | Добавлена модель `GameRules`, выбор ruleset при старте лобби. |
| `backend/.env.example` + `backend/src/auth/auth.service.ts` | `AUTH_CODE_TTL_MS` в миллисекундах | Нарушение требования «времена в секундах» | Заменено на `AUTH_CODE_TTL_SECONDS`, конвертация в ms только в месте вызова даты. |

## Итог
- Базовый ruleset вынесен в БД (`GameRules`) с записью `bunker_classic`.
- Лобби может стартовать с конкретным `gameRulesId`.
- Админка теперь управляет наборами правил.
- Фаза и таймеры в UI читаются из текущего лобби (не хардкод).
