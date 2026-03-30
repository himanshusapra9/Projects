import type { Product } from '@discovery-copilot/types';

export const SEED_PRODUCTS: Partial<Product>[] = [
  {
    id: 'seed_001', sku: 'SHOE-COMFORT-001', name: 'CloudStep Pro Standing Shoe', brand: 'ComfortWalk',
    category: { l1: 'Shoes', l2: 'Work Shoes', l3: 'Standing Comfort', breadcrumb: ['Shoes', 'Work Shoes', 'Standing Comfort'] },
    description: 'Engineered for all-day standing with cushioned EVA insole and arch support. Mesh upper for breathability.',
    shortDescription: 'All-day comfort for standing professionals',
    price: { amount: 149, currency: 'USD', originalAmount: 179, discountPercent: 17 },
    images: [{ url: '/images/shoe-001.jpg', alt: 'CloudStep Pro', isPrimary: true }],
    attributes: { color: ['Black', 'White'], size: ['7', '8', '9', '10', '11', '12'], material: ['Mesh', 'EVA', 'Rubber'], useCase: ['standing', 'work', 'all-day wear'], style: ['athletic', 'casual'] },
    reviewSummary: { averageRating: 4.6, totalReviews: 1247, ratingDistribution: { 1: 23, 2: 41, 3: 87, 4: 312, 5: 784 }, topPositiveThemes: [{ theme: 'comfort', mentions: 412, averageSentiment: 0.89, exampleSnippets: ['Most comfortable shoe for 12-hour shifts'] }], topNegativeThemes: [{ theme: 'durability', mentions: 87, averageSentiment: -0.62, exampleSnippets: ['Sole separates after 6 months'] }], sentimentByAttribute: {}, verifiedPurchasePercent: 0.82 },
    returnStats: { returnRate: 0.04, topReturnReasons: [{ reason: 'Wrong size', percentage: 0.45, category: 'fit' }], fitIssueRate: 0.02, qualityIssueRate: 0.01, expectationMismatchRate: 0.01, averageDaysToReturn: 12 },
    availability: { inStock: true, quantity: 234, fulfillmentType: 'shipped', shippingEstimate: '2-3 days' },
    merchantAttributes: {}, specs: {}, taxonomy: [], variants: [],
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'seed_002', sku: 'VAC-QUIET-001', name: 'WhisperClean Pet Pro Vacuum', brand: 'SilentHome',
    category: { l1: 'Home', l2: 'Vacuums', l3: 'Pet Hair', breadcrumb: ['Home', 'Vacuums', 'Pet Hair'] },
    description: 'Ultra-quiet 65dB vacuum with HEPA filtration and specialized pet hair brush roll.',
    shortDescription: 'Quiet vacuum built for pet owners',
    price: { amount: 299, currency: 'USD' },
    images: [{ url: '/images/vac-001.jpg', alt: 'WhisperClean Pet Pro', isPrimary: true }],
    attributes: { noiseLevel: ['65dB'], type: ['upright'], feature: ['HEPA', 'pet hair brush roll', 'quiet motor'], useCase: ['pet hair', 'daily cleaning'] },
    reviewSummary: { averageRating: 4.4, totalReviews: 891, ratingDistribution: { 1: 18, 2: 33, 3: 67, 4: 298, 5: 475 }, topPositiveThemes: [{ theme: 'quiet', mentions: 312, averageSentiment: 0.91, exampleSnippets: ['Quieter than conversation'] }], topNegativeThemes: [{ theme: 'dustbin size', mentions: 65, averageSentiment: -0.58, exampleSnippets: ['Small bin needs frequent emptying'] }], sentimentByAttribute: {}, verifiedPurchasePercent: 0.79 },
    returnStats: { returnRate: 0.06, topReturnReasons: [{ reason: 'Too heavy', percentage: 0.35, category: 'expectation' }], fitIssueRate: 0, qualityIssueRate: 0.02, expectationMismatchRate: 0.04, averageDaysToReturn: 18 },
    availability: { inStock: true, quantity: 89, fulfillmentType: 'shipped', shippingEstimate: '3-5 days' },
    merchantAttributes: {}, specs: { weight: '14 lbs', cordLength: '30 ft' }, taxonomy: [], variants: [],
    createdAt: '2025-09-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
];
