export interface CustomerError {
  error_id: number;
  job_id: string;
  cif: string;
  raw_row: string;
  raw_row_data?: any;
  critical_errors: string[];
  warning_errors: string[];
  created_at: string;
  _expanded?: boolean;
  // Dashboard compatibility fields (using optional to avoid interface pollution)
  id?: number;
  errorCode?: string;
  errorMessage?: string;
  timestamp?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  totalErrors: number;
  totalBatches: number;
  recentErrors: CustomerError[];
  recentJobs: CustomerJob[];
}

export interface CustomerJob {
  id: string;
  fileName: string;
  status: string;
  errorCount: number;
  startTime: string;
  endTime?: string;
}
