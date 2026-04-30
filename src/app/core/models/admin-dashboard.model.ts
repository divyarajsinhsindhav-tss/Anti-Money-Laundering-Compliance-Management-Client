export interface AdminDashboardStats {
  totalTenants: number;
  totalActiveScenarios: number;
  totalDbStorage: string;
  totalJobs: number;
  runningJobs: number;
  pendingJobs: number;
  failedJobs: number;
  completedJobs: number;
  recentJobs: RecentJob[];
}

export interface RecentJob {
  jobId: string;
  tenantName: string;
  tenantCode: string;
  jobType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}
