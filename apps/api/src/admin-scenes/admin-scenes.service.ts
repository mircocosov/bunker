import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

export interface SceneRecord {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

interface CreateSceneInput {
  name: string;
  description: string;
  imageUrl: string;
}

interface UpdateSceneInput {
  name?: string;
  description?: string;
  imageUrl?: string;
}

@Injectable()
export class AdminScenesService {
  private readonly scenes = new Map<number, SceneRecord>();
  private nextId = 1;

  readonly uploadsDir = join(__dirname, '..', '..', 'uploads', 'scenes');

  constructor() {
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  list(): SceneRecord[] {
    return Array.from(this.scenes.values());
  }

  create(input: CreateSceneInput): SceneRecord {
    const scene: SceneRecord = {
      id: this.nextId++,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
    };
    this.scenes.set(scene.id, scene);
    return scene;
  }

  update(id: number, input: UpdateSceneInput): SceneRecord {
    const current = this.scenes.get(id);
    if (!current) {
      throw new NotFoundException('Scene not found');
    }

    const updated: SceneRecord = {
      ...current,
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      imageUrl: input.imageUrl ?? current.imageUrl,
    };
    this.scenes.set(id, updated);
    return updated;
  }

  remove(id: number): void {
    const current = this.scenes.get(id);
    if (!current) {
      throw new NotFoundException('Scene not found');
    }

    this.scenes.delete(id);
    if (current.imageUrl.startsWith('/bunker/api/assets/scenes/')) {
      const filename = current.imageUrl.split('/').pop();
      if (filename) {
        const fullPath = join(this.uploadsDir, filename);
        if (existsSync(fullPath)) {
          rmSync(fullPath);
        }
      }
    }
  }
}
