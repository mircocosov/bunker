# 1) TL;DR

1. **Продукт:** `Bunker Open` — некоммерческая онлайн/гибрид платформа для party/social deduction игры «Бункер» с real-time партиями, публичными и приватными комнатами.
2. **Платформы (выбрано):** Web + Mobile Web (PWA) как дефолт; desktop через браузер. Это даёт минимальную стоимость разработки и self-hosting совместимость.
3. **Каноническая игра:** сервер-авторитетная пошаговая партия с фазами раскрытия атрибутов, обсуждения, голосования и исключения, пока не достигнута вместимость бункера.
4. **Non-profit модель:** open-source ядро + донаты + гранты + волонтёры + партнёрства с сообществами/антикафе/клубами настолок; без paywall в core-механиках.
5. **Ключевая ставка:** всё критичное настраивается через админку без кода: правила, state machine, таймеры, карточки, веса/вероятности, наборы, локализация, UI-подсказки, feature flags.
6. **Техоснова:** Next.js (PWA) + NestJS + PostgreSQL + Redis + WebSocket Gateway + job workers; наблюдаемость через OpenTelemetry + Prometheus/Grafana + Sentry.
7. **Устойчивость real-time:** идемпотентность событий, reconnect/resync, server authoritative state, anti-cheat валидации, rate limits и anti-spam.
8. **MVP цель:** стабильные комнаты 6–12 игроков, 3 режима, базовая модерация, полная админка контента/правил, логирование и аудит.
9. **Нефинансовые KPI:** D1/D7 retention, % завершённых партий, TTFG (time-to-first-game), активные комнаты, NPS после 3-й партии.
10. **Долгосрок:** расширение контента, турниры/сезоны, продвинутая модерация, конфигурируемые сценарии и публичный governance.

---

# 2) Non-profit модель

## 2.1 Миссия
Сделать «Бункер» доступным, честным и устойчивым цифровым пространством для совместной игры, общения и обучения аргументации — без коммерческого давления и pay-to-win.

## 2.2 Почему именно non-profit
- Игра социальная и community-driven: ценность в участии, а не монетизации.
- Открытый код и открытые правила повышают доверие и снижают риск «скрытого баланса».
- Self-hosting позволяет клубам/школам/сообществам запускать собственные инстансы.

## 2.3 Модель поддержки проекта (выбрано)
**Выбранный вариант:**
1) Open-source лицензия (AGPL для сервера, MIT для SDK/клиентских библиотек по необходимости);
2) донаты (OpenCollective/Boosty/Patreon);
3) гранты digital commons / edtech / youth initiatives;
4) волонтёрский вклад (контент, локализация, модерация, QA);
5) партнёрства с сообществами и мероприятиями.

**ASSUMPTION:** у проекта нет штатной команды >10 человек, поэтому ставка на low-cost инфраструктуру и вклад сообщества.

## 2.4 Политика прозрачности
- Публичный roadmap (MVP/V1/V2) и changelog.
- Ежемесячный отчёт: uptime, инциденты, контент-изменения, модерация (агрегировано), расходы/донаты.
- Публичный реестр RuleSet-версий и важных баланс-изменений.

## 2.5 KPI успеха (не финансовые)
- **D1 retention:** >35%.
- **D7 retention:** >18%.
- **Active rooms/day:** рост WoW >10% первые 8 недель после релиза.
- **Completed matches rate:** >75% стартовавших партий.
- **Time to First Game (TTFG):** <120 секунд от захода до начала первой партии.
- **NPS (после 3 игр):** >40.

---

# 3) Правила и state machine

## 3.1 Канонические правила онлайн-версии (выбрано)

### Игроки и лобби
- **Мин/макс игроков:** 6–12 (дефолт 8).
- Типы комнат: `public`, `private(invite code)`, `hybrid(экран+мобилки)`.
- Host создаёт комнату, выбирает режим/RuleSet/язык/таймеры (если разрешено политикой).

### Карточки персонажа
Каждый игрок получает набор атрибутов:
- Профессия
- Возраст
- Здоровье
- Хобби
- Фобия
- Багаж/предмет
- Биография/особенность
- Спецусловие (редко)

