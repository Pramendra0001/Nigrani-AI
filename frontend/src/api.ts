import { DashboardData, Project, ProjectInvestigation, ReviewCaseItem } from './types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    let message = `API Error ${res.status}`;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.detail || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request<DashboardData>('/dashboard'),

  // Projects
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
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        sp.append(k, String(v));
      }
    });
    return request<{ projects: Project[]; total: number; page: number; page_size: number }>(`/projects?${sp.toString()}`);
  },

  getProjectFilters: () =>
    request<{
      states: string[];
      districts: string[];
      categories: string[];
      risk_levels: string[];
      statuses: string[];
    }>('/projects/filters'),

  getProjectInvestigation: (id: string) => request<ProjectInvestigation>(`/projects/${id}`),

  analyzeProject: (id: string) => request<any>(`/projects/${id}/analyze`, { method: 'POST' }),

  analyzeBatch: () => request<any>('/projects/analyze-batch', { method: 'POST' }),

  // Review Queue
  getReviewQueue: (params: { status?: string; priority?: string; page?: number; page_size?: number }) => {
    const sp = new URLSearchParams();
    if (params.status) sp.append('status', params.status);
    if (params.priority) sp.append('priority', params.priority);
    if (params.page) sp.append('page', String(params.page));
    if (params.page_size) sp.append('page_size', String(params.page_size));
    return request<{ cases: ReviewCaseItem[]; total: number; page: number; page_size: number }>(`/review-queue?${sp.toString()}`);
  },

  updateReviewCase: (caseId: string, data: { status?: string; priority?: string; assigned_to?: string }) =>
    request<any>(`/review-cases/${caseId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  addReviewNote: (caseId: string, data: { author: string; content: string; action_taken?: string }) =>
    request<any>(`/review-cases/${caseId}/notes`, { method: 'POST', body: JSON.stringify(data) }),

  // Upload & Import
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/data/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  commitImport: (importToken: string, columnMapping: Record<string, string>) =>
    request<any>('/data/import', {
      method: 'POST',
      body: JSON.stringify({ import_token: importToken, column_mapping: columnMapping }),
    }),

  // Analytics & Settings
  getAnalytics: () => request<any>('/analytics'),
  getRiskWeights: () => request<Record<string, number>>('/settings/risk-weights'),
  updateRiskWeights: (weights: Record<string, number>) =>
    request<any>('/settings/risk-weights', { method: 'PUT', body: JSON.stringify(weights) }),
  getSystemStatus: () => request<any>('/system/status'),
};
