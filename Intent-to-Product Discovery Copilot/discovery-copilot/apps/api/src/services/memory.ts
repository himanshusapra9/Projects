import type { LongTermMemory, Session } from '@discovery-copilot/types';
import type { MemoryService } from '@discovery-copilot/ai';

/**
 * Memory service manages cross-session user preferences.
 *
 * Storage strategy:
 *   - Postgres: canonical store for long-term memory
 *   - Redis: cached copy with 24h TTL for fast session startup
 *
 * Memory is updated after each session ends, not on every turn.
 * This avoids premature conclusions from mid-session behavior.
 */
export class UserMemoryService implements MemoryService {
  async getLongTermMemory(userId: string): Promise<LongTermMemory | null> {
    // 1. Check Redis cache
    // const cached = await redis.get(`memory:${userId}`);
    // if (cached) return JSON.parse(cached);

    // 2. Fall back to Postgres
    // const row = await db.query('SELECT * FROM long_term_memory WHERE user_id = $1', [userId]);
    // if (!row) return null;

    // 3. Cache in Redis
    // await redis.setex(`memory:${userId}`, 86400, JSON.stringify(row));

    return null;
  }

  async updateFromSession(session: Session): Promise<void> {
    if (!session.userId) return;

    // In production, this runs the MEMORY_SUMMARIZATION_PROMPT via the LLM
    // to extract durable preferences from the session transcript.
    //
    // Steps:
    //   1. Load current memory
    //   2. Build session transcript from turns
    //   3. Determine session outcome (purchased / abandoned / etc.)
    //   4. Run memory summarization prompt
    //   5. Merge preference updates
    //   6. Persist to Postgres
    //   7. Invalidate Redis cache
  }

  async deleteMemory(userId: string): Promise<void> {
    // GDPR: hard delete
    // await db.query('DELETE FROM long_term_memory WHERE user_id = $1', [userId]);
    // await redis.del(`memory:${userId}`);
  }
}