**Механика раскрытия:**
- На старте открыто 1 поле (например возраст).
- В каждом раунде игрок обязан раскрыть `N` атрибутов (дефолт N=1).
- Порядок доступных к раскрытию полей контролируется RuleSet.

### Катастрофа и бункер
- Катастрофа задаёт требования к выживанию (медицина/инженерия/еда/психустойчивость).
- Бункер: вместимость `capacity = players - 2` (дефолт), ресурсы, модули, дефекты.
- Решение игроков: кого исключить, чтобы финальный состав лучше соответствовал условиям сценария.

### Голосование и исключение
- Каждый раунд после обсуждения: тайное голосование против кандидата.
- Если >50% голосов против — игрок исключается.
- При ничьей: revote между top-2; если повторная ничья — случайный выбор из tie-set (если включено), иначе раунд без исключения (настройка).
- Иммунитеты: опционально, ограниченное число на матч, выдаётся событиями/правилами.

### Победа / завершение
**Выбранный вариант по умолчанию:** коллективно-симуляционная победа.
- Партия завершается, когда число активных игроков == вместимость бункера.
- Система считает survival score (насколько состав подходит сценарию).
- Все оставшиеся получают «выжили», исключённые — «не выжили».
- Доп.оценка: personal contribution score (аргументация/участие/AFK штрафы).

**ASSUMPTION:** классический «соревновательный winner-takes-all» заменён на semi-coop, чтобы снизить токсичность и улучшить replayability.

## 3.2 Фазы матча
1. `setup` — раздача ролей/атрибутов, публикация катастрофы и параметров бункера.
2. `round_reveal` — игроки раскрывают обязательные атрибуты.
3. `round_discussion` — общее обсуждение.
4. `round_vote` — тайное голосование.
5. `round_resolution` — исключение/ничья/событие.
6. Проверка end condition; если нет — следующий раунд.
7. `match_result` — итог, score, экспорт summary.

## 3.3 Режимы игры (выбрано 3)
1. **Classic** (дефолт): 8–12 игроков, стандартные таймеры, 1 раскрытие/раунд.
2. **Quick**: 6–8 игроков, короткие таймеры, ускоренные раунды.
3. **Custom**: host/admin выбирает RuleSet из разрешённых пресетов.

## 3.4 State machine (точная)

### Состояния
- `ROOM_DRAFT`
- `ROOM_WAITING`
- `ROOM_READY_CHECK`
- `MATCH_SETUP`
- `ROUND_REVEAL`
- `ROUND_DISCUSSION`
- `ROUND_VOTING`
- `ROUND_TIEBREAK`
- `ROUND_RESOLUTION`
- `MATCH_END_CHECK`
- `MATCH_FINISHED`
- `MATCH_ABORTED`

### Переходы
- `ROOM_DRAFT -> ROOM_WAITING` (host published room)
- `ROOM_WAITING -> ROOM_READY_CHECK` (min players reached + start pressed)
- `ROOM_READY_CHECK -> MATCH_SETUP` (all ready or ready timeout policy)
- `MATCH_SETUP -> ROUND_REVEAL` (cards dealt + scenario assigned)
- `ROUND_REVEAL -> ROUND_DISCUSSION` (all reveals done OR reveal timer expired)
- `ROUND_DISCUSSION -> ROUND_VOTING` (discussion timer expired OR host skip if allowed)
- `ROUND_VOTING -> ROUND_TIEBREAK` (tie detected and tiebreak enabled)
- `ROUND_VOTING -> ROUND_RESOLUTION` (winner candidate exists)
- `ROUND_TIEBREAK -> ROUND_RESOLUTION` (resolved by revote/random/no-elimination rule)
- `ROUND_RESOLUTION -> MATCH_END_CHECK` (elimination/event applied)
- `MATCH_END_CHECK -> MATCH_FINISHED` (active_players <= bunker_capacity)
- `MATCH_END_CHECK -> ROUND_REVEAL` (else next round++)
- `* -> MATCH_ABORTED` (critical timeout, host terminate, moderation force stop)

## 3.5 Критичные правила в псевдокоде

```text
IF player.connection_lost DURING active_match
THEN mark player_state = DISCONNECTED
AND start reconnect_grace_timer (default 90s)
IF player reconnects before timeout
  THEN resync full authoritative snapshot
ELSE
  apply AFK policy (auto-vote abstain + penalty OR bot-substitute if enabled)
```

