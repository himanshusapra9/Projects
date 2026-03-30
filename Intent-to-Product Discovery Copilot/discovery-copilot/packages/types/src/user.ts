export interface UserProfile {
  id: string;
  anonymousId?: string;
  email?: string;
  name?: string;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  history: UserHistory;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  budgetSensitivity: 'low' | 'medium' | 'high';
  defaultBudgetRange?: { min: number; max: number };
  preferredBrands: BrandAffinity[];
  dislikedBrands: string[];
  stylePreferences: Record<string, string[]>;
  useCasePreferences: string[];
  sizeProfiles: SizeProfile[];
  skinType?: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  returnSensitivity: 'low' | 'medium' | 'high';
  sustainabilityPriority: boolean;
  qualityOverPrice: number;
}

export interface BrandAffinity {
  brand: string;
  score: number;
  source: 'explicit' | 'purchase' | 'browse' | 'review';
}

export interface SizeProfile {
  category: string;
  size: string;
  fit: 'tight' | 'true-to-size' | 'loose';
  notes?: string;
}

export interface UserHistory {
  totalSessions: number;
  totalPurchases: number;
  totalReturns: number;
  averageOrderValue: number;
  categoryAffinities: Record<string, number>;
  recentSearches: string[];
  recentlyViewed: string[];
  purchasedProductIds: string[];
  returnedProductIds: string[];
}
