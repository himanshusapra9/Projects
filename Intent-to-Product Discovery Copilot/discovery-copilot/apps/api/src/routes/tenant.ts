import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type { MerchantTenant } from '@discovery-copilot/types';

export const tenantRouter = Router();

const createTenantSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(50),
  mode: z.enum(['api', 'hosted', 'both']),
  plan: z.enum(['starter', 'growth', 'enterprise']).default('starter'),
  catalogConfig: z.object({
    feedUrl: z.string().url().optional(),
    feedFormat: z.enum(['json', 'csv', 'xml', 'shopify', 'bigcommerce', 'magento']).default('json'),
    syncFrequency: z.enum(['realtime', 'hourly', 'daily']).default('daily'),
  }),
  brandingConfig: z.object({
    primaryColor: z.string().default('#18181B'),
    borderRadius: z.enum(['sharp', 'rounded', 'pill']).default('rounded'),
    theme: z.enum(['light', 'dark', 'auto']).default('light'),
  }).optional(),
});

tenantRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = createTenantSchema.parse(req.body);

    const tenant: MerchantTenant = {
      id: `tenant_${uuid()}`,
      name: body.name,
      slug: body.slug,
      plan: body.plan,
      mode: body.mode,
      catalogConfig: {
        ...body.catalogConfig,
        lastSyncAt: undefined,
        productCount: 0,
        categoryCount: 0,
        healthScore: 0,
        hasReviews: false,
        hasReturnsData: false,
        hasInventoryData: false,
      },
      searchConfig: {
        maxClarificationQuestions: 3,
        maxRecommendations: 5,
        enableMemory: true,
        enableReturnRisk: true,
        enableReviewIntelligence: true,
        defaultCurrency: 'USD',
        defaultLocale: 'en-US',
        blockedCategories: [],
        boostedCategories: [],
      },
      brandingConfig: body.brandingConfig ?? {
        primaryColor: '#18181B',
        borderRadius: 'rounded',
        theme: 'light',
      },
      integrationTier: 'basic',
      apiKeys: [{
        id: `key_${uuid()}`,
        prefix: `dc_live_${uuid().slice(0, 8)}`,
        hashedKey: `hashed_${uuid()}`,
        label: 'Default API Key',
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString(),
      }],
      webhooks: [],
      status: 'onboarding',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid tenant data', details: error.errors });
      return;
    }
    throw error;
  }
});

tenantRouter.get('/:tenantId', async (req: Request, res: Response) => {
  res.json({ id: req.params.tenantId, status: 'active' });
});

tenantRouter.post('/:tenantId/catalog/sync', async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  // Triggers async catalog sync job
  res.status(202).json({ jobId: `sync_${uuid()}`, status: 'queued', tenantId });
});

tenantRouter.post('/:tenantId/catalog/ingest', async (req: Request, res: Response) => {
  // Direct catalog upload (JSON array of products)
  const products = req.body.products ?? [];
  res.json({ ingested: products.length, tenantId: req.params.tenantId });
});
