import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Resolves API keys (x-api-key header) to tenant ids. */
@Injectable()
export class TenantKeysService implements OnModuleInit {
  private keyToTenant = new Map<string, string>();
  private keyMeta = new Map<string, { kind: 'SERVER' | 'WIDGET' }>();

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const raw = this.config.get<string>('API_KEYS_JSON') ?? '{}';
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      for (const [key, tenantId] of Object.entries(parsed)) {
        this.keyToTenant.set(key, tenantId);
        this.keyMeta.set(key, { kind: key.includes('widget') ? 'WIDGET' : 'SERVER' });
      }
    } catch {
      // Dev fallback
      this.keyToTenant.set('dev-server', 'tenant_dev_1');
      this.keyToTenant.set('dev-widget', 'tenant_dev_1');
    }
    if (this.keyToTenant.size === 0) {
      this.keyToTenant.set('dev-server', 'tenant_dev_1');
      this.keyToTenant.set('dev-widget', 'tenant_dev_1');
    }
  }

  resolveTenant(apiKey: string | undefined): { tenantId: string; keyId: string } | null {
    if (!apiKey) return null;
    const tenantId = this.keyToTenant.get(apiKey);
    if (!tenantId) return null;
    return { tenantId, keyId: apiKey };
  }

  getKeyKind(apiKey: string): 'SERVER' | 'WIDGET' {
    return this.keyMeta.get(apiKey)?.kind ?? 'SERVER';
  }
}
