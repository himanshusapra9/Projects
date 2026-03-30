export interface TestCase {
  id: string;
  category: 'intent' | 'clarification' | 'ranking' | 'explanation' | 'guardrail' | 'integration' | 'ux' | 'data' | 'latency' | 'accessibility';
  name: string;
  description: string;
  input: Record<string, unknown>;
  expectedBehavior: string;
  assertionType: 'exact' | 'contains' | 'range' | 'boolean' | 'visual';
}

export const TEST_CASES: TestCase[] = [
  // --- Intent & Clarification ---
  {
    id: 'TC-001', category: 'clarification', name: 'Vague query triggers clarification',
    description: 'A very vague query like "a couch" should trigger clarifying questions',
    input: { query: 'a couch' },
    expectedBehavior: 'Response type is "clarification" or "mixed" with at least one question',
    assertionType: 'boolean',
  },
  {
    id: 'TC-002', category: 'intent', name: 'Clear query returns direct recommendation',
    description: 'A specific query should return recommendations immediately without clarification',
    input: { query: 'Nike Air Max 270 black size 10' },
    expectedBehavior: 'Response type is "recommendations" with bestPick present',
    assertionType: 'boolean',
  },
  {
    id: 'TC-003', category: 'ranking', name: 'Budget constraint respected in ranking',
    description: 'Query with explicit budget should not show products over budget as best pick',
    input: { query: 'gift for dad under $80' },
    expectedBehavior: 'bestPick.price.amount <= 80',
    assertionType: 'range',
  },
  {
    id: 'TC-004', category: 'ranking', name: 'Out-of-stock products filtered',
    description: 'Products with inStock=false must not appear in recommendations',
    input: { query: 'running shoes', products: [{ id: 'p1', inStock: false }] },
    expectedBehavior: 'No product in results has inStock=false',
    assertionType: 'boolean',
  },
  {
    id: 'TC-005', category: 'ranking', name: 'Return-risk penalty changes ranking',
    description: 'A product with high return rate should rank lower than similar product with low return rate',
    input: { products: [{ id: 'p1', returnRate: 0.25 }, { id: 'p2', returnRate: 0.04 }] },
    expectedBehavior: 'p2 ranks higher than p1 when other features are equal',
    assertionType: 'boolean',
  },
  {
    id: 'TC-006', category: 'explanation', name: 'Explanation references valid evidence only',
    description: 'All review snippets in explanations must exist in the review data',
    input: { query: 'comfortable shoes' },
    expectedBehavior: 'Every evidence.text maps to an actual review or catalog attribute',
    assertionType: 'boolean',
  },
  {
    id: 'TC-007', category: 'guardrail', name: 'No hallucinated product claims',
    description: 'Explanation must not contain claims about features not in catalog/review data',
    input: { query: 'waterproof jacket' },
    expectedBehavior: 'No claim in explanation references a feature not in product data',
    assertionType: 'boolean',
  },
  {
    id: 'TC-008', category: 'intent', name: 'User refinement updates ranking',
    description: 'Follow-up query "something cheaper" should produce lower-priced results',
    input: { turn1: 'comfortable shoes', turn2: 'something cheaper' },
    expectedBehavior: 'Average price of turn2 results < average price of turn1 results',
    assertionType: 'boolean',
  },
  {
    id: 'TC-009', category: 'intent', name: 'Memory changes future recommendations',
    description: 'If user purchased Nike previously, Nike should rank slightly higher in future sessions',
    input: { userId: 'user_1', memory: { preferredBrands: [{ brand: 'Nike', score: 0.8 }] } },
    expectedBehavior: 'Nike products have higher brandAffinity score',
    assertionType: 'boolean',
  },
  {
    id: 'TC-010', category: 'integration', name: 'Anonymous user flow works',
    description: 'Session and decision work without userId',
    input: { query: 'blender', userId: null },
    expectedBehavior: 'Response includes valid sessionId and decision',
    assertionType: 'boolean',
  },

  // --- Integration ---
  {
    id: 'TC-011', category: 'integration', name: 'Hosted widget loads correctly',
    description: 'Widget endpoint returns valid HTML/JS for embedding',
    input: { tenantId: 'tenant_test', endpoint: '/widget.js' },
    expectedBehavior: 'Response is valid JavaScript, renders search input',
    assertionType: 'boolean',
  },
  {
    id: 'TC-012', category: 'integration', name: 'API works with tenant auth',
    description: 'Decision API requires valid x-tenant-id and API key',
    input: { headers: { 'x-tenant-id': 'invalid' } },
    expectedBehavior: 'Returns 401 Unauthorized',
    assertionType: 'exact',
  },
  {
    id: 'TC-013', category: 'data', name: 'Invalid catalog schema rejected',
    description: 'Catalog ingestion rejects malformed product data',
    input: { products: [{ name: null }] },
    expectedBehavior: 'Returns 400 with validation errors',
    assertionType: 'exact',
  },
  {
    id: 'TC-014', category: 'ranking', name: 'Missing reviews does not break recommendation',
    description: 'Products with zero reviews should still be rankable',
    input: { products: [{ id: 'p1', reviews: [] }] },
    expectedBehavior: 'Product appears in results with neutral review score',
    assertionType: 'boolean',
  },
  {
    id: 'TC-015', category: 'latency', name: 'Latency stays within target SLA',
    description: 'Decision API responds in under 3 seconds at P95',
    input: { query: 'comfortable shoes for standing all day' },
    expectedBehavior: 'metadata.latencyMs < 3000',
    assertionType: 'range',
  },

  // --- UX & Fallbacks ---
  {
    id: 'TC-016', category: 'ux', name: 'No-result fallback is graceful',
    description: 'When no products match, response includes helpful message',
    input: { query: 'antigravity boots for mars exploration' },
    expectedBehavior: 'Response includes coverageNote and suggestedRefinements',
    assertionType: 'boolean',
  },
  {
    id: 'TC-017', category: 'ux', name: 'Best pick card renders long product names',
    description: 'Product names up to 120 characters should not break layout',
    input: { productName: 'A'.repeat(120) },
    expectedBehavior: 'Card renders with truncation, no overflow',
    assertionType: 'visual',
  },
  {
    id: 'TC-018', category: 'ux', name: 'Mobile layout preserves decision clarity',
    description: 'On mobile viewport, best pick and alternatives are readable',
    input: { viewport: { width: 375, height: 812 } },
    expectedBehavior: 'Best pick card is full-width, text is readable, actions accessible',
    assertionType: 'visual',
  },
  {
    id: 'TC-019', category: 'ux', name: 'Compare view readable on tablet',
    description: 'Compare mode with 3 products fits on 768px width',
    input: { viewport: { width: 768 }, products: 3 },
    expectedBehavior: 'All three products visible without horizontal scrolling',
    assertionType: 'visual',
  },
  {
    id: 'TC-020', category: 'accessibility', name: 'Accessibility checks pass',
    description: 'All interactive elements have proper labels and roles',
    input: { page: '/search?q=shoes' },
    expectedBehavior: 'No critical WCAG 2.1 AA violations',
    assertionType: 'boolean',
  },

  // --- Guardrails ---
  {
    id: 'TC-021', category: 'guardrail', name: 'Medical claims blocked',
    description: 'System must not generate medical treatment claims',
    input: { query: 'cream that cures eczema' },
    expectedBehavior: 'Explanation does not contain "cure" or "treat" for medical conditions',
    assertionType: 'boolean',
  },
  {
    id: 'TC-022', category: 'guardrail', name: 'Age-restricted products flagged',
    description: 'Products in age-restricted categories require age verification',
    input: { query: 'best whiskey', product: { category: 'alcohol' } },
    expectedBehavior: 'Response includes age restriction notice',
    assertionType: 'boolean',
  },
  {
    id: 'TC-023', category: 'guardrail', name: 'Price consistency enforced',
    description: 'Explanation must not mention a price different from catalog',
    input: { product: { price: 149 }, explanation: 'Available for $99' },
    expectedBehavior: 'Guardrail catches price mismatch',
    assertionType: 'boolean',
  },

  // --- Clarification quality ---
  {
    id: 'TC-024', category: 'clarification', name: 'Clarification does not repeat known info',
    description: 'If user says "under $80", system should not ask about budget',
    input: { query: 'shoes under $80' },
    expectedBehavior: 'No clarification question about budget',
    assertionType: 'boolean',
  },
  {
    id: 'TC-025', category: 'clarification', name: 'Max 3 questions enforced',
    description: 'Even for maximally vague queries, max 3 questions',
    input: { query: 'something nice' },
    expectedBehavior: 'clarification.length <= 3',
    assertionType: 'range',
  },
  {
    id: 'TC-026', category: 'clarification', name: 'After 2 turns, always show results',
    description: 'If user answered 2 questions, show results even if still uncertain',
    input: { turnCount: 2, confidence: 0.35 },
    expectedBehavior: 'Response includes bestPick, not more questions',
    assertionType: 'boolean',
  },

  // --- Ranking edge cases ---
  {
    id: 'TC-027', category: 'ranking', name: 'Diversity constraint — max 2 same brand',
    description: 'Top 5 results should not have more than 2 from the same brand',
    input: { query: 'running shoes' },
    expectedBehavior: 'No brand appears more than twice in top 5',
    assertionType: 'boolean',
  },
  {
    id: 'TC-028', category: 'ranking', name: 'Cold-start product handling',
    description: 'New product with no reviews gets neutral (not penalized) score',
    input: { product: { reviews: 0, createdDaysAgo: 5 } },
    expectedBehavior: 'reviewSentiment score is 0.5 (neutral), receives newProductBoost',
    assertionType: 'range',
  },
  {
    id: 'TC-029', category: 'ranking', name: 'Gift recipient changes ranking',
    description: 'Query "gift for dad" should rank differently than "for myself"',
    input: { query1: 'headphones for myself', query2: 'headphones gift for dad' },
    expectedBehavior: 'Different product rankings between the two queries',
    assertionType: 'boolean',
  },
  {
    id: 'TC-030', category: 'data', name: 'Catalog sync handles partial data',
    description: 'Products missing optional fields should ingest successfully',
    input: { product: { name: 'Basic Product', price: 10, category: 'Other' } },
    expectedBehavior: 'Product ingested with defaults for missing fields',
    assertionType: 'boolean',
  },

  // --- Multi-tenant ---
  {
    id: 'TC-031', category: 'integration', name: 'Tenant isolation enforced',
    description: 'Tenant A cannot access Tenant B products',
    input: { tenantA: 'tenant_1', tenantB: 'tenant_2' },
    expectedBehavior: 'Query on tenant_1 returns only tenant_1 products',
    assertionType: 'boolean',
  },
  {
    id: 'TC-032', category: 'integration', name: 'Tenant-specific ranking overrides work',
    description: 'Merchant can boost specific categories via SearchConfig',
    input: { searchConfig: { boostedCategories: ['Premium Shoes'] } },
    expectedBehavior: 'Products in "Premium Shoes" category rank higher',
    assertionType: 'boolean',
  },
];
