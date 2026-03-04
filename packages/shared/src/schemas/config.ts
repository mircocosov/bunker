import { z } from 'zod';

export const localizedTextSchema = z.record(z.string().min(2), z.string().min(1));

export const stateTransitionSchema = z.object({
  from: z.string(),
  action: z.string(),
  to: z.string(),
  timeoutSec: z.number().int().positive().optional(),
});

export const stateMachineSchema = z.object({
  schema_version: z.literal(1),
  startState: z.string(),
  endStates: z.array(z.string()).min(1),
  states: z.array(z.string()).min(1),
  transitions: z.array(stateTransitionSchema).min(1),
});

export const ruleSetSchema = z.object({
  schema_version: z.literal(1),
  name: z.string(),
  version: z.number().int().positive(),
  mode: z.enum(['classic', 'quick', 'custom']),
  players: z.object({ min: z.number().int().min(6), max: z.number().int().max(12) }),
  timers: z.object({
    reveal_sec: z.number().int().min(5),
    discussion_sec: z.number().int().min(30),
    vote_sec: z.number().int().min(10),
  }),
  reveal: z.object({ attributes_per_round: z.number().int().min(1).max(3) }),
  voting: z.object({ tie_mode: z.enum(['revote', 'random', 'no_elimination']) }),
  afk: z.object({ grace_sec: z.number().int().min(10), penalty: z.enum(['auto_abstain']) }),
  win: z.object({ end_when_active_leq_capacity: z.boolean() }),
});

export const cardDefinitionSchema = z.object({
  schema_version: z.literal(1),
  id: z.string(),
  category: z.string(),
  title: localizedTextSchema,
  description: localizedTextSchema.optional(),
  weight: z.number().int().positive(),
  rarity: z.enum(['common', 'rare', 'epic']),
  power_score: z.number().int().min(0).max(10),
  incompatible_with: z.array(z.string()).default([]),
  required_with: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const uiConfigSchema = z.object({
  schema_version: z.literal(1),
  screen: z.string(),
  locale: z.string(),
  blocks: z.array(
    z.object({
      id: z.string(),
      visible: z.boolean(),
      order: z.number().int().nonnegative(),
      text_key: z.string().optional(),
    }),
  ),
});

export const featureFlagSchema = z.object({
  schema_version: z.literal(1),
  key: z.string(),
  env: z.enum(['dev', 'stage', 'prod']),
  enabled: z.boolean(),
  rollout_percent: z.number().int().min(0).max(100),
  roles: z.array(z.string()).default([]),
  conditions: z.record(z.string(), z.any()).default({}),
});

export type RuleSetConfig = z.infer<typeof ruleSetSchema>;
