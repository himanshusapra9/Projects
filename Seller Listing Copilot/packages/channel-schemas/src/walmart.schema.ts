/** Walmart Marketplace listing title limit (SKU / product name field). */
export const WALMART_TITLE_LIMIT = 200;

export const WALMART_SHORT_DESCRIPTION_LIMIT = 1000;
export const WALMART_LONG_DESCRIPTION_LIMIT = 4000;
export const WALMART_KEY_FEATURE_LIMIT = 10;
export const WALMART_KEY_FEATURE_CHAR_LIMIT = 250;
export const WALMART_MIN_IMAGES = 1;
export const WALMART_MAX_IMAGES = 24;

export const WALMART_BULLET_LIMITS = {
  min: 0,
  max: WALMART_KEY_FEATURE_LIMIT,
  maxCharsPerBullet: WALMART_KEY_FEATURE_CHAR_LIMIT,
} as const;

export const WALMART_IMAGE_LIMITS = {
  min: WALMART_MIN_IMAGES,
  max: WALMART_MAX_IMAGES,
} as const;

export const WALMART_REQUIRED_FIELDS = [
  'product_name',
  'brand',
  'main_image_url',
  'shelf_description',
  'long_description',
  'condition',
  'price',
  'currency',
  'product_id',
  'product_id_type',
  'shipping_weight',
  'fulfillment_type',
] as const;

export const WALMART_PROHIBITED_TERMS = [
  'best seller',
  '#1',
  'top rated',
  'free shipping',
  'guaranteed lowest',
  'limited time offer',
  'click here',
  'buy now only',
  'wholesale',
  'dropship',
] as const;

export type WalmartCondition = 'New' | 'Pre-Owned: Like New' | 'Pre-Owned: Good' | 'Pre-Owned: Fair';

export type WalmartProductIdType = 'GTIN' | 'UPC' | 'EAN' | 'ISBN';

export type WalmartFulfillmentType = 'WFS' | 'SELLER_FULFILLED';

export interface WalmartListingSchema {
  product_name: string;
  brand: string;
  main_image_url: string;
  additional_image_urls: string[];
  shelf_description: string;
  long_description: string;
  key_features: string[];
  condition: WalmartCondition;
  price: string;
  currency: string;
  product_id: string;
  product_id_type: WalmartProductIdType;
  shipping_weight: { value: number; unit: 'LB' | 'OZ' | 'KG' | 'G' };
  fulfillment_type: WalmartFulfillmentType;
  category_id: string;
  attributes: Record<string, string>;
}
