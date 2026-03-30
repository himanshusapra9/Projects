export interface EvalEntry {
  id: string;
  query: string;
  category: string;
  expectedClarification: boolean;
  expectedClarificationAttribute?: string;
  idealProductAttributes: Record<string, string>;
  idealBadges: string[];
  explanationMustContain: string[];
  explanationMustNotContain: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const EVALUATION_DATASET: EvalEntry[] = [
  {
    id: 'eval-001', query: 'comfortable shoes for standing all day', category: 'shoes',
    expectedClarification: false, idealProductAttributes: { useCase: 'standing', comfort: 'high' },
    idealBadges: ['great_for_usecase', 'low_return_risk'],
    explanationMustContain: ['comfort', 'standing', 'support'],
    explanationMustNotContain: ['cure', 'medical'], difficulty: 'medium',
  },
  {
    id: 'eval-002', query: 'gift for a minimalist dad under $80', category: 'gifts',
    expectedClarification: true, expectedClarificationAttribute: 'interests',
    idealProductAttributes: { style: 'minimalist', recipient: 'male_adult' },
    idealBadges: ['budget_friendly'],
    explanationMustContain: ['minimalist', 'gift'],
    explanationMustNotContain: [], difficulty: 'hard',
  },
  {
    id: 'eval-003', query: 'quiet vacuum for pet hair', category: 'home',
    expectedClarification: false, idealProductAttributes: { noiseLevel: 'quiet', feature: 'pet_hair' },
    idealBadges: ['quiet', 'great_for_usecase'],
    explanationMustContain: ['quiet', 'pet', 'noise', 'dB'],
    explanationMustNotContain: [], difficulty: 'medium',
  },
  {
    id: 'eval-004', query: 'sofa for small apartment, easy to clean', category: 'furniture',
    expectedClarification: true, expectedClarificationAttribute: 'seating_capacity',
    idealProductAttributes: { size: 'compact', material: 'stain_resistant' },
    idealBadges: ['easy_to_clean'],
    explanationMustContain: ['small', 'clean', 'apartment'],
    explanationMustNotContain: [], difficulty: 'hard',
  },
  {
    id: 'eval-005', query: 'natural looking foundation for oily skin', category: 'beauty',
    expectedClarification: true, expectedClarificationAttribute: 'shade',
    idealProductAttributes: { finish: 'natural', skinType: 'oily' },
    idealBadges: ['great_for_usecase'],
    explanationMustContain: ['oily', 'natural', 'skin'],
    explanationMustNotContain: ['cure', 'treat'], difficulty: 'medium',
  },
  {
    id: 'eval-006', query: 'carry-on luggage for frequent work travel', category: 'travel',
    expectedClarification: false, idealProductAttributes: { type: 'carry_on', useCase: 'business_travel' },
    idealBadges: ['good_for_travel'],
    explanationMustContain: ['carry-on', 'airline', 'travel'],
    explanationMustNotContain: [], difficulty: 'easy',
  },
  {
    id: 'eval-007', query: 'blender for smoothies not too loud', category: 'kitchen',
    expectedClarification: false, idealProductAttributes: { useCase: 'smoothies', noiseLevel: 'quiet' },
    idealBadges: ['quiet'],
    explanationMustContain: ['smoothie', 'noise', 'quiet'],
    explanationMustNotContain: [], difficulty: 'easy',
  },
  {
    id: 'eval-008', query: 'thoughtful baby gift for first-time parents', category: 'baby',
    expectedClarification: true, expectedClarificationAttribute: 'budget',
    idealProductAttributes: { recipient: 'baby', occasion: 'birth' },
    idealBadges: [],
    explanationMustContain: ['baby', 'parents', 'gift'],
    explanationMustNotContain: ['medical', 'treat'], difficulty: 'hard',
  },
  {
    id: 'eval-009', query: 'wedding guest outfit outdoor summer', category: 'apparel',
    expectedClarification: true, expectedClarificationAttribute: 'dress_code',
    idealProductAttributes: { occasion: 'wedding', season: 'summer' },
    idealBadges: [],
    explanationMustContain: ['summer', 'outdoor', 'wedding'],
    explanationMustNotContain: [], difficulty: 'hard',
  },
  {
    id: 'eval-010', query: 'ergonomic desk chair for long work days', category: 'office',
    expectedClarification: false, idealProductAttributes: { useCase: 'office', feature: 'ergonomic' },
    idealBadges: ['great_for_usecase'],
    explanationMustContain: ['ergonomic', 'lumbar', 'support'],
    explanationMustNotContain: [], difficulty: 'medium',
  },
  {
    id: 'eval-011', query: 'easy to clean dining table for family', category: 'furniture',
    expectedClarification: true, expectedClarificationAttribute: 'size',
    idealProductAttributes: { feature: 'easy_clean', useCase: 'family_dining' },
    idealBadges: ['easy_to_clean'],
    explanationMustContain: ['clean', 'family'],
    explanationMustNotContain: [], difficulty: 'medium',
  },
  {
    id: 'eval-012', query: 'coffee maker for small kitchen', category: 'kitchen',
    expectedClarification: false, idealProductAttributes: { size: 'compact', useCase: 'small_kitchen' },
    idealBadges: ['lightweight'],
    explanationMustContain: ['compact', 'small', 'kitchen'],
    explanationMustNotContain: [], difficulty: 'easy',
  },
];