```text
IF round == REVEAL
AND player did not reveal required_attributes_count
THEN auto-reveal random hidden attribute from allowed_pool
AND apply minor trust penalty
```

```text
IF voting_result.top_count is tie
THEN
  IF rules.tiebreak_mode == REVOTE
    start ROUND_TIEBREAK among tie_set
  ELSE IF rules.tiebreak_mode == RANDOM
    eliminate random(tie_set)
  ELSE
    eliminate none
```

```text
IF active_players <= bunker.capacity
THEN state = MATCH_FINISHED
AND compute survival_score(team_comp, scenario_requirements, bunker_modifiers)
```

## 3.6 Баланс и рандом (anti-broken combos)
- Карточки имеют `weight` + `rarity_tier` + `power_score`.
- Генератор раскладов учитывает ограничения:
  - `incompatible_with`
  - `required_with`
  - лимит суммарного power_score на игрока
- Серверная preflight-валидация перед стартом матча.
- Регулярный telemetry-анализ win/survival skew по карточкам.
- Возможность «горячего» отключения проблемных карт через feature flags.

---

# 4) UX и экраны

## 4.1 Core loop игрока
1. Зайти гостем или авторизоваться.
2. Войти в публичную комнату или создать приватную.
3. Подготовиться в лобби (ready check).
4. Играть по фазам: раскрытие → обсуждение → голосование.
5. Получить итог и краткую аналитику партии.
6. Сразу перейти в реванш/новую комнату.

## 4.2 Экраны
1. **Главный экран**
   - CTA: `Быстрая игра`, `Создать комнату`, `Ввести код`.
   - Виджеты: онлайн-комнаты, последние обновления правил.
2. **Создание комнаты**
   - Выбор режима, лимита игроков, приватности, языка, пресета правил.
3. **Лобби**
   - Список игроков, ready статусы, чат, таймер автостарта.
4. **Игровой экран (по фазам)**
   - Панель фазы, таймер, карточка игрока, раскрытия, чат/голос.
5. **Экран голосования**
   - Список кандидатов, индикатор отправки голоса, confirmation.
6. **Итог партии**
   - Кто «в бункере», survival score, timeline ключевых решений.

## 4.3 Антифрустрация
- Контекстные подсказки «что делать сейчас» в каждой фазе.
- Автодействия на таймаутах (auto-reveal, auto-abstain).
- Tutorial overlay для 1–3 игр.
- Простые сигналы состояния: «Ваш ход», «Ожидание других», «Голос принят».
- Reconnections без потери контекста.

## 4.4 Accessibility и локализация
- Базовый язык: RU; подготовка EN/DE через i18n ключи.
- Контрастные темы и масштаб шрифта.
- Без цветозависимых сигналов (иконки+текст).
- Поддержка screen-reader labels для основных действий.

**ASSUMPTION:** голосовой чат не обязателен в MVP, текстовый чат обязателен.

---

# 5) Сущности и данные

## 5.1 `User`
- Назначение: учетная запись.
- Поля: `id`, `email`, `password_hash?`, `oauth_provider?`, `status`, `created_at`, `last_login_at`.
- Индексы: unique(`email` nullable for guest upgrades), idx(`status`, `created_at`).
- ЖЦ: `guest_pending -> active -> suspended -> banned -> deleted`.

## 5.2 `Profile`
- Назначение: публичный игровой профиль.
- Поля: `user_id`, `nickname`, `avatar_url`, `locale`, `pronouns?`, `stats_json`.
- Индексы: unique(`nickname_normalized`).
- ЖЦ: `draft -> active -> hidden`.

## 5.3 `Room` / `Lobby`
- Назначение: предматчевое пространство.
- Поля: `id`, `code`, `host_user_id`, `visibility`, `mode`, `ruleset_id`, `max_players`, `status`, `created_at`.
- Индексы: unique(`code`), idx(`visibility`, `status`).
- ЖЦ: `draft -> waiting -> ready_check -> in_match -> closed`.

