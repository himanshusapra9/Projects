/**
 * Per-category configuration: fit dimensions, risk factors, clarification flows,
 * filter attributes, and evidence weights. Drives scoring + UX flexibility by vertical.
 */

export type SupportedCategory =
  | 'apparel'
  | 'footwear'
  | 'furniture'
  | 'beauty'
  | 'travel_gear'
  | 'home_goods'
  | 'accessories'
  | 'electronics';

export interface FitDimensionDef {
  key: string;
  label: string;
  /** Relative importance within category (sums need not be 1; normalized downstream). */
  defaultWeight: number;
  /** Keys that typically supply signal for this dimension. */
  measurementKeys: string[];
}

export interface RiskFactorDef {
  code: string;
  label: string;
  /** Typical share of return mass when present. */
  priorWeight: number;
  preventable: boolean;
}

export interface ClarificationTemplate {
  id: string;
  text: string;
  /** Feature keys this question informs. */
  mapsTo: string[];
  triggerWhen: 'sparse_measurements' | 'high_epistemic' | 'width_unknown' | 'always_optional';
}

export interface FilterAttributeDef {
  key: string;
  label: string;
  type: 'range' | 'enum' | 'boolean';
  /** Used in search/compare refinement chips. */
  facetGroup?: string;
}

export interface EvidenceWeights {
  merchantChart: number;
  reviewConsensus: number;
  communitySignals: number;
  userMemory: number;
  modelPrior: number;
}

export interface CategoryConfig {
  id: SupportedCategory;
  displayName: string;
  fitDimensions: FitDimensionDef[];
  riskFactors: RiskFactorDef[];
  clarificationQuestions: ClarificationTemplate[];
  filterAttributes: FilterAttributeDef[];
  evidenceWeights: EvidenceWeights;
}

const evidenceBalanced = (): EvidenceWeights => ({
  merchantChart: 0.35,
  reviewConsensus: 0.25,
  communitySignals: 0.15,
  userMemory: 0.15,
  modelPrior: 0.1,
});

