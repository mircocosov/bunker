import { Injectable, NotFoundException } from '@nestjs/common';

export interface ChatFilterRecord {
  id: number;
  pattern: string;
}

@Injectable()
export class ChatFilterService {
  private readonly records = new Map<number, ChatFilterRecord>();
  private nextId = 1;

  list(): ChatFilterRecord[] {
    return Array.from(this.records.values());
  }

  create(pattern: string): ChatFilterRecord {
    const record: ChatFilterRecord = { id: this.nextId++, pattern: pattern.trim() };
    this.records.set(record.id, record);
    return record;
  }

  update(id: number, pattern: string): ChatFilterRecord {
    const current = this.records.get(id);
    if (!current) {
      throw new NotFoundException('Filter record not found');
    }

    const updated: ChatFilterRecord = { ...current, pattern: pattern.trim() };
    this.records.set(id, updated);
    return updated;
  }

  remove(id: number): void {
    if (!this.records.has(id)) {
      throw new NotFoundException('Filter record not found');
    }

    this.records.delete(id);
  }

  containsForbidden(text: string): boolean {
    const input = text.toLowerCase();
    return this.list().some((record) => record.pattern && input.includes(record.pattern.toLowerCase()));
  }

  maskText(text: string): string {
    let output = text;
    for (const record of this.list()) {
      if (!record.pattern) {
        continue;
      }

      const escaped = record.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'gi');
      output = output.replace(re, (match) => '*'.repeat(match.length));
    }

    return output;
  }
}