## 5.4 `Match` / `GameSession`
- Назначение: конкретная партия.
- Поля: `id`, `room_id`, `state`, `round`, `seed`, `scenario_id`, `bunker_config_id`, `started_at`, `ended_at`, `result_json`.
- Индексы: idx(`room_id`), idx(`state`), idx(`started_at`).
- ЖЦ: по state machine.

## 5.5 `PlayerState`
- Назначение: состояние игрока в матче.
- Поля: `match_id`, `user_id`, `seat_no`, `is_alive`, `is_connected`, `revealed_fields[]`, `penalties_json`, `vote_weight`.
- Индексы: unique(`match_id`,`user_id`), idx(`match_id`,`is_alive`).
- ЖЦ: `joined -> active -> eliminated|left -> finalized`.

## 5.6 `CardDefinition`
- Назначение: шаблон карточки.
- Поля: `id`, `category`, `title`, `description`, `weight`, `rarity`, `power_score`, `incompatible_with[]`, `required_with[]`, `is_active`, `version`.
- Индексы: idx(`category`,`is_active`), idx(`rarity`,`weight`).
- ЖЦ: `draft -> active -> deprecated -> archived`.

## 5.7 `CardInstance`
- Назначение: конкретно выданная карточка в матче.
- Поля: `id`, `match_id`, `player_id`, `card_definition_id`, `is_revealed`, `revealed_at`.
- Индексы: unique(`match_id`,`player_id`,`card_definition_id`).
- ЖЦ: `dealt -> hidden -> revealed -> locked`.

## 5.8 `Deck` / `Pack`
- Назначение: набор карт/сценариев для режима.
- Поля: `id`, `name`, `mode`, `version`, `is_default`, `status`.
- Связь: M:N с `CardDefinition` через `DeckCard`.
- Индексы: unique(`name`,`version`).
- ЖЦ: `draft -> published -> frozen -> deprecated`.

## 5.9 `DisasterScenario`
- Назначение: условия внешнего мира.
- Поля: `id`, `title`, `description`, `requirements_json`, `difficulty`, `weight`, `status`.
- Индексы: idx(`difficulty`,`status`).
- ЖЦ: `draft -> active -> archived`.

## 5.10 `BunkerConfig`
- Назначение: параметры бункера.
- Поля: `id`, `capacity_formula`, `resources_json`, `modules_json`, `defects_json`, `version`, `status`.
- Индексы: idx(`status`, `version`).
- ЖЦ: `draft -> active -> archived`.

## 5.11 `Vote`
- Назначение: голос игрока в раунде.
- Поля: `id`, `match_id`, `round`, `voter_user_id`, `target_user_id`, `type`, `created_at`.
- Индексы: unique(`match_id`,`round`,`voter_user_id`), idx(`target_user_id`).
- ЖЦ: `cast -> counted -> archived`.

## 5.12 `ChatMessage`
- Назначение: сообщения комнаты/матча.
- Поля: `id`, `room_id`, `match_id?`, `author_user_id`, `text`, `moderation_status`, `created_at`.
- Индексы: idx(`room_id`,`created_at`), idx(`moderation_status`).
- ЖЦ: `posted -> flagged -> hidden|approved`.

## 5.13 `Report` / `ModerationCase`
- Назначение: жалобы и кейсы.
- Поля: `id`, `reporter_user_id`, `target_user_id?`, `target_message_id?`, `reason`, `evidence_json`, `status`, `resolution`.
- Индексы: idx(`status`,`created_at`), idx(`target_user_id`).
- ЖЦ: `new -> in_review -> actioned -> closed -> appealed`.

## 5.14 `AuditLog`
- Назначение: неизменяемый аудит изменений.
- Поля: `id`, `actor_id`, `entity_type`, `entity_id`, `action`, `before_json`, `after_json`, `ip`, `request_id`, `created_at`.
- Индексы: idx(`entity_type`,`entity_id`,`created_at`), idx(`actor_id`).
- ЖЦ: append-only.

## 5.15 `FeatureFlag`
- Назначение: поэтапное включение фич.
- Поля: `key`, `enabled`, `rollout_percent`, `roles[]`, `env`, `conditions_json`.
- Индексы: unique(`key`,`env`).
- ЖЦ: `draft -> active -> disabled -> removed`.