export const CATEGORY_CONFIG: Record<SupportedCategory, CategoryConfig> = {
  apparel: {
    id: 'apparel',
    displayName: 'Apparel',
    fitDimensions: [
      {
        key: 'chest_fit',
        label: 'Chest / bust',
        defaultWeight: 0.28,
        measurementKeys: ['chest_in', 'chest_cm', 'bust_cm'],
      },
      {
        key: 'waist_fit',
        label: 'Waist',
        defaultWeight: 0.22,
        measurementKeys: ['waist_in', 'waist_cm'],
      },
      {
        key: 'length_fit',
        label: 'Length / inseam',
        defaultWeight: 0.2,
        measurementKeys: ['inseam_in', 'height_cm', 'torso_length'],
      },
      {
        key: 'stretch_alignment',
        label: 'Stretch & recovery',
        defaultWeight: 0.15,
        measurementKeys: ['fabric_stretch_index'],
      },
      {
        key: 'silhouette_intent',
        label: 'Fit intent (slim/regular/relaxed)',
        defaultWeight: 0.15,
        measurementKeys: ['fit_intent', 'fit_looseness'],
      },
    ],
    riskFactors: [
      { code: 'SIZE_TOO_SMALL', label: 'Too small overall', priorWeight: 0.22, preventable: true },
      { code: 'SIZE_TOO_LARGE', label: 'Too large overall', priorWeight: 0.2, preventable: true },
      { code: 'LENGTH_MISMATCH', label: 'Sleeve / hem length', priorWeight: 0.14, preventable: true },
      { code: 'COMFORT_FIT', label: 'Comfort / hand-feel', priorWeight: 0.12, preventable: true },
      { code: 'COLOR_NOT_AS_EXPECTED', label: 'Color vs expectation', priorWeight: 0.1, preventable: true },
      { code: 'CHANGED_MIND', label: 'Preference change', priorWeight: 0.12, preventable: false },
    ],
    clarificationQuestions: [
      {
        id: 'apparel_fit_intent',
        text: 'Do you prefer a slimmer cut or more room in this category?',
        mapsTo: ['silhouette_intent', 'fit_looseness'],
        triggerWhen: 'sparse_measurements',
      },
      {
        id: 'apparel_layering',
        text: 'Will you wear a base layer or jacket underneath regularly?',
        mapsTo: ['chest_fit', 'length_fit'],
        triggerWhen: 'high_epistemic',
      },
    ],
    filterAttributes: [
      { key: 'fit_family', label: 'Fit family', type: 'enum', facetGroup: 'fit' },
      { key: 'fabric_weight', label: 'Fabric weight', type: 'enum', facetGroup: 'material' },
      { key: 'stretch_level', label: 'Stretch', type: 'enum', facetGroup: 'material' },
      { key: 'maxReturnRisk', label: 'Max return risk', type: 'range', facetGroup: 'risk' },
    ],
    evidenceWeights: evidenceBalanced(),
  },

  footwear: {
    id: 'footwear',
    displayName: 'Footwear',
    fitDimensions: [
      {
        key: 'length_fit',
        label: 'Foot length',
        defaultWeight: 0.32,
        measurementKeys: ['foot_length_cm', 'foot_length_in', 'brannock_us', 'us_size'],
      },
      {
        key: 'width_fit',
        label: 'Width / volume',
        defaultWeight: 0.28,
        measurementKeys: ['foot_width', 'width_code'],
      },
      {
        key: 'arch_alignment',
        label: 'Arch & support',
        defaultWeight: 0.18,
        measurementKeys: ['arch_type', 'pronation'],
      },
      {
        key: 'use_case_match',
        label: 'Use case (daily, trail, dress)',
        defaultWeight: 0.22,
        measurementKeys: ['stated_use_case', 'standing_hours'],
      },
    ],
    riskFactors: [
      { code: 'SIZE_TOO_SMALL', label: 'Length too short', priorWeight: 0.18, preventable: true },
      { code: 'SIZE_TOO_LARGE', label: 'Length too long', priorWeight: 0.16, preventable: true },
      { code: 'WIDTH_MISMATCH', label: 'Width / toe box', priorWeight: 0.22, preventable: true },
      { code: 'COMFORT_FIT', label: 'Break-in / comfort', priorWeight: 0.14, preventable: true },
      { code: 'PERFORMANCE_MISMATCH', label: 'Activity mismatch', priorWeight: 0.12, preventable: true },
      { code: 'CHANGED_MIND', label: 'Style preference', priorWeight: 0.1, preventable: false },
    ],
    clarificationQuestions: [
      {
        id: 'footwear_width',
        text: 'What width do you usually wear for this brand or category?',
        mapsTo: ['width_fit', 'width_code'],
        triggerWhen: 'width_unknown',
      },
      {
        id: 'footwear_half_size',
        text: 'Are you often between half sizes?',
        mapsTo: ['length_fit'],
        triggerWhen: 'high_epistemic',
      },
    ],
    filterAttributes: [
      { key: 'width_profile', label: 'Width', type: 'enum', facetGroup: 'fit' },
      { key: 'drop_mm', label: 'Heel drop', type: 'range', facetGroup: 'performance' },
      { key: 'maxReturnRisk', label: 'Max return risk', type: 'range', facetGroup: 'risk' },
    ],
    evidenceWeights: {
      ...evidenceBalanced(),
      merchantChart: 0.4,
      reviewConsensus: 0.22,
    },
  },

  furniture: {
    id: 'furniture',
    displayName: 'Furniture',
    fitDimensions: [
      {
        key: 'spatial_clearance',
        label: 'Room dimensions & clearance',
        defaultWeight: 0.38,
        measurementKeys: ['room_width_cm', 'room_depth_cm', 'doorway_min_cm'],
      },
      {
        key: 'firmness_match',
        label: 'Firmness preference',
        defaultWeight: 0.22,
        measurementKeys: ['firmness_pref', 'sleep_position'],
      },
      {
        key: 'modularity_fit',
        label: 'Assembly / modular constraints',
        defaultWeight: 0.2,
        measurementKeys: ['ceiling_height_cm', 'stairwell_width'],
      },
      {
        key: 'lifestyle_alignment',
        label: 'Kids / pets / usage intensity',
        defaultWeight: 0.2,
        measurementKeys: ['pet_flag', 'kid_traffic'],
      },
    ],
    riskFactors: [
      { code: 'DIMENSION_MISMATCH', label: 'Does not fit space', priorWeight: 0.28, preventable: true },
      { code: 'COMFORT_FIT', label: 'Comfort / ergonomics', priorWeight: 0.18, preventable: true },
      { code: 'COLOR_NOT_AS_EXPECTED', label: 'Finish vs photos', priorWeight: 0.12, preventable: true },
      { code: 'QUALITY_DEFECT', label: 'Damage / defect', priorWeight: 0.14, preventable: false },
      { code: 'CHANGED_MIND', label: 'Style / budget', priorWeight: 0.18, preventable: false },
    ],
    clarificationQuestions: [
      {
        id: 'furniture_clearance',
        text: 'What is the narrowest doorway or stairwell this must pass through?',
        mapsTo: ['spatial_clearance'],
        triggerWhen: 'sparse_measurements',
      },
    ],
    filterAttributes: [
      { key: 'max_width_cm', label: 'Max width', type: 'range', facetGroup: 'dimensions' },
      { key: 'fabric_family', label: 'Upholstery', type: 'enum', facetGroup: 'material' },
      { key: 'maxReturnRisk', label: 'Max return risk', type: 'range', facetGroup: 'risk' },
    ],
    evidenceWeights: {
      merchantChart: 0.45,
      reviewConsensus: 0.2,
      communitySignals: 0.1,
      userMemory: 0.15,
      modelPrior: 0.1,
    },
  },

  beauty: {
    id: 'beauty',
    displayName: 'Beauty & skincare',
    fitDimensions: [
      {
        key: 'skin_concern_match',
        label: 'Concern alignment (acne, aging, barrier)',
        defaultWeight: 0.35,
        measurementKeys: ['skin_type', 'concerns'],
      },
      {
        key: 'active_tolerance',
        label: 'Actives tolerance (retinoids, acids)',
        defaultWeight: 0.28,
        measurementKeys: ['retinoid_use', 'acid_frequency'],
      },
      {
        key: 'fragrance_alignment',
        label: 'Fragrance sensitivity',
        defaultWeight: 0.12,
        measurementKeys: ['fragrance_free_required'],
      },
      {
        key: 'shade_texture_fit',
        label: 'Shade / texture expectation',
        defaultWeight: 0.25,
        measurementKeys: ['shade_depth', 'finish_pref'],
      },
    ],
    riskFactors: [
      { code: 'SENSITIVITY_REACTION', label: 'Irritation / reaction', priorWeight: 0.26, preventable: true },
      { code: 'SHADE_MISMATCH', label: 'Shade / undertone', priorWeight: 0.18, preventable: true },
      { code: 'TEXTURE_MISMATCH', label: 'Texture / finish', priorWeight: 0.14, preventable: true },
      { code: 'PERFORMANCE_MISMATCH', label: 'Efficacy vs claims', priorWeight: 0.16, preventable: false },
      { code: 'CHANGED_MIND', label: 'Preference', priorWeight: 0.14, preventable: false },
    ],
    clarificationQuestions: [
      {
        id: 'beauty_sensitivity',
        text: 'Do you have any known allergies or sensitivities we should route around?',
        mapsTo: ['active_tolerance', 'fragrance_alignment'],
        triggerWhen: 'sparse_measurements',
      },
    ],
    filterAttributes: [
      { key: 'skin_type', label: 'Skin type', type: 'enum', facetGroup: 'skin' },
      { key: 'free_from', label: 'Free from', type: 'enum', facetGroup: 'formula' },
      { key: 'maxReturnRisk', label: 'Max return risk', type: 'range', facetGroup: 'risk' },
    ],
    evidenceWeights: {
      merchantChart: 0.25,
      reviewConsensus: 0.3,
      communitySignals: 0.2,
      userMemory: 0.15,
      modelPrior: 0.1,
    },
  },

  travel_gear: {
    id: 'travel_gear',
    displayName: 'Travel gear',
    fitDimensions: [
      {
        key: 'bin_constraint',
        label: 'Carry-on / bin fit',
        defaultWeight: 0.34,
        measurementKeys: ['linear_cm', 'airline', 'bin_class'],
      },
      {
        key: 'weight_burden',
        label: 'Packed weight',
        defaultWeight: 0.22,
        measurementKeys: ['max_carry_kg', 'back_health_flag'],
      },
      {
        key: 'feature_match',
        label: 'Organization / laptop slot / expansion',
        defaultWeight: 0.24,
        measurementKeys: ['laptop_in', 'expansion_needed'],
      },
      {
        key: 'durability_expectation',
        label: 'Durability vs trip intensity',
        defaultWeight: 0.2,
        measurementKeys: ['trip_type', 'weather_exposure'],
      },
    ],
    riskFactors: [
      { code: 'DIMENSION_MISMATCH', label: 'Does not fit overhead / underseat', priorWeight: 0.24, preventable: true },
      { code: 'PERFORMANCE_MISMATCH', label: 'Features vs trip', priorWeight: 0.18, preventable: true },
      { code: 'COMFORT_FIT', label: 'Straps / carry comfort', priorWeight: 0.14, preventable: true },
      { code: 'COLOR_NOT_AS_EXPECTED', label: 'Color / material', priorWeight: 0.1, preventable: true },
      { code: 'CHANGED_MIND', label: 'Trip cancelled / change of plans', priorWeight: 0.2, preventable: false },
    ],
    clarificationQuestions: [
      {
        id: 'travel_airline',
        text: 'Which airline or regional bin rules matter most for this trip?',
        mapsTo: ['bin_constraint'],
        triggerWhen: 'sparse_measurements',
      },
    ],
    filterAttributes: [
      { key: 'linear_in', label: 'Linear inches', type: 'range', facetGroup: 'dimensions' },
      { key: 'weight_kg', label: 'Weight', type: 'range', facetGroup: 'carry' },
      { key: 'maxReturnRisk', label: 'Max return risk', type: 'range', facetGroup: 'risk' },
    ],
    evidenceWeights: evidenceBalanced(),
  },

  home_goods: {
    id: 'home_goods',
    displayName: 'Home goods',
    fitDimensions: [
      {
        key: 'spatial_clearance',
        label: 'Counter / shelf / window fit',
        defaultWeight: 0.35,
        measurementKeys: ['shelf_depth_cm', 'window_width_cm'],
      },
      {
        key: 'floor_type_match',
        label: 'Floor type compatibility',
        defaultWeight: 0.2,
        measurementKeys: ['floor_hardwood', 'rug_pad_needed'],
      },
      {
        key: 'pet_hair_lift',
        label: 'Pet / allergen handling',
        defaultWeight: 0.18,
        measurementKeys: ['pet_flag', 'hepa_pref'],
      },
      {
        key: 'noise_tolerance',
        label: 'Noise / motor tolerance',
        defaultWeight: 0.15,
        measurementKeys: ['noise_db_max'],
      },
      {
        key: 'aesthetic_match',
        label: 'Style / palette',
        defaultWeight: 0.12,
        measurementKeys: ['style_tags'],
      },
    ],
    riskFactors: [
      { code: 'DIMENSION_MISMATCH', label: 'Does not fit intended space', priorWeight: 0.22, preventable: true },
      { code: 'PERFORMANCE_MISMATCH', label: 'Performance vs claims', priorWeight: 0.18, preventable: true },
      { code: 'COLOR_NOT_AS_EXPECTED', label: 'Finish / color', priorWeight: 0.14, preventable: true },
      { code: 'QUALITY_DEFECT', label: 'Defect', priorWeight: 0.16, preventable: false },
      { code: 'CHANGED_MIND', label: 'Preference', priorWeight: 0.2, preventable: false },
    ],
    clarificationQuestions: [
      {
        id: 'home_space',
        text: 'What are the maximum dimensions of the space this will occupy?',
        mapsTo: ['spatial_clearance'],
        triggerWhen: 'sparse_measurements',
      },
    ],
    filterAttributes: [
      { key: 'max_depth_cm', label: 'Max depth', type: 'range', facetGroup: 'dimensions' },
      { key: 'maxReturnRisk', label: 'Max return risk', type: 'range', facetGroup: 'risk' },
    ],
    evidenceWeights: evidenceBalanced(),
  },

  accessories: {
    id: 'accessories',
    displayName: 'Accessories',
    fitDimensions: [
      {
        key: 'circumference_fit',
        label: 'Wrist / finger / head circumference',
        defaultWeight: 0.35,
        measurementKeys: ['wrist_cm', 'ring_size_us', 'hat_cm'],
      },
      {
        key: 'strap_length',
        label: 'Strap / drop length',
        defaultWeight: 0.25,
        measurementKeys: ['strap_drop_cm', 'torso_height'],
      },
      {
        key: 'style_match',
        label: 'Style / occasion',
        defaultWeight: 0.22,
        measurementKeys: ['occasion', 'metal_tone'],
      },
      {
        key: 'comfort_skin',
        label: 'Skin contact materials',
        defaultWeight: 0.18,
        measurementKeys: ['nickel_free_required'],
      },
    ],
    riskFactors: [
      { code: 'SIZE_TOO_SMALL', label: 'Too small', priorWeight: 0.2, preventable: true },
      { code: 'SIZE_TOO_LARGE', label: 'Too large', priorWeight: 0.18, preventable: true },
      { code: 'COLOR_NOT_AS_EXPECTED', label: 'Finish vs expectation', priorWeight: 0.16, preventable: true },
      { code: 'COMFORT_FIT', label: 'Wear comfort', priorWeight: 0.14, preventable: true },
      { code: 'CHANGED_MIND', label: 'Taste change', priorWeight: 0.2, preventable: false },
    ],
    clarificationQuestions: [
      {
        id: 'accessory_measurement',
        text: 'Do you have a recent measurement for sizing (wrist, finger, or head)?',
        mapsTo: ['circumference_fit'],
        triggerWhen: 'sparse_measurements',
      },
    ],
    filterAttributes: [
      { key: 'size_band', label: 'Size', type: 'enum', facetGroup: 'fit' },
      { key: 'maxReturnRisk', label: 'Max return risk', type: 'range', facetGroup: 'risk' },
    ],
    evidenceWeights: evidenceBalanced(),
  },

  electronics: {
    id: 'electronics',
    displayName: 'Electronics',
    fitDimensions: [
      {
        key: 'compatibility_fit',
        label: 'Port / ecosystem compatibility',
        defaultWeight: 0.38,
        measurementKeys: ['os_family', 'connector_type', 'power_w'],
      },
      {
        key: 'spatial_clearance',
        label: 'Desk / rack / TV stand fit',
        defaultWeight: 0.22,
        measurementKeys: ['desk_depth_cm', 'vesa_mm'],
      },
      {
        key: 'performance_need',
        label: 'Workload vs specs',
        defaultWeight: 0.25,
        measurementKeys: ['gpu_tier_need', 'ram_gb_need'],
      },
      {
        key: 'comfort_ergo',
        label: 'Ergonomics (wearables, audio)',
        defaultWeight: 0.15,
        measurementKeys: ['ear_shape', 'glasses_friendly'],
      },
    ],
    riskFactors: [
      { code: 'COMPATIBILITY_MISMATCH', label: 'Does not work with setup', priorWeight: 0.28, preventable: true },
      { code: 'PERFORMANCE_MISMATCH', label: 'Specs vs expectation', priorWeight: 0.2, preventable: true },
      { code: 'QUALITY_DEFECT', label: 'DOA / defect', priorWeight: 0.18, preventable: false },
      { code: 'CHANGED_MIND', label: 'Preference / upgrade path', priorWeight: 0.2, preventable: false },
    ],
    clarificationQuestions: [
      {
        id: 'electronics_setup',
        text: 'What device or ecosystem should this plug into?',
        mapsTo: ['compatibility_fit'],
        triggerWhen: 'sparse_measurements',
      },
    ],
    filterAttributes: [
      { key: 'connector', label: 'Connector', type: 'enum', facetGroup: 'io' },
      { key: 'maxReturnRisk', label: 'Max return risk', type: 'range', facetGroup: 'risk' },
    ],
    evidenceWeights: {
      merchantChart: 0.35,
      reviewConsensus: 0.28,
      communitySignals: 0.12,
      userMemory: 0.1,
      modelPrior: 0.15,
    },
  },
};

export const ALL_CATEGORIES: SupportedCategory[] = Object.keys(CATEGORY_CONFIG) as SupportedCategory[];

export function getCategoryConfig(id: SupportedCategory): CategoryConfig {
  return CATEGORY_CONFIG[id];
}
