export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_url?: string | null;
  status: ApplicationStatus;
  salary_min?: number | null;
  salary_max?: number | null;
  applied_at?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  application_id: string;
  old_status?: string | null;
  new_status: string;
  changed_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  application_id: string;
  title: string;
  scheduled_at: string;
  completed: boolean;
  created_at: string;
  company_name?: string | null;
  job_title?: string | null;
}

export interface ApplicationDetail extends Application {
  status_history: StatusHistory[];
  reminders: Reminder[];
}

export interface DashboardSummary {
  total_applications: number;
  active_applications: number;
  interviews_count: number;
  offers_count: number;
  interview_rate: number;
  offer_rate: number;
  by_status: Record<string, number>;
  upcoming_reminders: Reminder[];
}

export interface ApplicationCreateInput {
  company_name: string;
  job_title: string;
  job_url?: string | null;
  status: ApplicationStatus;
  salary_min?: number | null;
  salary_max?: number | null;
  applied_at?: string | null;
  notes?: string | null;
}

export interface ApplicationUpdateInput {
  company_name?: string;
  job_title?: string;
  job_url?: string | null;
  status?: ApplicationStatus;
  salary_min?: number | null;
  salary_max?: number | null;
  applied_at?: string | null;
  notes?: string | null;
}
