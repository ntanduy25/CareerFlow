import type {
  AuthResponse,
  User,
  Application,
  ApplicationDetail,
  StatusHistory,
  DashboardSummary,
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ApplicationStatus,
  Reminder,
  ResumeAnalysisResult,
} from '../types';

const API_BASE = '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('careerflow_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('careerflow_token');
      localStorage.removeItem('careerflow_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.detail ||
        (Array.isArray(errorData.detail)
          ? errorData.detail.map((d: { msg: string }) => d.msg).join(', ')
          : null) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth Endpoints
  async register(data: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Applications Endpoints
  async getApplications(params?: { status?: string; search?: string }): Promise<Application[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<Application[]>(`/applications${query}`);
  }

  async getApplication(id: string): Promise<ApplicationDetail> {
    return this.request<ApplicationDetail>(`/applications/${id}`);
  }

  async createApplication(data: ApplicationCreateInput): Promise<Application> {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplication(id: string, data: ApplicationUpdateInput): Promise<Application> {
    return this.request<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application> {
    return this.request<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteApplication(id: string): Promise<void> {
    return this.request<void>(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  async getApplicationHistory(id: string): Promise<StatusHistory[]> {
    return this.request<StatusHistory[]>(`/applications/${id}/history`);
  }

  // Reminders Endpoints
  async getReminders(): Promise<Reminder[]> {
    return this.request<Reminder[]>('/reminders');
  }

  async createReminder(data: { application_id: string; title: string; scheduled_at: string }): Promise<Reminder> {
    return this.request<Reminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReminder(id: string, data: { completed?: boolean; title?: string; scheduled_at?: string }): Promise<Reminder> {
    return this.request<Reminder>(`/reminders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteReminder(id: string): Promise<void> {
    return this.request<void>(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard Endpoints
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/dashboard/summary');
  }

  // AI Resume Analyzer Endpoints
  async analyzeResume(cvFile: File, jobDescription: string): Promise<ResumeAnalysisResult> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('cv_file', cvFile);
    formData.append('job_description', jobDescription);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/ai/analyze-resume`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể phân tích CV.');
    }

    return response.json();
  }
}

export const api = new ApiClient();
