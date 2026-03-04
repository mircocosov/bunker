# Admin Guide (MVP plan)

## Roles
- Moderator: moderation queues/read-only game configs.
- Admin: game content, rulesets, feature flags.
- SuperAdmin: ops, rollback, runtime overrides.

## Publish flow
`draft -> review -> published -> archived`

## Rollback
- rollback target is previous published version
- all rollback actions must create `AuditLog` entries with before/after payloads
