/** eBay listing title max length (fixed-price / most categories). */
export const EBAY_TITLE_LIMIT = 80;

export const EBAY_SUBTITLE_LIMIT = 55;
export const EBAY_DESCRIPTION_HTML_LIMIT = 500_000;
export const EBAY_MIN_IMAGES = 1;
export const EBAY_MAX_IMAGES = 24;

/** eBay item specifics act as structured bullets; typical max count varies by category. */
export const EBAY_BULLET_LIMITS = {
  min: 0,
  max: 45,
  maxCharsPerName: 65,
  maxCharsPerValue: 65,
} as const;

export const EBAY_IMAGE_LIMITS = {
  min: EBAY_MIN_IMAGES,
  max: EBAY_MAX_IMAGES,
} as const;

export const EBAY_REQUIRED_FIELDS = [
  'title',
  'description',
  'condition_id',
  'category_id',
  'listing_format',
  'currency',
  'quantity',
  'primary_image_url',
] as const;

export const EBAY_PROHIBITED_TERMS = [
  'best offer only',
  'no returns',
  'replica',
  'counterfeit',
  'not authentic',
  'as is no warranty',
  'contact me before bidding',
  'cash only',
  'wire transfer only',
] as const;

/**
 * eBay Trading API / Inventory condition IDs (representative; category-specific rules apply).
 * @see https://developer.ebay.com/devzone/xml/docs/Reference/ebay/types/ItemTypeCodeType.html
 */
export const EBAY_CONDITION_IDS = {
  NEW: '1000',
  NEW_OTHER: '1500',
  NEW_WITH_DEFECTS: '1750',
  MANUFACTURER_REFURBISHED: '2000',
  SELLER_REFURBISHED: '2500',
  LIKE_NEW: '3000',
  VERY_GOOD: '4000',
  GOOD: '5000',
  ACCEPTABLE: '6000',
  FOR_PARTS_OR_NOT_WORKING: '7000',
} as const;

export type EbayConditionId = (typeof EBAY_CONDITION_IDS)[keyof typeof EBAY_CONDITION_IDS];

export interface EbayListingSchema {
  title: string;
  subtitle: string | null;
  description_html: string;
  condition_id: EbayConditionId;
  condition_description: string | null;
  category_id: string;
  listing_format: 'FIXED_PRICE' | 'AUCTION';
  currency: string;
  quantity: number;
  primary_image_url: string;
  additional_image_urls: string[];
  item_specifics: Record<string, string>;
  return_policy_id: string | null;
  shipping_profile_id: string | null;
  location_country: string;
  location_postal_code: string | null;
}
