import { Injectable, NotFoundException } from '@nestjs/common';

export type ActionCardType = 'replace' | 'upgrade' | 'downgrade' | 'add';
export type ActionCardScope = 'self' | 'all' | 'all_with_opened' | 'bunker_upgrade';

export interface ActionCardRecord {
  id: number;
  type: ActionCardType;
  target: string;
  scope: ActionCardScope;
  description: string;
}

interface CreateActionCardInput {
  type: ActionCardType;
  target: string;
  scope: ActionCardScope;
  description: string;
}

interface UpdateActionCardInput {
  type?: ActionCardType;
  target?: string;
  scope?: ActionCardScope;
  description?: string;
}

@Injectable()
export class AdminActionCardsService {
  private readonly cards = new Map<number, ActionCardRecord>();
  private nextId = 1;

  list(): ActionCardRecord[] {
    return Array.from(this.cards.values());
  }

  create(input: CreateActionCardInput): ActionCardRecord {
    const record: ActionCardRecord = {
      id: this.nextId++,
      type: input.type,
      target: input.target,
      scope: input.scope,
      description: input.description,
    };

    this.cards.set(record.id, record);
    return record;
  }

  update(id: number, input: UpdateActionCardInput): ActionCardRecord {
    const current = this.cards.get(id);
    if (!current) {
      throw new NotFoundException('Action card not found');
    }

    const updated: ActionCardRecord = {
      ...current,
      type: input.type ?? current.type,
      target: input.target ?? current.target,
      scope: input.scope ?? current.scope,
      description: input.description ?? current.description,
    };

    this.cards.set(id, updated);
    return updated;
  }

  remove(id: number): void {
    if (!this.cards.has(id)) {
      throw new NotFoundException('Action card not found');
    }

    this.cards.delete(id);
  }
}
