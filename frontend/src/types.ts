export interface Project {
  id: string;
  project_id: string;
  project_name: string;
  description?: string;
  state?: string;
  district?: string;
  category?: string;
  parliament_type?: 'Lok Sabha' | 'Rajya Sabha' | string;
  budget?: number;
  actual_cost?: number;
  start_date?: string;
  expected_end_date?: string;
  completion_percentage: number;
  status: string;
  latitude?: number;
  longitude?: number;
  risk_score?: number;
  risk_level?: string;
  created_at?: string;
}

export interface DashboardMetrics {
  total_projects: number;
  projects_requiring_review: number;
  high_risk_count: number;
  critical_risk_count: number;
  duplicate_cases: number;
  cost_anomalies: number;
  schedule_risks: number;
  data_quality_issues: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  risk_distribution: Record<string, number>;
  category_distribution: Array<{ category: string; count: number; avg_risk: number }>;
  state_distribution: Array<{ state: string; count: number; avg_risk: number }>;
  high_priority_projects: Project[];
}

export interface DuplicateCandidateItem {
  id: string;
  target_project_id: string;
  target_code: string;
  target_name: string;
  target_district?: string;
  target_budget?: number;
  description_similarity: number;
  category_similarity: number;
  geographic_distance_km?: number;
  timeline_overlap: number;
  budget_similarity: number;
  combined_score: number;
  classification: string;
  evidence: Record<string, any>;
}

export interface ProjectInvestigation {
  project: Project;
  analysis: {
    overall_risk_score: number;
    risk_level: string;
    cost_risk_score: number;
    duplicate_risk_score: number;
    delay_risk_score: number;
    data_quality_risk_score: number;
    ai_summary?: {
      executive_summary: string;
      project_context: string;
      key_findings: string[];
      priority_action: string;
      overall_score: number;
      risk_classification: string;
      disclaimer: string;
    };
    status: string;
  };
  cost_analysis: {
    project_cost: number;
    comparable_median?: number;
    comparable_mean?: number;
    comparable_std?: number;
    cost_deviation_percentage?: number;
    percentile_rank?: number;
    budget_deviation_percentage?: number;
    comparable_count: number;
    risk_score: number;
    evidence: Record<string, any>;
    ai_explanation: {
      narrative?: string;
      recommendations?: string[];
      confidence?: string;
    };
  };
  delay_analysis: {
    planned_duration_days?: number;
    elapsed_days?: number;
    time_elapsed_percentage?: number;
    completion_percentage: number;
    expected_completion?: number;
    schedule_deviation?: number;
    delay_classification: string;
    risk_score: number;
    evidence: Record<string, any>;
    ai_explanation: {
      narrative?: string;
      classification?: string;
      recommendations?: string[];
    };
  };
  data_quality_analysis: {
    issues: Array<{ field: string; issue: string; severity: string }>;
    total_issues: number;
    critical_issues: number;
    completeness_score: number;
    risk_score: number;
    evidence: Record<string, any>;
  };
  duplicate_analysis: {
    top_candidates: DuplicateCandidateItem[];
    candidates_count: number;
    highest_similarity_score: number;
    risk_score: number;
    ai_explanation: {
      narrative?: string;
      top_candidate?: string;
      classification?: string;
      recommendations?: string[];
    };
  };
    financial_lifecycle?: FinancialLifecycle;
    consistency_analysis?: ConsistencyAnalysis;
    payment_analysis?: PaymentAnalysis;
    fund_utilization_analysis?: FundUtilizationAnalysis;
    asset_verification?: AssetVerification;
    provenance?: ProvenanceMetadata;
    review_case?: {
    id: string;
    status: string;
    priority: string;
    assigned_to?: string;
    notes: Array<{
      id: string;
      author: string;
      content: string;
      action_taken?: string;
      created_at: string;
    }>;
  };
}

export interface FinancialLifecycle {
  allocation_amount?: number;
  recommended_amount?: number;
  sanctioned_amount?: number;
  estimated_cost?: number;
  contract_value?: number;
  fund_released?: number;
  cumulative_expenditure?: number;
  remaining_balance?: number;
  payment_total?: number;
  payment_count?: number;
  last_payment_date?: string | null;
  financial_completion_percentage?: number;
  closure_status?: string;
  expenditure_exceeds_sanction?: boolean;
  sanction_vs_estimate_variance?: number;
  released_vs_sanction_variance?: number;
  expenditure_vs_released_variance?: number;
  unspent_balance?: number;
  payment_vs_expenditure_variance?: number;
  variances?: {
    sanction_vs_estimate: number;
    estimate_vs_actual_cost: number;
    released_vs_expenditure: number;
    expenditure_vs_physical_progress: number;
    payment_vs_work_progress: number;
  };
  lifecycle_flow?: Array<{
    step: number;
    name: string;
    amount?: number | null;
    status: string;
  }>;
}

