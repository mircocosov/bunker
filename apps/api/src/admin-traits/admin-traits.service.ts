import { Injectable, NotFoundException } from '@nestjs/common';

export type TraitCategory = 'profession' | 'phobia' | 'hobby' | 'luggage' | 'fact' | 'health';

export interface TraitRecord {
  id: number;
  category: TraitCategory;
  value: string;
  severityEnabled?: boolean;
  severityLevel?: 30 | 50 | 70 | 90;
}

interface CreateTraitInput {
  value: string;
  severityEnabled?: boolean;
  severityLevel?: 30 | 50 | 70 | 90;
}

interface UpdateTraitInput {
  value?: string;
  severityEnabled?: boolean;
  severityLevel?: 30 | 50 | 70 | 90;
}

@Injectable()
export class AdminTraitsService {
  private readonly traits = new Map<number, TraitRecord>();
  private nextId = 1;

  list(category: TraitCategory): TraitRecord[] {
    return Array.from(this.traits.values()).filter((trait) => trait.category === category);
  }

  create(category: TraitCategory, input: CreateTraitInput): TraitRecord {
    const trait = this.normalizeRecord({
      id: this.nextId++,
      category,
      value: input.value,
      severityEnabled: input.severityEnabled,
      severityLevel: input.severityLevel,
    });

    this.traits.set(trait.id, trait);
    return trait;
  }

  update(category: TraitCategory, id: number, input: UpdateTraitInput): TraitRecord {
    const current = this.traits.get(id);
    if (!current || current.category !== category) {
      throw new NotFoundException('Trait not found');
    }

    const updated = this.normalizeRecord({
      ...current,
      value: input.value ?? current.value,
      severityEnabled: input.severityEnabled ?? current.severityEnabled,
      severityLevel: input.severityLevel ?? current.severityLevel,
    });

    this.traits.set(updated.id, updated);
    return updated;
  }

  remove(category: TraitCategory, id: number): void {
    const current = this.traits.get(id);
    if (!current || current.category !== category) {
      throw new NotFoundException('Trait not found');
    }

    this.traits.delete(id);
  }

  private normalizeRecord(record: TraitRecord): TraitRecord {
    if (record.category !== 'health') {
      return {
        id: record.id,
        category: record.category,
        value: record.value,
      };
    }

    const severityEnabled = Boolean(record.severityEnabled);
    return {
      id: record.id,
      category: record.category,
      value: record.value,
      severityEnabled,
      severityLevel: severityEnabled ? record.severityLevel : undefined,
    };
  }
}
