import { Injectable } from '@nestjs/common';
import { BehaviorEventItemDto } from '../common/dto/behavior.dto';

export interface StoredBehaviorEvent {
  id: string;
  tenantId: string;
  sessionId: string;
  userId?: string;
  type: string;
  payload: Record<string, unknown>;
  receivedAt: string;
  clientTs?: string;
}

/** In-memory event log (flush to warehouse in production). */
@Injectable()
export class BehaviorIngestService {
  private events: StoredBehaviorEvent[] = [];
  private max = 50_000;

  append(
    tenantId: string,
    sessionId: string,
    userId: string | undefined,
    events: BehaviorEventItemDto[],
  ): { accepted: number } {
    const now = new Date().toISOString();
    for (const e of events) {
      this.events.push({
        id: `evt_${this.events.length}_${Date.now()}`,
        tenantId,
        sessionId,
        userId,
        type: e.type,
        payload: e.payload,
        receivedAt: now,
        clientTs: e.ts,
      });
    }
    if (this.events.length > this.max) {
      this.events = this.events.slice(-this.max);
    }
    return { accepted: events.length };
  }
}