export interface ConsistencyAnalysis {
  physical_progress_percentage?: number;
  financial_utilization_percentage?: number;
  variance_percentage?: number;
  absolute_variance?: number;
  divergence_gap?: number;
  consistency_score: number;
  pattern_classification: string;
  patterns?: string[];
  severity?: string;
  narrative?: string;
  interpretation?: string;
  recommendations?: string[];
  status?: string;
}

export interface PaymentAnomalyItem {
  rule_id: string;
  rule_name: string;
  severity: string;
  risk_score: number;
  observed: string;
  expected: string;
  deviation: string;
  evidence: Record<string, any>;
  recommended_action: string;
}

export interface PaymentAnalysis {
  has_micro_payment_data: boolean;
  status: string;
  source_granularity: string;
  total_disbursed_lakhs: number;
  budget_lakhs: number;
  risk_score: number;
  severity: string;
  anomaly_count: number;
  anomalies: PaymentAnomalyItem[];
  synthetic_demo_available: boolean;
  disclosure: string;
}

export interface FundUtilizationAnalysis {
  allocation_amount?: number;
  sanctioned_amount?: number;
  fund_released?: number;
  expenditure?: number;
  unspent_balance?: number;
  utilization_percentage?: number;
  project_utilization_rate?: number;
  district_baseline_utilization?: number;
  state_baseline_utilization?: number;
  category_baseline_utilization?: number;
  national_baseline_utilization?: number;
  baselines?: {
    national: number;
    state: number;
    district: number;
  };
  deviations?: {
    national_deviation: number;
    state_deviation: number;
    district_deviation: number;
  };
  context_explanation?: {
    normal_condition: string;
    observed_condition: string;
    deviation_assessment: string;
    review_rationale: string;
  };
  structured_explanation?: {
    normal_pattern: string;
    observed_pattern: string;
    deviation_assessment: string;
    underlying_rationale: string;
  };
}

export interface AssetVerification {
  asset_expected: string;
  asset_type: string;
  asset_status: string;
  physical_completion: number;
  verification_status: string;
  latitude?: number | null;
  longitude?: number | null;
  verification_date?: string | null;
  verification_source: string;
  evidence_available: boolean;
  future_integrations: string[];
}

export interface ProvenanceMetadata {
  data_source: string;
  source_reference: string;
  source_url: string;
  ingestion_timestamp: string;
  last_updated: string;
  record_status: string;
  data_completeness_score: number;
  record_tier: string;
  tier_classification: string;
}

export interface ReviewCaseItem {
  id: string;
  project_id: string;
  project_code: string;
  project_name: string;
  category: string;
  state: string;
  district: string;
  budget: number;
  risk_score: number;
  risk_level: string;
  status: string;
  priority: string;
  assigned_to: string;
  notes_count: number;
  created_at?: string;
}

export const APP_CURRENT_YEAR = 2026;

export interface GeoStateData {
  state: string;
  project_count: number;
  total_budget: number;
  total_expenditure: number;
  avg_risk: number;
  high_risk_count: number;
  critical_risk_count: number;
  lat: number;
  lng: number;
}

export interface GeoSummary {
  total_states: number;
  states: GeoStateData[];
}

export interface ComplianceRuleItem {
  rule_code: string;
  name: string;
  category: 'FINANCIAL' | 'TIMELINE' | 'PHYSICAL' | 'DOCUMENTATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  clause: string;
  description: string;
}

export interface ComplianceSummary {
  total_portfolios_audited: number;
  compliance_rate_percent: number;
  rules: ComplianceRuleItem[];
  rule_violations: Record<string, number>;
}

export interface PredictiveSummary {
  total_portfolios_modeled: number;
  delay_probability: {
    high_probability: number;
    medium_probability: number;
    low_probability: number;
  };
  overrun_likelihood: {
    high_likelihood: number;
    moderate_likelihood: number;
    controlled_budget: number;
  };
  estimated_completion_quarters: Array<{
    quarter: string;
    projected_completed_portfolios: number;
    forecast_spend_cr: number;
  }>;
}

export interface EvidenceItem {
  id: string;
  project_id: string;
  project_name: string;
  stage: 'BEFORE_COMMENCEMENT' | 'DURING_EXECUTION' | 'COMPLETION_AUDIT' | 'SATELLITE_SURVEILLANCE' | 'DRONE_INSPECTION' | string;
  location: string;
  coordinates: string;
  timestamp: string;
  sha256: string;
  status: 'VERIFIED_GEOTAGGED' | 'ANOMALY_SUSPECTED' | 'MATCH_CONFIRMED' | string;
  finding: string;
}

export interface EvidenceSummary {
  total_evidence_records: number;
  verified_geotagged: number;
  discrepancies_flagged: number;
  drone_surveys_completed: number;
  samples: EvidenceItem[];
}


