import {
  AccountStatus,
  AssetType,
  Channel,
  ExtractionMethod,
  IngestionStatus,
  MonitorStatus,
  PackageStatus,
  Plan,
  PrismaClient,
  ProductStatus,
  PublishStatus,
  RemediationStatus,
  RemediationType,
  ReviewStatus,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const org = await prisma.organization.upsert({
    where: { slug: 'demo-shop' },
    update: {},
    create: {
      name: 'Demo Shop',
      slug: 'demo-shop',
      plan: Plan.FREE_TRIAL,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: { passwordHash, organizationId: org.id },
    create: {
      email: 'admin@demo.com',
      passwordHash,
      role: Role.ADMIN,
      organizationId: org.id,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'seller@demo.com' },
    update: { passwordHash, organizationId: org.id },
    create: {
      email: 'seller@demo.com',
      passwordHash,
      role: Role.OPERATOR,
      organizationId: org.id,
    },
  });

  await prisma.channelAccount.deleteMany({ where: { organizationId: org.id } });
  await prisma.channelAccount.createMany({
    data: [
      {
        organizationId: org.id,
        channel: Channel.AMAZON,
        name: 'Amazon US',
        externalId: 'A2DEMO123',
        credentialsJson: {
          lwaClientId: 'amzn1.application-oa2-client.demo',
          lwaClientSecret: 'mock-secret-amazon',
          refreshToken: 'mock-refresh-token-amazon',
          sellerId: 'A1DEMOXXXX',
        },
        status: AccountStatus.ACTIVE,
      },
      {
        organizationId: org.id,
        channel: Channel.EBAY,
        name: 'eBay Main',
        externalId: 'EBAY-DEMO',
        credentialsJson: {
          appId: 'DemoApp-ebay',
          certId: 'mock-cert',
          devId: 'mock-dev',
          authToken: 'mock-ebay-auth-token',
        },
        status: AccountStatus.ACTIVE,
      },
      {
        organizationId: org.id,
        channel: Channel.SHOPIFY,
        name: 'Shopify Store',
        externalId: 'demo-shop.myshopify.com',
        credentialsJson: {
          shopDomain: 'demo-shop.myshopify.com',
          accessToken: 'shpat_mock_shopify_token',
          apiVersion: '2024-10',
        },
        status: AccountStatus.ACTIVE,
      },
    ],
  });

  const channels = await prisma.channelAccount.findMany({
    where: { organizationId: org.id },
  });
  const amazonAccount = channels.find((c) => c.channel === Channel.AMAZON);
  const ebayAccount = channels.find((c) => c.channel === Channel.EBAY);

  await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
  await prisma.remediationRecommendation.deleteMany({
    where: { monitor: { organizationId: org.id } },
  });
  await prisma.monitor.deleteMany({ where: { organizationId: org.id } });
  await prisma.publishEvent.deleteMany({ where: { organizationId: org.id } });
  await prisma.validation.deleteMany({
    where: { listingPackage: { product: { organizationId: org.id } } },
  });
  await prisma.listingPackage.deleteMany({
    where: { product: { organizationId: org.id } },
  });
  await prisma.evidence.deleteMany({ where: { product: { organizationId: org.id } } });
  await prisma.attribute.deleteMany({ where: { product: { organizationId: org.id } } });
  await prisma.variant.deleteMany({ where: { product: { organizationId: org.id } } });
  await prisma.product.deleteMany({ where: { organizationId: org.id } });
  await prisma.sourceAsset.deleteMany({
    where: { ingestionJob: { organizationId: org.id } },
  });
  await prisma.ingestionJob.deleteMany({ where: { organizationId: org.id } });

  const ingestion1 = await prisma.ingestionJob.create({
    data: {
      organizationId: org.id,
      status: IngestionStatus.COMPLETE,
      sourceLabel: 'manual-upload-p1',
    },
  });

  const asset1 = await prisma.sourceAsset.create({
    data: {
      ingestionJobId: ingestion1.id,
      type: AssetType.IMAGE,
      originalFilename: 'hero.jpg',
      storageKey: `org/${org.id}/assets/hero.jpg`,
      mimeType: 'image/jpeg',
      sizeBytes: 120400,
      checksumSha256: 'a'.repeat(64),
      metadataJson: { width: 1200, height: 800 },
    },
  });

  const product1 = await prisma.product.create({
    data: {
      organizationId: org.id,
      ingestionJobId: ingestion1.id,
      title: 'Wireless Headphones — In Review',
      brand: 'AudioCo',
      status: ProductStatus.REVIEW_READY,
      reviewStatus: ReviewStatus.NEEDS_REVIEW,
      completeness: 0.42,
      attributes: {
        create: [
          {
            fieldName: 'color',
            value: 'Black',
            confidence: 0.55,
            method: ExtractionMethod.IMAGE_VISION,
            requiresReview: true,
            conflicted: true,
          },
          {
            fieldName: 'battery_life',
            value: '24 hours',
            confidence: 0.45,
            method: ExtractionMethod.LLM_INFERENCE,
            requiresReview: true,
            conflicted: false,
          },
        ],
      },
    },
    include: { attributes: true },
  });

  const attr1 = product1.attributes[0];
  if (attr1) {
    await prisma.evidence.create({
      data: {
        productId: product1.id,
        sourceAssetId: asset1.id,
        attributeId: attr1.id,
        snippet: 'Black finish',
        explanation: 'Dominant color extracted from packaging image.',
        confidence: 0.55,
      },
    });
  }

  const ingestion2 = await prisma.ingestionJob.create({
    data: {
      organizationId: org.id,
      status: IngestionStatus.COMPLETE,
      sourceLabel: 'sku-feed',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      organizationId: org.id,
      ingestionJobId: ingestion2.id,
      title: 'Stainless Steel Water Bottle 32oz',
      brand: 'HydroLine',
      upc: '012345678905',
      status: ProductStatus.APPROVED,
      reviewStatus: ReviewStatus.APPROVED,
      completeness: 0.88,
      attributes: {
        create: [
          {
            fieldName: 'material',
            value: 'Stainless Steel',
            normalizedValue: 'stainless steel',
            confidence: 0.92,
            method: ExtractionMethod.STRUCTURED_PARSE,
            requiresReview: false,
          },
        ],
      },
    },
  });

  await prisma.listingPackage.createMany({
    data: [
      {
        productId: product2.id,
        channel: Channel.AMAZON,
        status: PackageStatus.APPROVED,
        title: 'HydroLine 32oz Stainless Steel Water Bottle — Leak Proof',
        bulletsJson: [
          '32oz capacity',
          'BPA-free',
          'Double-wall insulation',
          'Dishwasher safe lid',
          'Lifetime warranty',
        ],
        description: 'Premium bottle for daily hydration.',
        attributesJson: { brand: 'HydroLine', condition: 'New' },
        keywordsJson: ['water bottle', 'insulated', '32oz'],
        imagesJson: [{ url: 'https://cdn.example.com/bottle-main.jpg', role: 'MAIN', order: 0 }],
        qualityScore: 0.82,
      },
      {
        productId: product2.id,
        channel: Channel.EBAY,
        status: PackageStatus.VALIDATED,
        title: 'HydroLine 32oz Steel Water Bottle Insulated BPA-Free',
        bulletsJson: [],
        description: 'Same great bottle for eBay buyers.',
        attributesJson: { brand: 'HydroLine' },
        keywordsJson: ['bottle'],
        imagesJson: [{ url: 'https://cdn.example.com/bottle-main.jpg', role: 'MAIN', order: 0 }],
        qualityScore: 0.78,
      },
    ],
  });

  await prisma.evidence.create({
    data: {
      productId: product2.id,
      snippet: 'Material: Stainless Steel',
      explanation: 'Parsed from supplier spreadsheet row.',
      confidence: 0.92,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      organizationId: org.id,
      title: 'Smart Plug Mini — Published',
      brand: 'PlugTech',
      asin: 'B0DEMO1234',
      status: ProductStatus.PUBLISHED,
      reviewStatus: ReviewStatus.APPROVED,
      completeness: 0.91,
    },
  });

  await prisma.listingPackage.upsert({
    where: {
      productId_channel: { productId: product3.id, channel: Channel.AMAZON },
    },
    update: {},
    create: {
      productId: product3.id,
      channel: Channel.AMAZON,
      status: PackageStatus.PUBLISHED,
      title: 'PlugTech Smart Plug Mini Alexa Google Home',
      bulletsJson: ['Voice control', 'Scheduling', 'Energy monitoring', 'Compact', 'ETL listed'],
      description: 'Compact smart plug.',
      attributesJson: {},
      keywordsJson: ['smart plug'],
      imagesJson: [],
      qualityScore: 0.85,
    },
  });

  const pkgAmazon = await prisma.listingPackage.findUniqueOrThrow({
    where: { productId_channel: { productId: product3.id, channel: Channel.AMAZON } },
  });

  await prisma.listingPackage.upsert({
    where: {
      productId_channel: { productId: product3.id, channel: Channel.EBAY },
    },
    update: {},
    create: {
      productId: product3.id,
      channel: Channel.EBAY,
      status: PackageStatus.PUBLISHED,
      title: 'PlugTech Smart Plug Mini WiFi Voice Control',
      bulletsJson: [],
      description: 'eBay listing body.',
      attributesJson: {},
      keywordsJson: [],
      imagesJson: [],
      qualityScore: 0.8,
    },
  });

  await prisma.publishEvent.createMany({
    data: [
      {
        organizationId: org.id,
        productId: product3.id,
        listingPackageId: pkgAmazon.id,
        channelAccountId: amazonAccount?.id,
        channel: Channel.AMAZON,
        status: PublishStatus.SUCCESS,
        dryRun: false,
        channelListingId: 'AMZN-LIST-1001',
        publishedAt: new Date(),
        rawResponseJson: { feedId: 'mock-feed-amazon' },
      },
      {
        organizationId: org.id,
        productId: product3.id,
        channel: Channel.EBAY,
        channelAccountId: ebayAccount?.id,
        status: PublishStatus.SUCCESS,
        dryRun: false,
        channelListingId: 'EBAY-LIST-2002',
        publishedAt: new Date(),
        rawResponseJson: { itemId: 'mock-ebay-item' },
      },
    ],
  });

  await prisma.monitor.create({
    data: {
      organizationId: org.id,
      productId: product3.id,
      channel: Channel.AMAZON,
      channelListingId: 'AMZN-LIST-1001',
      status: MonitorStatus.ACTIVE,
      healthScore: 0.94,
      lastCheckedAt: new Date(),
    },
  });

  await prisma.evidence.create({
    data: {
      productId: product3.id,
      snippet: 'Model: SP-MINI-01',
      explanation: 'Confirmed from manufacturer API lookup.',
      confidence: 0.95,
    },
  });

  const product4 = await prisma.product.create({
    data: {
      organizationId: org.id,
      title: 'Running Shoes — With Alerts',
      brand: 'Stride',
      status: ProductStatus.PUBLISHED,
      reviewStatus: ReviewStatus.APPROVED,
      completeness: 0.76,
    },
  });

  const monitor4 = await prisma.monitor.create({
    data: {
      organizationId: org.id,
      productId: product4.id,
      channel: Channel.AMAZON,
      channelListingId: 'AMZN-LIST-4004',
      status: MonitorStatus.SUPPRESSED,
      healthScore: 0.35,
      lastCheckedAt: new Date(),
    },
  });

  await prisma.remediationRecommendation.createMany({
    data: [
      {
        monitorId: monitor4.id,
        type: RemediationType.SUPPRESSION_FIX,
        title: 'Restore search visibility',
        description: 'Listing suppressed for policy review — update main image and title.',
        impactScore: 95,
        suggestedFixJson: { action: 'replace_main_image', assetKey: 'org/assets/shoe-main.jpg' },
        status: RemediationStatus.OPEN,
      },
      {
        monitorId: monitor4.id,
        type: RemediationType.DISCOVERABILITY,
        title: 'Improve backend keywords',
        description: 'Add sport and size terms to improve browse discovery.',
        impactScore: 45,
        suggestedFixJson: { keywords: ['running', 'men', 'size 10'] },
        status: RemediationStatus.OPEN,
      },
    ],
  });

  await prisma.evidence.create({
    data: {
      productId: product4.id,
      snippet: 'Suppressed: image policy',
      explanation: 'Amazon health report excerpt.',
      confidence: 0.9,
    },
  });

  const ingestionBulk = await prisma.ingestionJob.create({
    data: {
      organizationId: org.id,
      status: IngestionStatus.COMPLETE,
      sourceLabel: 'bulk-clothing-import',
    },
  });

  const product5 = await prisma.product.create({
    data: {
      organizationId: org.id,
      ingestionJobId: ingestionBulk.id,
      title: 'Organic Cotton Tee — Multi-Variant',
      brand: 'EarthWear',
      status: ProductStatus.DRAFT,
      reviewStatus: ReviewStatus.NEEDS_REVIEW,
      completeness: 0.55,
    },
  });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Navy', 'White', 'Black', 'Olive', 'Rust'];
  for (let i = 0; i < 10; i++) {
    await prisma.variant.create({
      data: {
        productId: product5.id,
        sku: `EW-TEE-${sizes[i % sizes.length]}-${colors[i % colors.length]}`,
        title: `Tee ${sizes[i % sizes.length]} / ${colors[i % colors.length]}`,
        attributesJson: {
          size: sizes[i % sizes.length],
          color: colors[i % colors.length],
        },
        sortOrder: i,
      },
    });
  }

  await prisma.evidence.create({
    data: {
      productId: product5.id,
      snippet: 'Variant matrix from bulk CSV',
      explanation: 'Structured parse of size/color combinations.',
      confidence: 0.88,
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: org.id,
        userId: admin.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: admin.id,
        detailsJson: { email: admin.email },
      },
      {
        organizationId: org.id,
        userId: operator.id,
        action: 'PRODUCT_CREATED',
        entityType: 'Product',
        entityId: product1.id,
        detailsJson: { title: product1.title },
      },
      {
        organizationId: org.id,
        userId: operator.id,
        action: 'PUBLISH_SUCCESS',
        entityType: 'PublishEvent',
        entityId: 'batch',
        detailsJson: { productId: product3.id, channels: ['AMAZON', 'EBAY'] },
      },
    ],
  });

  console.info('Seed complete:', {
    org: org.slug,
    users: [admin.email, operator.email],
    products: [product1.id, product2.id, product3.id, product4.id, product5.id],
  });
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
