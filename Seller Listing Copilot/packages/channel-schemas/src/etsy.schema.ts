/** Etsy listing title limit. */
export const ETSY_TITLE_LIMIT = 140;

export const ETSY_DESCRIPTION_LIMIT = 50_000;
export const ETSY_MATERIALS_MAX = 13;
export const ETSY_MATERIAL_CHAR_LIMIT = 45;
export const ETSY_TAG_LIMIT = 13;
export const ETSY_TAG_CHAR_LIMIT = 20;
export const ETSY_MIN_IMAGES = 1;
export const ETSY_MAX_IMAGES = 10;

export const ETSY_BULLET_LIMITS = {
  min: 0,
  max: ETSY_TAG_LIMIT,
  maxCharsPerBullet: ETSY_TAG_CHAR_LIMIT,
} as const;

export const ETSY_IMAGE_LIMITS = {
  min: ETSY_MIN_IMAGES,
  max: ETSY_MAX_IMAGES,
} as const;

export const ETSY_REQUIRED_FIELDS = [
  'title',
  'description',
  'who_made',
  'when_made',
  'taxonomy_id',
  'materials',
  'price',
  'currency',
  'quantity',
  'shipping_profile_id',
] as const;

export const ETSY_PROHIBITED_TERMS = [
  'replica',
  'counterfeit',
  'designer inspired',
  'not authentic',
  'free shipping worldwide',
  'wholesale',
  'dropship',
  'no refunds',
] as const;

export type EtsyWhoMade = 'i_did' | 'someone_else' | 'collective';

export type EtsyWhenMade =
  | 'made_to_order'
  | '2020_2025'
  | '2010_2019'
  | '2006_2009'
  | 'before_2006';

export interface EtsyListingSchema {
  title: string;
  description: string;
  who_made: EtsyWhoMade;
  when_made: EtsyWhenMade;
  is_supply: boolean;
  taxonomy_id: number;
  materials: string[];
  tags: string[];
  price: string;
  currency: string;
  quantity: number;
  shipping_profile_id: number;
  processing_min: number | null;
  processing_max: number | null;
  image_urls: string[];
  sku: string | null;
  personalization_instructions: string | null;
}
