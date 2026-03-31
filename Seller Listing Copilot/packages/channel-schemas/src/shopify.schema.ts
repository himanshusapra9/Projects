/** Shopify product title limit. */
export const SHOPIFY_TITLE_LIMIT = 255;

export const SHOPIFY_BODY_HTML_LIMIT = 65_535;
export const SHOPIFY_TAG_CHAR_LIMIT = 255;
export const SHOPIFY_MAX_TAGS = 250;
export const SHOPIFY_MIN_IMAGES = 0;
export const SHOPIFY_MAX_IMAGES = 250;

/** Shopify does not use Amazon-style bullets; metafields / description sections approximate bullets. */
export const SHOPIFY_BULLET_LIMITS = {
  min: 0,
  max: 20,
  maxCharsPerBullet: 5000,
} as const;

export const SHOPIFY_IMAGE_LIMITS = {
  min: SHOPIFY_MIN_IMAGES,
  max: SHOPIFY_MAX_IMAGES,
} as const;

export const SHOPIFY_REQUIRED_FIELDS = [
  'title',
  'body_html',
  'vendor',
  'product_type',
  'status',
  'variants',
] as const;

export const SHOPIFY_PROHIBITED_TERMS = [
  'best seller',
  '#1',
  'guaranteed cure',
  'miracle',
  '100% effective',
  'fda approved',
  'prescription',
  'replica',
  'counterfeit',
] as const;

export type ShopifyProductStatus = 'active' | 'archived' | 'draft';

export interface ShopifyVariantSchema {
  sku: string | null;
  title: string;
  price: string;
  compare_at_price: string | null;
  inventory_quantity: number | null;
  barcode: string | null;
  option_values: Record<string, string>;
}

export interface ShopifyListingSchema {
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  collections: string[];
  status: ShopifyProductStatus;
  handle: string | null;
  seo_title: string | null;
  seo_description: string | null;
  images: { src: string; alt: string | null; position: number }[];
  variants: ShopifyVariantSchema[];
  metafields: { namespace: string; key: string; value: string; type: string }[];
}
