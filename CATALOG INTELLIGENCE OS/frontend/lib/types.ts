export interface Product {
  id: string;
  title: string | null;
  brand: string | null;
  category_path: string[] | null;
  quality_score: number;
  status: string;
  attribute_count: number;
  pending_review_count: number;
  updated_at: string | null;
}

export interface ProductDetail {
  id: string;
  status: string;
  taxonomy_id: string | null;
  taxonomy_confidence: number | null;
  category_path: string[] | null;
  identity: Record<string, any>;
  quality_score: number;
  quality_dimensions: QualityDimensions;
  source_ids: string[];
  attributes: AttributeRecord[];
  review_task_counts: Record<string, number>;
  audit_logs: AuditLog[];
  created_at: string;
  updated_at: string | null;
}

export interface QualityDimensions {
  completeness: number;
  conformity: number;
  consistency: number;
  freshness: number;
  missing_required?: string[];
  issues?: string[];
}

export interface AttributeRecord {
  id: string;
  attribute_key: string;
  value: { raw?: string; canonical?: any; value?: any };
  confidence: number;
  extraction_type: string;
  evidence: Record<string, any>;
  is_approved: boolean;
  created_at: string;
}

export interface ReviewTask {
  id: string;
  task_type: string;
  product_id: string;
  attribute_key: string | null;
  suggested_value: Record<string, any>;
  current_value: Record<string, any> | null;
  confidence: number;
  extraction_type: string;
  evidence: Record<string, any>;
  status: string;
  priority: string;
  assigned_to: string | null;
  resolved_value: Record<string, any> | null;
  resolved_by: string | null;
  resolved_at: string | null;
  sla_deadline: string | null;
  created_at: string;
  product_title: string | null;
  product_brand: string | null;
  product_image_url: string | null;
  category_path: string[] | null;
}

export interface AuditLog {
  id: string;
  field_path: string;
  before_value: Record<string, any> | null;
  after_value: Record<string, any>;
  change_source: string;
  confidence: number | null;
  reviewed_by: string | null;
  review_action: string | null;
  review_note: string | null;
  created_at: string;
}

export interface TaxonomyNode {
  id: string;
  name: string;
  path: string[];
  depth: number;
  parent_id: string | null;
  product_count: number;
  attribute_schema: Record<string, string[]>;
  quality_threshold: number;
  is_active: boolean;
  created_at: string;
}

export interface CatalogHealth {
  overall_quality: number;
  total_products: number;
  by_status: { draft: number; in_review: number; published: number; archived: number };
  quality_distribution: { excellent: number; good: number; fair: number; poor: number };
  by_category: Array<{
    category_id: string;
    category_name: string;
    product_count: number;
    avg_quality: number;
    completeness: number;
    conformity: number;
  }>;
  top_issues: Array<{ issue_type: string; affected_products: number; description: string }>;
}

export interface ReviewQueueStats {
  total_pending: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  avg_age_hours: number;
  sla_at_risk: number;
  throughput_last_7d: number;
}
