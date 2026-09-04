export interface Project {
  id: string;
  project_id: string;
  project_name: string;
  description?: string;
  state?: string;
  district?: string;
  category?: string;
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

// -------------------------------------------------------------
// Authentication, Profile & Session Data Types
// -------------------------------------------------------------
export const APP_CURRENT_YEAR = 2026;

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'User' | 'Analyst' | 'Reviewer' | 'Administrator' | string;
  organization: string;
  designation: string;
  avatar_url?: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  user: UserProfile;
  access_token: string;
  session_token: string;
  verification?: {
    email_verified: boolean;
    phone_verified: boolean;
  };
  message?: string;
}

export interface UserSessionItem {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  is_current: boolean;
}

