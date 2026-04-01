export const SAMPLE_PRODUCTS = [
  {
    id: "p-001",
    title: "7-in-1 USB-C Hub — HDMI 4K, 100W PD, SD/TF",
    brand: "Anker",
    category_path: ["Electronics", "Computers", "Peripherals", "USB Hubs"],
    quality_score: 0.94,
    status: "published",
    attribute_count: 11,
    pending_review_count: 0,
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "p-002",
    title: "Classic Polo Shirt — Piqué Cotton, Slim Fit",
    brand: "Ralph Lauren",
    category_path: ["Apparel", "Mens", "Tops", "Polo Shirts"],
    quality_score: 0.78,
    status: "in_review",
    attribute_count: 7,
    pending_review_count: 3,
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "p-003",
    title: "Wireless Noise-Cancelling Headphones",
    brand: "Sony",
    category_path: ["Electronics", "Audio", "Headphones"],
    quality_score: 0.61,
    status: "in_review",
    attribute_count: 5,
    pending_review_count: 5,
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "p-004",
    title: "Barista Pro Espresso Machine",
    brand: "Breville",
    category_path: ["Home", "Kitchen Appliances", "Coffee & Espresso"],
    quality_score: 0.88,
    status: "published",
    attribute_count: 9,
    pending_review_count: 1,
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "p-005",
    title: 'Floral Wrap Dress 32"',
    brand: "Zara",
    category_path: ["Apparel", "Womens", "Dresses"],
    quality_score: 0.42,
    status: "draft",
    attribute_count: 3,
    pending_review_count: 7,
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "p-006",
    title: "18V Cordless Drill — 2-Speed, 50Nm",
    brand: "DeWalt",
    category_path: ["Tools", "Power Tools", "Drills"],
    quality_score: 0.83,
    status: "published",
    attribute_count: 8,
    pending_review_count: 0,
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const SAMPLE_PRODUCT_DETAIL: Record<string, {
  id: string
  status: string
  taxonomy_id: string
  taxonomy_confidence: number
  category_path: string[]
  identity: Record<string, string>
  quality_score: number
  quality_dimensions: {
    completeness: number
    conformity: number
    consistency: number
    freshness: number
    missing_required: string[]
    issues: string[]
  }
  source_ids: string[]
  attributes: Array<{
    id: string
    attribute_key: string
    value: Record<string, string>
    confidence: number
    extraction_type: string
    evidence: Record<string, string>
    is_approved: boolean
    created_at: string
  }>
  review_task_counts: Record<string, number>
  audit_logs: Array<{
    id: string
    field_path: string
    before_value: Record<string, string> | null
    after_value: Record<string, string>
    change_source: string
    confidence: number
    reviewed_by: string | null
    review_action: string
    review_note: string | null
    created_at: string
  }>
  created_at: string
  updated_at: string
}> = {
  "p-001": {
    id: "p-001",
    status: "published",
    taxonomy_id: "tax-electronics-hubs",
    taxonomy_confidence: 0.97,
    category_path: ["Electronics", "Computers", "Peripherals", "USB Hubs"],
    identity: { title: "7-in-1 USB-C Hub — HDMI 4K, 100W PD, SD/TF", brand: "Anker", sku: "HD-USB-C-HUB-7N1" },
    quality_score: 0.94,
    quality_dimensions: {
      completeness: 0.97,
      conformity: 0.95,
      consistency: 0.92,
      freshness: 0.91,
      missing_required: [],
      issues: [],
    },
    source_ids: ["src-acme-001"],
    attributes: [
      { id: "a-001", attribute_key: "ports", value: { canonical: "7" }, confidence: 0.99, extraction_type: "extracted", evidence: { pattern: "7-in-1", field: "title" }, is_approved: true, created_at: new Date().toISOString() },
      { id: "a-002", attribute_key: "power_delivery_watts", value: { canonical: "100", raw: "100W PD" }, confidence: 0.99, extraction_type: "extracted", evidence: { pattern: "100W", field: "title" }, is_approved: true, created_at: new Date().toISOString() },
      { id: "a-003", attribute_key: "hdmi_resolution", value: { canonical: "4K" }, confidence: 0.98, extraction_type: "extracted", evidence: { pattern: "HDMI 4K", field: "title" }, is_approved: true, created_at: new Date().toISOString() },
      { id: "a-004", attribute_key: "material", value: { canonical: "Aluminum" }, confidence: 0.88, extraction_type: "llm_generated", evidence: { source: "LLM inference from product description" }, is_approved: true, created_at: new Date().toISOString() },
      { id: "a-005", attribute_key: "color", value: { canonical: "Silver" }, confidence: 0.91, extraction_type: "normalized", evidence: { dictionary_match: "silver" }, is_approved: true, created_at: new Date().toISOString() },
    ],
    review_task_counts: { taxonomy_suggestion: 0, attribute_suggestion: 0, conflict_resolution: 0, duplicate_review: 0, quality_alert: 0 },
    audit_logs: [
      { id: "al-001", field_path: "attributes.ports", before_value: null, after_value: { canonical: "7" }, change_source: "ai_pipeline", confidence: 0.99, reviewed_by: null, review_action: "auto_approved", review_note: null, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "al-002", field_path: "taxonomy", before_value: null, after_value: { category: "USB Hubs" }, change_source: "ai_pipeline", confidence: 0.97, reviewed_by: null, review_action: "auto_approved", review_note: null, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
}

export const SAMPLE_REVIEW_TASKS = [
  {
    id: "rt-001",
    task_type: "attribute_suggestion",
    product_id: "p-003",
    attribute_key: "noise_cancellation",
    suggested_value: { canonical: "Active" },
    current_value: null,
    confidence: 0.82,
    extraction_type: "llm_generated",
    evidence: { source: "LLM from title: 'Wireless Noise-Cancelling Headphones'" },
    status: "pending",
    priority: "high",
    assigned_to: null,
    resolved_value: null,
    resolved_by: null,
    resolved_at: null,
    sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    product_title: "Wireless Noise-Cancelling Headphones",
    product_brand: "Sony",
    product_image_url: null,
    category_path: ["Electronics", "Audio", "Headphones"],
  },
  {
    id: "rt-002",
    task_type: "taxonomy_suggestion",
    product_id: "p-002",
    attribute_key: null,
    suggested_value: { category: "Polo Shirts", confidence: 0.74 },
    current_value: { category: "Tops" },
    confidence: 0.74,
    extraction_type: "extracted",
    evidence: { keywords: ["polo", "piqué", "collar"] },
    status: "pending",
    priority: "medium",
    assigned_to: null,
    resolved_value: null,
    resolved_by: null,
    resolved_at: null,
    sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    product_title: "Classic Polo Shirt — Piqué Cotton, Slim Fit",
    product_brand: "Ralph Lauren",
    product_image_url: null,
    category_path: ["Apparel", "Mens", "Tops"],
  },
  {
    id: "rt-003",
    task_type: "quality_alert",
    product_id: "p-005",
    attribute_key: null,
    suggested_value: { alert: "Missing 4 required attributes: color, size, material, fit" },
    current_value: null,
    confidence: 1.0,
    extraction_type: "extracted",
    evidence: { missing_fields: ["color", "size", "material", "fit"] },
    status: "pending",
    priority: "high",
    assigned_to: null,
    resolved_value: null,
    resolved_by: null,
    resolved_at: null,
    sla_deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    product_title: 'Floral Wrap Dress 32"',
    product_brand: "Zara",
    product_image_url: null,
    category_path: ["Apparel", "Womens", "Dresses"],
  },
]

export const SAMPLE_CATALOG_HEALTH = {
  overall_quality: 0.75,
  total_products: 6,
  by_status: { draft: 1, in_review: 2, published: 3, archived: 0 },
  quality_distribution: { excellent: 2, good: 2, fair: 1, poor: 1 },
  by_category: [
    { category_id: "cat-electronics", category_name: "Electronics", product_count: 2, avg_quality: 0.775, completeness: 0.82, conformity: 0.79 },
    { category_id: "cat-apparel", category_name: "Apparel", product_count: 2, avg_quality: 0.60, completeness: 0.55, conformity: 0.62 },
    { category_id: "cat-home", category_name: "Home", product_count: 1, avg_quality: 0.88, completeness: 0.91, conformity: 0.90 },
    { category_id: "cat-tools", category_name: "Tools", product_count: 1, avg_quality: 0.83, completeness: 0.87, conformity: 0.86 },
  ],
  top_issues: [
    { issue_type: "missing_attributes", affected_products: 3, description: "Missing required attributes (color, size, material)" },
    { issue_type: "taxonomy_uncertainty", affected_products: 2, description: "Taxonomy classification below auto-approve threshold" },
    { issue_type: "low_freshness", affected_products: 1, description: "Product data older than 7 days" },
  ],
}

export const SAMPLE_REVIEW_QUEUE_STATS = {
  total_pending: 3,
  by_type: { attribute_suggestion: 1, taxonomy_suggestion: 1, quality_alert: 1, conflict_resolution: 0, duplicate_review: 0 },
  by_priority: { high: 2, medium: 1, low: 0 },
  avg_age_hours: 3,
  sla_at_risk: 2,
  throughput_last_7d: 14,
}

export const SAMPLE_TAXONOMY = [
  { id: "tax-apparel", name: "Apparel", path: ["Apparel"], depth: 0, parent_id: null, product_count: 2, attribute_schema: { required: ["color", "size", "material", "gender"], recommended: ["fit", "care_instructions"], optional: ["sleeve_length", "collar_type"] }, quality_threshold: 0.80, is_active: true, created_at: new Date().toISOString() },
  { id: "tax-electronics", name: "Electronics", path: ["Electronics"], depth: 0, parent_id: null, product_count: 2, attribute_schema: { required: ["brand", "connectivity", "warranty"], recommended: ["material", "weight", "color"], optional: ["power_consumption"] }, quality_threshold: 0.85, is_active: true, created_at: new Date().toISOString() },
  { id: "tax-home", name: "Home", path: ["Home"], depth: 0, parent_id: null, product_count: 1, attribute_schema: { required: ["material", "dimensions", "color"], recommended: ["weight", "warranty"], optional: ["care_instructions"] }, quality_threshold: 0.75, is_active: true, created_at: new Date().toISOString() },
  { id: "tax-tools", name: "Tools", path: ["Tools"], depth: 0, parent_id: null, product_count: 1, attribute_schema: { required: ["voltage", "wattage", "weight"], recommended: ["material", "warranty"], optional: [] }, quality_threshold: 0.80, is_active: true, created_at: new Date().toISOString() },
]

export const SAMPLE_SUPPLIER_QUALITY = [
  { supplier_id: "sup-001", supplier_name: "Acme Apparel", avg_quality: 0.60, product_count: 2, trust_scores: { color: 0.71, size: 0.65, material: 0.58, brand: 0.92 }, last_feed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { supplier_id: "sup-002", supplier_name: "TechWorld Distribution", avg_quality: 0.77, product_count: 2, trust_scores: { connectivity: 0.88, weight: 0.79, color: 0.82, warranty: 0.55 }, last_feed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { supplier_id: "sup-003", supplier_name: "HomeGoods Company", avg_quality: 0.85, product_count: 2, trust_scores: { material: 0.90, dimensions: 0.88, color: 0.85, warranty: 0.78 }, last_feed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
]

export const SAMPLE_ATTRIBUTE_COVERAGE = [
  { category: "Electronics", color: 0.90, material: 0.70, weight: 0.75, connectivity: 0.85, warranty: 0.55 },
  { category: "Apparel", color: 0.60, material: 0.55, size: 0.70, fit: 0.40, care_instructions: 0.30 },
  { category: "Home", color: 0.85, material: 0.90, dimensions: 0.80, weight: 0.65, warranty: 0.50 },
  { category: "Tools", voltage: 0.95, wattage: 0.90, weight: 0.88, material: 0.60, warranty: 0.40 },
]
