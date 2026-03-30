import { Injectable } from '@nestjs/common';
import { MemoryPutDto } from '../common/dto/memory.dto';

export interface StoredMemory {
  userId: string;
  tenantId: string;
  categoryId?: string;
  prefs: Record<string, unknown>;
  provenance: Record<string, 'EXPLICIT' | 'INFERRED'>;
  updatedAt: string;
}

/** In-memory user preference store (swap for Postgres in production). */
@Injectable()
export class MemoryStoreService {
  private store = new Map<string, StoredMemory>();

  private key(tenantId: string, userId: string) {
    return `${tenantId}:${userId}`;
  }

  get(tenantId: string, userId: string): StoredMemory | undefined {
    return this.store.get(this.key(tenantId, userId));
  }

  upsert(tenantId: string, userId: string, body: MemoryPutDto): StoredMemory {
    const existing = this.store.get(this.key(tenantId, userId));
    const prefs: Record<string, unknown> = { ...existing?.prefs };
    const provenance: Record<string, 'EXPLICIT' | 'INFERRED'> = {
      ...existing?.provenance,
    };

    for (const p of body.prefs) {
      prefs[p.key] = p.value;
      provenance[p.key] = p.provenance ?? 'EXPLICIT';
    }
    if (body.provenance) {
      Object.assign(provenance, body.provenance);
    }

    const next: StoredMemory = {
      userId,
      tenantId,
      categoryId: body.category_id ?? existing?.categoryId,
      prefs,
      provenance,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(this.key(tenantId, userId), next);
    return next;
  }

  delete(tenantId: string, userId: string): boolean {
    return this.store.delete(this.key(tenantId, userId));
  }
}