## 5.16 `GameRuleSet`
- Назначение: версионируемые правила партии.
- Поля: `id`, `name`, `version`, `mode`, `room_type`, `locale_scope`, `rules_json`, `state_machine_json`, `status`.
- Индексы: unique(`name`,`version`), idx(`mode`,`status`).
- ЖЦ: `draft -> validated -> published -> superseded -> archived`.

## 5.17 `LocalizationKey`
- Назначение: переводы UI/контента.
- Поля: `key`, `locale`, `value`, `namespace`, `status`.
- Индексы: unique(`key`,`locale`).
- ЖЦ: `new -> translated -> reviewed -> obsolete`.

---

# 6) Архитектура + API/WS события

## 6.1 Стек (выбран)
- **Frontend:** Next.js + TypeScript + Zustand/Redux Toolkit + PWA.
- **Backend:** NestJS (modular monolith) + TypeScript.
- **Realtime:** WebSockets (Socket.IO or ws) — проще self-host и authoritative flow для партий.
- **DB:** PostgreSQL (ACID, удобные JSONB для конфигов).
- **Cache/Queue:** Redis + BullMQ.
- **Observability:** OpenTelemetry, Prometheus, Grafana, Loki, Sentry.
- **Deployment:** Docker Compose (single-node self-host), далее Kubernetes (Helm).

## 6.2 Почему WS, а не WebRTC data channel
- Сервер-авторитетная игра и модерация проще через централизованный WS хаб.
- WebRTC сложнее в эксплуатации (NAT/STUN/TURN) и не нужен для turn-based party gameplay.

## 6.3 Ключевые технические принципы
1. **Authoritative server:** клиент отправляет intents, сервер применяет правила и рассылает state.
2. **Idempotency:** каждое клиентское действие содержит `action_id` (UUID), сервер хранит dedupe window.
3. **Reconnect/resync:** при reconnect клиент запрашивает `sync_snapshot` по `last_event_seq`.
4. **Anti-cheat:** сервер валидирует все переходы state machine и права на действие.
5. **Rate limits:** per-IP/per-user на REST и WS событийный поток.

## 6.4 REST API (основное)
- `POST /api/v1/auth/guest`
- `POST /api/v1/auth/login`
- `GET /api/v1/profile/me`
- `PATCH /api/v1/profile/me`
- `POST /api/v1/rooms`
- `POST /api/v1/rooms/{code}/join`
- `POST /api/v1/rooms/{id}/start`
- `GET /api/v1/matches/{id}`
- `GET /api/v1/matches/{id}/timeline`
- `POST /api/v1/reports`
- `GET /api/v1/admin/rulesets`
- `POST /api/v1/admin/rulesets`
- `POST /api/v1/admin/cards/import`

## 6.5 WS события (event types)

### Клиент -> сервер
- `room.join`
- `room.ready`
- `match.reveal_attribute`
- `match.chat_send`
- `match.vote_cast`
- `match.request_sync`

### Сервер -> клиент
- `room.state_updated`
- `match.state_changed`
- `match.timer_tick`
- `match.player_updated`
- `match.vote_result`
- `match.finished`
- `system.warning`

### Примеры payload JSON
```json
{
  "event": "match.reveal_attribute",
  "action_id": "7f133b34-8aa2-4b3a-8c31-2b3ac4d7c7ce",
  "match_id": "m_123",
  "player_id": "u_10",
  "attribute": "profession"
}
```

```json
{
  "event": "match.state_changed",
  "match_id": "m_123",
  "state": "ROUND_VOTING",
  "round": 3,
  "event_seq": 884,
  "deadline_ts": "2026-03-05T11:15:00Z"
}
```

```json
{
  "event": "match.vote_result",
  "match_id": "m_123",
  "round": 3,
  "eliminated_player_id": "u_22",
  "tie": false,
  "summary": {"u_22": 5, "u_11": 2, "abstain": 1}
}
```

## 6.6 Безопасность/антиабьюз
- JWT + refresh tokens + device fingerprint (мягкий).
- WAF + rate limit + captcha на аномалиях.
- Словарь токсичности + эвристики флуд-детекта в чате.
- Мьют/бан на уровне комнаты и глобально.
- Модераторские действия только через audited endpoints.

