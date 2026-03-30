export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: CategoryPath;
  description: string;
  shortDescription: string;
  price: Price;
  images: ProductImage[];
  attributes: ProductAttributes;
  merchantAttributes: Record<string, string | number | boolean>;
  specs: Record<string, string | number>;
  taxonomy: TaxonomyNode[];
  variants: ProductVariant[];
  availability: Availability;
  reviewSummary: ReviewSummary;
  returnStats: ReturnStats;
  embeddings?: ProductEmbeddings;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPath {
  l1: string;
  l2: string;
  l3?: string;
  l4?: string;
  breadcrumb: string[];
}

export interface Price {
  amount: number;
  currency: string;
  originalAmount?: number;
  discountPercent?: number;
  pricePerUnit?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  width?: number;
  height?: number;
}

export interface ProductAttributes {
  color?: string[];
  size?: string[];
  material?: string[];
  weight?: string;
  dimensions?: string;
  style?: string[];
  useCase?: string[];
  ageGroup?: string[];
  gender?: string;
  season?: string[];
  careInstructions?: string;
  certifications?: string[];
  [key: string]: string | string[] | number | boolean | undefined;
}

export interface TaxonomyNode {
  id: string;
  label: string;
  level: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: Price;
  availability: Availability;
}

export interface Availability {
  inStock: boolean;
  quantity?: number;
  backorderDate?: string;
  shippingEstimate?: string;
  fulfillmentType: 'shipped' | 'pickup' | 'digital' | 'both';
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  topPositiveThemes: ReviewTheme[];
  topNegativeThemes: ReviewTheme[];
  sentimentByAttribute: Record<string, AttributeSentiment>;
  verifiedPurchasePercent: number;
}

export interface ReviewTheme {
  theme: string;
  mentions: number;
  averageSentiment: number;
  exampleSnippets: string[];
}

export interface AttributeSentiment {
  attribute: string;
  positive: number;
  neutral: number;
  negative: number;
  snippets: string[];
}

export interface ReturnStats {
  returnRate: number;
  topReturnReasons: ReturnReason[];
  fitIssueRate: number;
  qualityIssueRate: number;
  expectationMismatchRate: number;
  averageDaysToReturn: number;
}

export interface ReturnReason {
  reason: string;
  percentage: number;
  category: 'fit' | 'quality' | 'expectation' | 'defect' | 'other';
}

export interface ProductEmbeddings {
  titleDescription: number[];
  reviewSentiment: number[];
  useCaseAttributes: number[];
  visualStyle?: number[];
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  attributes: Record<string, string>;
  pros?: string[];
  cons?: string[];
  images?: string[];
  createdAt: string;
}

export interface ReturnEvent {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  reason: string;
  reasonCategory: ReturnReason['category'];
  freeTextFeedback?: string;
  daysSincePurchase: number;
  refundAmount: number;
  createdAt: string;
}
