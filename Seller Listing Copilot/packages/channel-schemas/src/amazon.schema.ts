export const AMAZON_TITLE_LIMIT = 200;
export const AMAZON_BULLET_LIMIT = 5;
export const AMAZON_BULLET_CHAR_LIMIT = 500;
export const AMAZON_DESCRIPTION_LIMIT = 2000;
export const AMAZON_MIN_IMAGES = 1;
export const AMAZON_MAX_IMAGES = 9;

export const AMAZON_BULLET_LIMITS = {
  min: 0,
  max: AMAZON_BULLET_LIMIT,
  maxCharsPerBullet: AMAZON_BULLET_CHAR_LIMIT,
} as const;

export const AMAZON_IMAGE_LIMITS = {
  min: AMAZON_MIN_IMAGES,
  max: AMAZON_MAX_IMAGES,
} as const;

export const AMAZON_REQUIRED_FIELDS = [
  'title',
  'brand',
  'manufacturer',
  'product_type',
  'item_type_keyword',
  'bullet_point_1',
  'description',
  'main_image_url',
  'condition_type',
] as const;

export const AMAZON_PROHIBITED_TERMS = [
  'best seller',
  'top rated',
  '#1',
  'guaranteed',
  'free shipping',
  'limited time',
  'act now',
  'discount',
  'sale',
  'cheap',
] as const;

export interface AmazonListingSchema {
  title: string;
  brand: string;
  manufacturer: string;
  product_type: string;
  item_type_keyword: string;
  bullet_points: string[];
  description: string;
  main_image_url: string;
  other_image_urls: string[];
  condition_type: 'New' | 'Refurbished' | 'Used';
  upc: string;
  item_specifics: Record<string, string>;
  keywords: string[];
  category_path: string;
}
