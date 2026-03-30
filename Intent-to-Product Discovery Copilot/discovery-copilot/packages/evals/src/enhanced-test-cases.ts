import type { TestCase } from './test-cases';

export const ENHANCED_TEST_CASES: TestCase[] = [
  // --- Filters ---
  {
    id: 'TC-033', category: 'ranking', name: 'Hard filter excludes products',
    description: 'Price hard filter under $100 must exclude all products over $100 from results',
    input: { filter: { attribute: 'price', operator: 'lte', value: 100 } },
    expectedBehavior: 'No product in results has price > 100',
    assertionType: 'boolean',
  },
  {
    id: 'TC-034', category: 'ranking', name: 'Soft preference affects ranking not exclusion',
    description: 'Soft preference for lightweight should boost lightweight products but not hide heavy ones',
    input: { preference: { attribute: 'weight', direction: 'prefer_low' } },
    expectedBehavior: 'Light products rank higher but heavy products still appear',
    assertionType: 'boolean',
  },
  {
    id: 'TC-035', category: 'intent', name: 'AI-suggested filters match query intent',
    description: 'Query about "quiet vacuum" should suggest noise-level filter and quiet chip',
    input: { query: 'quiet vacuum for pet hair' },
    expectedBehavior: 'suggestedFilters includes noise_level; chips include "quiet"',
    assertionType: 'boolean',
  },
  {
    id: 'TC-036', category: 'intent', name: 'Filter chips reflect parsed intent',
    description: 'Query with "under $80" should auto-activate the price cap chip',
    input: { query: 'gift for dad under $80' },
    expectedBehavior: 'Under $80 chip is active in response',
    assertionType: 'boolean',
  },
  {
    id: 'TC-037', category: 'ranking', name: 'Filter change triggers instant re-rank',
    description: 'Adding brand filter changes ranking order immediately',
    input: { initialQuery: 'shoes', filterAdded: { attribute: 'brand', value: 'Nike' } },
    expectedBehavior: 'Re-ranked results differ from initial and prioritize Nike',
    assertionType: 'boolean',
  },

  // --- Behavior learning ---
  {
    id: 'TC-038', category: 'integration', name: 'Behavior event updates session memory',
    description: 'Clicking a product and dwelling 30s+ should update session preference signals',
    input: { event: { type: 'dwell', dwellTimeMs: 35000, productId: 'p1' } },
    expectedBehavior: 'Session signals include positive signal for p1 attributes',
    assertionType: 'boolean',
  },
  {
    id: 'TC-039', category: 'integration', name: 'Repeated behavior updates long-term memory',
    description: 'User clicking premium products across 3+ sessions should create inferred preference',
    input: { events: [{ type: 'click', priceSegment: 'premium', session: 1 }, { type: 'click', priceSegment: 'premium', session: 2 }, { type: 'click', priceSegment: 'premium', session: 3 }] },
    expectedBehavior: 'User memory includes inferred preference for premium price segment',
    assertionType: 'boolean',
  },
  {
    id: 'TC-040', category: 'integration', name: 'Stale preferences decay appropriately',
    description: 'A preference not reinforced for 90+ days should have decayed strength',
    input: { preference: { lastSeen: '90_days_ago', initialStrength: 0.8 } },
    expectedBehavior: 'Decayed strength < 0.5',
    assertionType: 'range',
  },
  {
    id: 'TC-041', category: 'ranking', name: 'Rejected products reduce similar product ranking',
    description: 'Dismissing a bulky product should slightly penalize other bulky products',
    input: { dismissed: { productId: 'p1', attributes: { style: 'bulky' } } },
    expectedBehavior: 'Other bulky products have lower ranking score than before dismissal',
    assertionType: 'boolean',
  },

  // --- Relational reasoning ---
  {
    id: 'TC-042', category: 'explanation', name: 'Related product reasoning is coherent',
    description: 'Substitute recommendation must share primary use case with original',
    input: { product: 'standing_shoe_1', substituteType: 'cheaper_alternative' },
    expectedBehavior: 'Substitute also serves standing use case; explanation mentions shared need',
    assertionType: 'boolean',
  },
  {
    id: 'TC-043', category: 'explanation', name: 'Tradeoff explanations are accurate',
    description: 'Upgrade path explanation must correctly state price delta and key improvements',
    input: { from: 'prod_basic', to: 'prod_premium' },
    expectedBehavior: 'priceDelta matches actual difference; improvements reference real attributes',
    assertionType: 'boolean',
  },
  {
    id: 'TC-044', category: 'explanation', name: 'Substitute recommendations are sensible',
    description: 'Cheaper alternative must actually be cheaper and serve the same use case',
    input: { relationship: 'cheaper_alternative' },
    expectedBehavior: 'target.price < source.price AND target.useCase overlaps source.useCase',
    assertionType: 'boolean',
  },

  // --- Reddit / Community feedback ---
  {
    id: 'TC-045', category: 'guardrail', name: 'Reddit feedback is clearly labeled',
    description: 'All Reddit-derived insights must include community source attribution',
    input: { redditInsight: { text: 'quiet vacuum' } },
    expectedBehavior: 'Insight display includes "community feedback" or "public discussions" label',
    assertionType: 'boolean',
  },
  {
    id: 'TC-046', category: 'guardrail', name: 'Reddit does not override product data',
    description: 'Catalog spec "65 dB" should take precedence over Reddit claim of "50 dB"',
    input: { catalogSpec: { noise: '65dB' }, redditClaim: '50dB' },
    expectedBehavior: 'Final explanation uses 65dB from catalog, not Reddit claim',
    assertionType: 'boolean',
  },
  {
    id: 'TC-047', category: 'data', name: 'Noisy Reddit posts are filtered out',
    description: 'Posts with score < 5 or sarcastic patterns should be excluded',
    input: { post: { score: 2, text: '/s obviously the best thing ever' } },
    expectedBehavior: 'Post is excluded from sentiment aggregation',
    assertionType: 'boolean',
  },
  {
    id: 'TC-048', category: 'ranking', name: 'Contradictory Reddit lowers confidence',
    description: 'When Reddit has 50% positive 50% negative on durability, confidence on that attribute drops',
    input: { sentiment: { positive: 12, negative: 11, theme: 'durability' } },
    expectedBehavior: 'contradictionLevel is "high"; attribute confidence < 0.5',
    assertionType: 'range',
  },

  // --- Memory ---
  {
    id: 'TC-049', category: 'integration', name: 'Memory can be disabled or cleared',
    description: 'User clearing memory should result in no memory being applied',
    input: { action: 'clear_all', userId: 'user_1' },
    expectedBehavior: 'Next query returns memoryApplied as empty array',
    assertionType: 'boolean',
  },
  {
    id: 'TC-050', category: 'integration', name: 'System works with no user history',
    description: 'Anonymous user with zero behavior history should still get quality recommendations',
    input: { userId: null, behaviorEvents: [] },
    expectedBehavior: 'Response includes bestPick with valid explanation and confidence > 0.3',
    assertionType: 'boolean',
  },

  // --- UX ---
  {
    id: 'TC-051', category: 'ux', name: 'Refinement experience stays fast',
    description: 'Applying a filter should return re-ranked results in < 500ms',
    input: { filter: { attribute: 'price', operator: 'lte', value: 100 } },
    expectedBehavior: 'Re-rank latency < 500ms',
    assertionType: 'range',
  },
  {
    id: 'TC-052', category: 'ux', name: 'Filter sidebar renders on desktop',
    description: 'On desktop viewport, filter sidebar is visible alongside results',
    input: { viewport: { width: 1280 } },
    expectedBehavior: 'Filter sidebar and results both visible without overlap',
    assertionType: 'visual',
  },
  {
    id: 'TC-053', category: 'accessibility', name: 'Filter controls are accessible',
    description: 'All filter checkboxes, sliders, and chips have proper labels and keyboard navigation',
    input: { page: '/search?q=shoes' },
    expectedBehavior: 'No WCAG 2.1 AA violations on filter controls',
    assertionType: 'boolean',
  },
];