---

# 7) Роли и модерация

## 7.1 Роли
- `Guest`: может играть в гостевом режиме (ограниченно), без прав модерации.
- `Player`: полноценное участие в комнатах/матчах.
- `Host`: управление своей комнатой и стартом матча.
- `Moderator`: репорты, чаты, временные санкции.
- `Admin`: глобальные настройки контента/правил/флагов.
- `SuperAdmin`: системный доступ, ops, миграции, аварийные действия.

## 7.2 Матрица доступов (сжатая)

| Действие | Guest | Player | Host | Moderator | Admin | SuperAdmin |
|---|---:|---:|---:|---:|---:|---:|
| Join public room | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create room | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Start match (own room) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Configure RuleSet in room | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Handle reports | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit cards/rules | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage bans global | ❌ | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Runtime ops/queues/config | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ |

⚠️ — ограниченный scope.

## 7.3 Модерация
- Репорты на игрока/чат/поведение в матче.
- Санкции: warning, mute(10m/1d/7d), ban(temp/permanent).
- Фильтр слов: blacklist + context whitelist.
- Anti-spam: ограничение сообщений/мин, повторяющиеся фразы, ссылка-детект.
- Appeal (V1): подача апелляции и вторичная проверка другим модератором.
- Обязательный аудит: кто, когда, на каком основании применил санкцию.

---

# 8) Админка (максимально подробно)

> Цель: **100% управления геймдизайном и эксплуатацией без изменения кода**.

## 8.1 Архитектура админки
- Отдельный `/admin` SPA с RBAC + field-level permission.
- Конфигурационные сущности versioned: `GameRuleSet`, `Deck`, `CardDefinition`, `DisasterScenario`, `BunkerConfig`, `UIConfig`, `LocalizationKey`, `FeatureFlag`.
- Все изменения через workflow: `draft -> review -> publish` (для прод-инстанса).
- Rollback одной кнопкой на предыдущую версию (контент/правила).
- Live config cache invalidation через Redis pub/sub.

## 8.2 A) Dashboard

### Страницы/виджеты
- `Overview`: активные комнаты, матчи/мин, средняя длительность раунда.
- `Realtime health`: WS latency p50/p95, reconnect rate, error spikes.
- `Moderation queue`: новые жалобы, SLA обработки.
- `Config changes`: последние публикации правил/карт.

### Операции
- Drill-down до конкретной комнаты/матча.
- Acknowledge алертов.
- Быстрые переходы к проблемным RuleSet.

### Фильтры/массовые операции
- Фильтры: период, регион, режим игры, версия правил.
- Массово: mute all chat in incident room-set, freeze room creation (flag).

### Права
- Moderator: read мониторинг + moderation queue.
- Admin: read/write operational toggles.
- SuperAdmin: полный доступ + аварийные действия.

---

## 8.3 B) Game Content

### B1. Карточки
#### Таблицы/страницы
- `Cards List` (категории, статусы, веса, редкость, версия)
- `Card Editor`
- `Compatibility Matrix`

#### Ключевые операции
- CRUD карточек.
- bulk edit: category, weight, tags, active flag.
- импорт/экспорт CSV/JSON.
- проверка совместимости (lint) перед публикацией.

#### Фильтры
- category, rarity, active, pack, incompatible, locale coverage.

#### Field-level права
- Moderator: read only.
- Admin: edit content/weights.
- SuperAdmin: override locked cards.

### B2. Наборы/паки
- Создание паков: `classic_ru_v1`, `quick_global_v1`.
- Включение/исключение карточек, лимиты по категориям.
- Версионирование и diff между версиями.
- Publish with validation: min card pool, no hard conflicts.

### B3. Сценарии катастроф
- CRUD сценариев и требований выживания.
- Вес выпадения и сложность.
- Превью симуляции «какие роли/карты становятся критичными».

### B4. Параметры бункера
- Вместимость, ресурсные слоты, модули, дефекты.
- Формулы: `capacity = players - 2` или фикс.
- Presets: `default`, `hardcore_low_resource`.

---

## 8.4 C) Game Rules

### Страницы
- `RuleSets`
- `RuleSet Editor`
- `State Machine Table Editor`
- `RuleSet Validation`

