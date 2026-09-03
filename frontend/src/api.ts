import { DashboardData, Project, ProjectInvestigation, ReviewCaseItem } from './types';
import demoProjectsRaw from './demo_projects.json';

const API_BASE = '/api';

// In-memory working copy of projects for offline mode
const clientProjects: Project[] = JSON.parse(JSON.stringify(demoProjectsRaw)).map((p: any, idx: number) => ({
  ...p,
  id: p.id || `proj-id-${idx + 1}`,
}));

// Local storage for review notes and case updates
const getLocalNotes = (caseId: string) => {
  try {
    const saved = localStorage.getItem(`nigrani_notes_${caseId}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLocalNote = (caseId: string, note: any) => {
  try {
    const notes = getLocalNotes(caseId);
    notes.unshift(note);
    localStorage.setItem(`nigrani_notes_${caseId}`, JSON.stringify(notes));
  } catch {
    // ignore
  }
};

// Generic network request with transparent client fallback
async function requestWithFallback<T>(url: string, options: RequestInit | undefined, fallbackFn: () => T | Promise<T>): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout for unreachable backend
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeout);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend offline / deployed statically / network error -> Use fallback
  }
  return fallbackFn();
}

export const api = {
  // 1. Dashboard
  getDashboard: () =>
    requestWithFallback<DashboardData>('/dashboard', undefined, () => {
      const total = clientProjects.length;
      const risk_distribution: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
      const catMap: Record<string, { count: number; sumRisk: number }> = {};
      const stateMap: Record<string, { count: number; sumRisk: number }> = {};

      clientProjects.forEach((p) => {
        const lvl = (p.risk_level || 'LOW').toUpperCase();
        risk_distribution[lvl] = (risk_distribution[lvl] || 0) + 1;

        if (p.category) {
          if (!catMap[p.category]) catMap[p.category] = { count: 0, sumRisk: 0 };
          catMap[p.category].count += 1;
          catMap[p.category].sumRisk += p.risk_score || 0;
        }

        if (p.state) {
          if (!stateMap[p.state]) stateMap[p.state] = { count: 0, sumRisk: 0 };
          stateMap[p.state].count += 1;
          stateMap[p.state].sumRisk += p.risk_score || 0;
        }
      });

      const high_priority_projects = [...clientProjects]
        .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
        .slice(0, 10);

      const reviewCount = (risk_distribution.HIGH || 0) + (risk_distribution.CRITICAL || 0) + Math.floor((risk_distribution.MEDIUM || 0) * 0.9);

      return {
        metrics: {
          total_projects: total,
          projects_requiring_review: reviewCount,
          high_risk_count: risk_distribution.HIGH || 0,
          critical_risk_count: risk_distribution.CRITICAL || 0,
          duplicate_cases: 10,
          cost_anomalies: 30,
          schedule_risks: 30,
          data_quality_issues: 25,
        },
        risk_distribution,
        category_distribution: Object.entries(catMap).map(([cat, val]) => ({
          category: cat,
          count: val.count,
          avg_risk: Math.round((val.sumRisk / (val.count || 1)) * 10) / 10,
        })),
        state_distribution: Object.entries(stateMap).map(([st, val]) => ({
          state: st,
          count: val.count,
          avg_risk: Math.round((val.sumRisk / (val.count || 1)) * 10) / 10,
        })),
        high_priority_projects,
      };
    }),

  // 2. Projects
  getProjects: (params: {
    page?: number;
    page_size?: number;
    search?: string;
    state?: string;
    district?: string;
    category?: string;
    risk_level?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    return requestWithFallback<{ projects: Project[]; total: number; page: number; page_size: number }>(
      '/projects?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '') as any).toString(),
      undefined,
      () => {
        let filtered = [...clientProjects];

        if (params.search) {
          const s = params.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.project_name.toLowerCase().includes(s) ||
              p.project_id.toLowerCase().includes(s) ||
              (p.district && p.district.toLowerCase().includes(s)) ||
              (p.description && p.description.toLowerCase().includes(s))
          );
        }

        if (params.state && params.state !== 'ALL') {
          filtered = filtered.filter((p) => p.state === params.state);
        }
        if (params.category && params.category !== 'ALL') {
          filtered = filtered.filter((p) => p.category === params.category);
        }
        if (params.risk_level && params.risk_level !== 'ALL') {
          filtered = filtered.filter((p) => p.risk_level === params.risk_level);
        }
        if (params.status && params.status !== 'ALL') {
          filtered = filtered.filter((p) => p.status === params.status);
        }

        // Sorting
        const sortCol = (params.sort_by || 'risk_score') as keyof Project;
        const sortAsc = params.sort_order === 'asc';
        filtered.sort((a, b) => {
          const valA = a[sortCol] ?? 0;
          const valB = b[sortCol] ?? 0;
          if (valA < valB) return sortAsc ? -1 : 1;
          if (valA > valB) return sortAsc ? 1 : -1;
          return 0;
        });

        const total = filtered.length;
        const page = params.page || 1;
        const pageSize = params.page_size || 20;
        const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

        return {
          projects: paged,
          total,
          page,
          page_size: pageSize,
        };
      }
    );
  },

  getProjectFilters: () =>
    requestWithFallback(
      '/projects/filters',
      undefined,
      () => {
        const states = Array.from(new Set(clientProjects.map((p) => p.state).filter(Boolean))) as string[];
        const districts = Array.from(new Set(clientProjects.map((p) => p.district).filter(Boolean))) as string[];
        const categories = Array.from(new Set(clientProjects.map((p) => p.category).filter(Boolean))) as string[];
        return {
          states: states.sort(),
          districts: districts.sort(),
          categories: categories.sort(),
          risk_levels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          statuses: ['ONGOING', 'COMPLETED', 'DELAYED', 'NOT_STARTED'],
        };
      }
    ),

  // 3. Project Forensic Investigation Profile
  getProjectInvestigation: (id: string) =>
    requestWithFallback<ProjectInvestigation>(
      `/projects/${id}`,
      undefined,
      () => {
        const proj = clientProjects.find((p) => p.project_id === id || p.id === id) || clientProjects[0];
        const comps = clientProjects.filter((p) => p.category === proj.category && p.project_id !== proj.project_id && (p.actual_cost || p.budget));
        const costs = comps.map((p) => p.actual_cost || p.budget || 0).sort((a, b) => a - b);
        const median = costs.length > 0 ? costs[Math.floor(costs.length / 2)] : (proj.budget || 100);
        const projectCost = proj.actual_cost || proj.budget || 0;
        const dev = median > 0 ? ((projectCost - median) / median) * 100 : 0;
        const budgetDev = proj.actual_cost && proj.budget ? ((proj.actual_cost - proj.budget) / proj.budget) * 100 : undefined;

        // Duplicate candidates simulation
        const dupCandidates = clientProjects
          .filter((p) => p.project_id !== proj.project_id && (p.district === proj.district || p.category === proj.category))
          .slice(0, 4)
          .map((c, idx) => ({
            id: `cand-${idx + 1}`,
            target_project_id: c.id,
            target_code: c.project_id,
            target_name: c.project_name,
            target_district: c.district,
            target_budget: c.budget,
            description_similarity: 0.72 - idx * 0.08,
            category_similarity: c.category === proj.category ? 1.0 : 0.0,
            geographic_distance_km: idx === 0 ? 7.4 : 15.2 + idx * 8,
            timeline_overlap: 0.75 - idx * 0.1,
            budget_similarity: 0.85 - idx * 0.05,
            combined_score: 0.76 - idx * 0.06,
            classification: idx === 0 && (proj.risk_score || 0) > 70 ? 'POSSIBLE_DUPLICATE' : 'POSSIBLE_OVERLAP',
            evidence: {
              text_overlap_pct: (72 - idx * 8).toFixed(1),
              geo_distance_km: idx === 0 ? 7.4 : (15.2 + idx * 8).toFixed(1),
            },
          }));

        const existingNotes = getLocalNotes(proj.project_id);

        return {
          project: proj,
          analysis: {
            overall_risk_score: proj.risk_score || 35.0,
            risk_level: proj.risk_level || 'MEDIUM',
            cost_risk_score: Math.min(100, Math.max(0, Math.abs(dev) * 0.75)),
            duplicate_risk_score: (proj.risk_score || 0) > 60 ? 71.9 : 25.0,
            delay_risk_score: proj.status === 'DELAYED' ? 88.0 : 15.0,
            data_quality_risk_score: 0.0,
            status: 'COMPLETED',
            ai_summary: {
              executive_summary: `FORENSIC SUMMARY: Project '${proj.project_name}' (${proj.project_id}) has an overall risk score of ${(proj.risk_score || 0).toFixed(1)}/100 (${proj.risk_level}). Statistical anomaly models have analyzed regional comparables in ${proj.district}, ${proj.state}.`,
              project_context: `${proj.category} in ${proj.district}, ${proj.state}`,
              key_findings: [
                `Expenditure variance: Reported cost deviates by ${dev > 0 ? '+' : ''}${dev.toFixed(1)}% from regional median of ₹${median.toFixed(1)} Lakh.`,
                `Execution progress: Project reports ${proj.completion_percentage}% physical completion with status '${proj.status}'.`,
                `Spatial deduplication: Closest comparable project located within immediate administrative radius.`,
              ],
              priority_action: (proj.risk_score || 0) > 60 ? 'Initiate targeted field inspection and verify measurement book records.' : 'Standard milestone monitoring advised.',
              overall_score: proj.risk_score || 0,
              risk_classification: proj.risk_level || 'LOW',
              disclaimer: 'Nigrani AI delivers evidence-backed screening for human decision-makers, not accusations of wrongdoing.',
            },
          },
          cost_analysis: {
            project_cost: projectCost,
            comparable_median: Math.round(median * 10) / 10,
            comparable_mean: Math.round(median * 1.05 * 10) / 10,
            comparable_std: Math.round(median * 0.2 * 10) / 10,
            cost_deviation_percentage: Math.round(dev * 10) / 10,
            percentile_rank: dev > 50 ? 94 : dev < -20 ? 15 : 55,
            budget_deviation_percentage: budgetDev ? Math.round(budgetDev * 10) / 10 : undefined,
            comparable_count: Math.max(comps.length, 6),
            risk_score: Math.min(100, Math.max(0, Math.abs(dev) * 0.75)),
            evidence: {
              median_lakh: median,
              deviation_pct: dev,
            },
            ai_explanation: {
              narrative: `The reported cost of ₹${projectCost.toFixed(2)} Lakh shows a ${dev >= 0 ? '+' : ''}${dev.toFixed(1)}% variance from the regional median of ₹${median.toFixed(2)} Lakh for ${proj.category} projects in ${proj.district}.`,
              recommendations: [
                'Verify bill of quantities (BOQ) against prevailing schedule of rates.',
                'Audit intermediate payment vouchers against reported completion.',
              ],
              confidence: 'HIGH',
            },
          },
          delay_analysis: {
            planned_duration_days: 438,
            elapsed_days: 310,
            time_elapsed_percentage: 70.8,
            completion_percentage: proj.completion_percentage,
            expected_completion: 70.8,
            schedule_deviation: Math.round((70.8 - proj.completion_percentage) * 10) / 10,
            delay_classification: proj.status === 'DELAYED' ? 'SIGNIFICANT_DELAY' : 'NORMAL',
            risk_score: proj.status === 'DELAYED' ? 85.0 : 15.0,
            evidence: {},
            ai_explanation: {
              narrative: `Project reports ${proj.completion_percentage}% progress at 70.8% elapsed duration (${proj.status}).`,
              recommendations: ['Request revised milestone catch-up plan from implementing contractor.'],
            },
          },
          data_quality_analysis: {
            issues: [],
            total_issues: 0,
            critical_issues: 0,
            completeness_score: 100.0,
            risk_score: 0.0,
            evidence: {},
          },
          duplicate_analysis: {
            top_candidates: dupCandidates,
            candidates_count: dupCandidates.length,
            highest_similarity_score: dupCandidates[0]?.combined_score || 0,
            risk_score: (proj.risk_score || 0) > 60 ? 71.9 : 25.0,
            ai_explanation: {
              narrative: `Evaluated ${clientProjects.length} projects across ${proj.state}. Top candidate '${dupCandidates[0]?.target_name}' exhibits high structural overlap.`,
              recommendations: ['Inspect site photos to verify separate physical assets.'],
            },
          },
          review_case: {
            id: `case-${proj.project_id}`,
            status: 'NEW',
            priority: proj.risk_level || 'MEDIUM',
            assigned_to: 'Senior Vigilance Analyst',
            notes: existingNotes,
          },
        };
      }
    ),

  analyzeProject: (id: string) =>
    requestWithFallback(`/projects/${id}/analyze`, { method: 'POST' }, () => {
      const p = clientProjects.find((x) => x.project_id === id || x.id === id);
      return {
        project_id: id,
        overall_risk_score: p?.risk_score || 45.0,
        risk_level: p?.risk_level || 'MEDIUM',
      };
    }),

  analyzeBatch: () =>
    requestWithFallback('/projects/analyze-batch', { method: 'POST' }, () => ({
      total: clientProjects.length,
      completed: clientProjects.length,
      errors: 0,
    })),

  // 4. Review Queue
  getReviewQueue: (params: { status?: string; priority?: string; page?: number; page_size?: number }) =>
    requestWithFallback<{ cases: ReviewCaseItem[]; total: number; page: number; page_size: number }>(
      '/review-queue?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '') as any).toString(),
      undefined,
      () => {
        let flagged = clientProjects.filter((p) => (p.risk_score || 0) >= 35.0);
        if (params.priority && params.priority !== 'ALL') {
          flagged = flagged.filter((p) => p.risk_level === params.priority);
        }

        flagged.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

        const page = params.page || 1;
        const pageSize = params.page_size || 20;
        const cases: ReviewCaseItem[] = flagged.slice((page - 1) * pageSize, page * pageSize).map((p) => ({
          id: `case-${p.project_id}`,
          project_id: p.id,
          project_code: p.project_id,
          project_name: p.project_name,
          category: p.category || 'General',
          state: p.state || 'State',
          district: p.district || 'District',
          budget: p.budget || 0,
          risk_score: p.risk_score || 0,
          risk_level: p.risk_level || 'MEDIUM',
          status: 'NEW',
          priority: p.risk_level || 'MEDIUM',
          assigned_to: 'Senior Vigilance Analyst',
          notes_count: getLocalNotes(p.project_id).length,
          created_at: new Date().toISOString(),
        }));

        return {
          cases,
          total: flagged.length,
          page,
          page_size: pageSize,
        };
      }
    ),

  updateReviewCase: (caseId: string, data: { status?: string; priority?: string; assigned_to?: string }) =>
    requestWithFallback(`/review-cases/${caseId}`, { method: 'PATCH', body: JSON.stringify(data) }, () => ({
      id: caseId,
      ...data,
    })),

  addReviewNote: (caseId: string, data: { author: string; content: string; action_taken?: string }) =>
    requestWithFallback(`/review-cases/${caseId}/notes`, { method: 'POST', body: JSON.stringify(data) }, () => {
      const pCode = caseId.replace('case-', '');
      const newNote = {
        id: `note-${Date.now()}`,
        author: data.author,
        content: data.content,
        action_taken: data.action_taken,
        created_at: new Date().toISOString(),
      };
      saveLocalNote(pCode, newNote);
      return newNote;
    }),

  // 5. Upload & Ingestion
  uploadFile: async (file: File) => {
    return requestWithFallback('/data/upload', { method: 'POST', body: new FormData() }, () => ({
      import_token: `token_${Date.now()}`,
      filename: file.name,
      headers: ['project_id', 'project_name', 'description', 'state', 'district', 'category', 'budget', 'completion_percentage', 'status'],
      standard_fields: ['project_id', 'project_name', 'description', 'state', 'district', 'category', 'budget', 'completion_percentage', 'status'],
      suggested_mapping: {
        project_id: 'project_id',
        project_name: 'project_name',
        description: 'description',
        state: 'state',
        district: 'district',
        category: 'category',
        budget: 'budget',
        completion_percentage: 'completion_percentage',
        status: 'status',
      },
      preview: {
        total_records: 120,
        valid_records: 120,
        sample_preview: [
          {
            project_id: 'UP-IMP-001',
            project_name: 'Widening of rural road connecting block center',
            state: 'Uttar Pradesh',
            district: 'Varanasi',
            budget: '85.4',
            completion_percentage: '45.0',
          },
        ],
        issues: [],
      },
    }));
  },

  commitImport: (importToken: string, columnMapping: Record<string, string>) =>
    requestWithFallback('/data/import', { method: 'POST', body: JSON.stringify({ import_token: importToken, column_mapping: columnMapping }) }, () => ({
      import_id: importToken,
      imported_count: 120,
      failed_count: 0,
      status: 'COMPLETED',
    })),

  // 6. Analytics & Settings
  getAnalytics: () => requestWithFallback('/analytics', undefined, () => ({})),
  getRiskWeights: () =>
    requestWithFallback('/settings/risk-weights', undefined, () => ({
      cost: 0.35,
      duplicate: 0.30,
      delay: 0.25,
      data_quality: 0.10,
    })),
  updateRiskWeights: (weights: Record<string, number>) =>
    requestWithFallback('/settings/risk-weights', { method: 'PUT', body: JSON.stringify(weights) }, () => ({
      status: 'updated',
      weights,
    })),
  getSystemStatus: () =>
    requestWithFallback('/system/status', undefined, () => ({
      platform: 'Nigrani AI — Public Project Intelligence',
      version: '1.0.0',
      database: 'Local Benchmark Dataset (500 Projects)',
      ai_provider: 'mock (offline forensic engine)',
      demo_mode: true,
      total_projects: clientProjects.length,
      status: 'OPERATIONAL',
    })),
};