### Ключевые операции
- Версионируемый CRUD RuleSet.
- Настройка по mode / room_type / locale / region.
- Табличный редактор state machine:
  - `state`
  - `allowed_actions`
  - `timeout`
  - `next_state`
- Политики голосования (ничьи, revote, иммунитеты).
- AFK штрафы и reconnect grace.

### Фильтры/массовые
- По статусу (draft/published/superseded), режиму, региону.
- Массовое назначение RuleSet на комнаты/режим.

### Права
- Admin: full rule editing.
- Moderator: read + simulation only.
- SuperAdmin: emergency publish/rollback.

---

## 8.5 D) Customization / No-code

### Конструктор форм
- Профиль игрока: nickname, pronouns, preferred mode, accessibility prefs.
- Комната: max players, privacy, language, timer preset.
- Типы полей: text/select/multi-select/toggle/number.
- Валидации: regex/min-max/required/conditional visibility.

### UI Config
- Тексты интерфейса и подсказки по фазам.
- Порядок блоков в матч-экране.
- Включение/скрытие секций (например, показать survival score).

### Локализация
- Ключи переводов, процент заполненности, fallback locale.
- Проверка недостающих ключей перед релизом.

### Feature Flags
- Включение фич по ролям/проценту/среде.
- Time-window rollout и auto-disable on errors (kill switch).

---

## 8.6 E) Rooms & Matches

### Страницы
- `Active Rooms`
- `Match Inspector`
- `Timeline Viewer`

### Ключевые операции
- Принудительное завершение матча.
- Kick/ban игрока из комнаты.
- Pause/unpause таймера матча (инциденты).
- Экспорт матча в JSON для арбитража.

### Фильтры
- status, mode, created_at, report_flagged, ruleset_version.

### Права
- Moderator: inspect + kick + temporary mute.
- Admin: force terminate + export.
- SuperAdmin: global interventions.

---

## 8.7 F) Users & Moderation

### Страницы
- `Users`
- `Ban List`
- `Reports Queue`
- `Moderation Actions`
- `Word Filter`

### Ключевые операции
- Поиск пользователя, просмотр матч-истории и санкций.
- Warning/mute/ban, массовый разбан по expiry.
- triage репортов, назначение кейса модератору.
- Настройка лимитов и anti-bot правил.

### Фильтры/массовые
- По региону, языку, trust score, count reports, active sanction.
- Массово: продление mute, закрытие duplicate reports.

### Права
- Moderator: санкции в рамках policy.
- Admin: policy editing.
- SuperAdmin: override + legal export.

---

## 8.8 G) Observability & Ops

### Страницы
- `System Health`
- `Logs Explorer`
- `Errors`
- `Queues`
- `Runtime Config`
- `Backups`

### Ключевые операции
- Health checks (db, redis, ws gateway, workers).
- Поиск логов по request_id/match_id/user_id.
- Retry/dead-letter jobs.
- Очистка кэша по namespace.
- Запуск backup/restore drill.

### Права
- Admin: read ops + limited queue actions.
- SuperAdmin: full ops, restore, runtime overrides.

---

## 8.9 H) Audit

### Страницы
- `Audit Log`
- `Config Diff Viewer`
- `Rollback Center`

### Ключевые операции
- Кто/что/когда изменил.
- Просмотр before/after diff.
- Rollback контента и RuleSet.
- Экспорт audit trail (CSV/JSON).

### Права
- Moderator: read limited (без чувствительных полей).
- Admin: read full + rollback non-system configs.
- SuperAdmin: full including security-sensitive.

---

## 8.10 JSON-конфиги (минимум 3)

### Пример 1: RuleSet
```json
{
  "name": "classic_ru",
  "version": 3,
  "mode": "classic",
  "players": {"min": 8, "max": 12},
  "timers": {"reveal_sec": 45, "discussion_sec": 180, "vote_sec": 40},
  "reveal": {"attributes_per_round": 1},
  "voting": {"tie_mode": "revote_then_random", "immunity_enabled": false},
  "afk": {"grace_sec": 90, "penalty": "auto_abstain"},
  "win": {"end_when_active_leq_capacity": true}
}
```

### Пример 2: CardDefinition
```json
{
  "id": "card_prof_doctor_v2",
  "category": "profession",
  "title": {"ru": "Врач", "en": "Doctor"},
  "weight": 18,
  "rarity": "common",
  "power_score": 8,
  "incompatible_with": ["card_health_terminal_v1"],
  "required_with": [],
  "tags": ["medical", "survival"]
}
```

### Пример 3: UI/Localization Block
```json
{
  "screen": "match_phase",
  "locale": "ru",
  "blocks": [
    {"id": "phase_hint", "visible": true, "order": 1, "text_key": "match.hint.reveal"},
    {"id": "chat_panel", "visible": true, "order": 2},
    {"id": "survival_meter", "visible": false, "order": 3}
  ],
  "tutorial": {"enabled": true, "steps": ["intro", "reveal", "vote"]}
}
```

### Пример 4: FeatureFlag
```json
{
  "key": "new_tiebreak_logic",
  "env": "prod",
  "enabled": true,
  "rollout_percent": 20,
  "roles": ["player", "host"],
  "conditions": {"mode": ["quick", "classic"], "region": ["ru"]}
}
```

---

# 9) Roadmap

## MVP (обязательно, 8–12 недель)
- Гостевой/обычный вход, профиль.
- Комнаты (public/private), лобби, ready-check.
- Каноническая партия (state machine, reveal/discuss/vote/end).
- 3 режима: classic/quick/custom(ограниченный).
- Базовый чат + репорты.
- Админка: Cards/Decks/RuleSets/Rooms/Users/Audit.
- Наблюдаемость, бэкапы, базовая модерация.

## V1
- Расширенный no-code: form builder, state-machine editor UI.
- Appeal workflow, word filter advanced.
- Импорт/экспорт контента, rollback center.
- Больше сценариев катастроф и паков.

## V2
- Рейтинги/сезоны (без pay-to-win).
- Турниры сообщества.
- Публичные лобби с умным матчмейкингом.
- Advanced anti-abuse (ML-assisted heuristics).

## Ключевые риски и закрытие
1. **Читы/подмена клиента** → authoritative server + event validation + tamper detection.
2. **Токсичность** → модерация в реальном времени, mute/ban, appeal, антиспам.
3. **WS масштабирование** → sticky sessions + Redis adapter + sharded gateways.
4. **Конфиг-хаос в админке** → versioning, validation, staged rollout, rollback.
5. **Регрессии баланса** → telemetry + A/B RuleSet + canary флаги.

---

# 10) Production checklist

## Тесты
- Unit: game rules engine, state transitions, vote resolver.
- Integration: REST auth/rooms/admin configs.
- Contract: OpenAPI + WS schema tests.
- E2E: полный матч 6/8/12 игроков, reconnect, AFK, tiebreak.

## Нагрузка и real-time
- WS load test: 10k concurrent sockets (поэтапно).
- Soak test 6–12 часов.
- Chaos test: redis restart, gateway restart, packet loss.

## Мониторинг/алерты
- SLI: match start latency, round transition latency, WS reconnect success, error rate.
- Алерты: p95 latency, queue lag, DB connections, moderation backlog.
- Sentry: FE/BE crash tracking, release health.

## Бэкапы/DR
- PostgreSQL PITR + daily snapshots.
- Redis snapshot policy для non-critical state.
- Ежемесячный restore drill.

## Обновления и миграции
- Zero-downtime DB migrations (expand/contract).
- Feature flag rollout.
- Config schema migrations с auto-validation.

## Документация
- Runbooks (incident, reconnect storm, moderation spike).
- Admin handbook (разделы, права, workflows).
- Public changelog и rule-change log.

---

# 11) Открытые вопросы (если остались)

1. Нужен ли встроенный voice chat в V1, или остаёмся на текстовом чате + внешние voice-сервисы?
2. Нужна ли в MVP обязательная регистрация, или guest-first должен покрывать 100% core flow?
3. Какой уровень публичности модерационных отчётов приемлем для сообщества (privacy vs transparency)?
4. Нужен ли «режим ведущего» для офлайн-ивентов (один экран + QR-join) уже в MVP?
5. Какая целевая юрисдикция для хранения логов/персональных данных (для окончательной legal policy)?
