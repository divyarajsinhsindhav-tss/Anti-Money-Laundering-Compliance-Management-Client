import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TenantService } from '@core/services/tenant.service';
import { Scenario } from '@core/models/scenario.model';
import { ApiResponse } from '@core/models/auth.model';
import { AmlJobService, AmlJobRequest } from '@core/services/aml-job.service';
import { RecentJob } from '@core/models/admin-dashboard.model';

@Component({
  selector: 'app-rule-engine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rule-engine.component.html',
  styleUrl: './rule-engine.component.css',
})
export class RuleEngineComponent implements OnInit {
  private tenantService = inject(TenantService);
  private amlJobService = inject(AmlJobService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  scenarios = signal<Scenario[]>([]);
  recentJobs = signal<RecentJob[]>([]);
  isLoading = signal(true);
  isLoadingJobs = signal(true);
  isRunningJob = signal(false);
  totalElements = signal(0);
  page = signal(0);
  size = signal(10);

  totalScenarios = signal(0);
  totalRuns = signal(0);

  ngOnInit(): void {
    this.fetchScenarios();
    this.fetchStats();
    this.fetchRecentJobs();
  }

  fetchStats(): void {
    this.tenantService.getRuleEngineStats().subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data) {
          this.totalScenarios.set(response.data.totalScenarios || 0);
          this.totalRuns.set(response.data.totalRuns || 0);
        }
      },
    });
  }

  navigateToRun(): void {
    this.router.navigate(['run'], { relativeTo: this.route });
  }

  navigateToHistory(): void {
    this.router.navigate(['history'], { relativeTo: this.route });
  }

  fetchScenarios(): void {
    this.isLoading.set(true);
    this.tenantService.getScenarios(this.page(), this.size()).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data && response.data.content) {
          this.scenarios.set(response.data.content);
          this.totalElements.set(response.data.meta?.totalElements || 0);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch scenarios', err);
        this.isLoading.set(false);
      },
    });
  }

  fetchRecentJobs(): void {
    this.isLoadingJobs.set(true);

    this.tenantService.getRuleEngineJobs(0, 5).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data && response.data.content) {
          // Map to match the interface if needed, or use directly if structure matches
          this.recentJobs.set(
            response.data.content.map((job: any) => ({
              jobId: job.id,
              jobType: job.jobType || 'RULE_ENGINE',
              status: job.status,
              createdAt: job.startTime,
            })),
          );
        }
        this.isLoadingJobs.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch recent jobs', err);
        this.isLoadingJobs.set(false);
      },
    });
  }

  getJobStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-success-light text-success border-success/30';
      case 'RUNNING':
        return 'bg-primary-lighter text-primary border-primary/30';
      case 'PENDING':
        return 'bg-warning-light text-warning border-warning/30';
      case 'FAILED':
        return 'bg-danger-light text-danger border-danger/30';
      default:
        return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  }

  getStatusColor(status: string): string {
    return status === 'ACTIVE'
      ? 'bg-success-light text-success border-success/30'
      : 'bg-gray-50 text-gray-800 border-gray-200';
  }

  getRiskColor(risk: string): string {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-danger-light text-danger border-danger/30';
      case 'HIGH':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'MEDIUM':
        return 'bg-warning-light text-warning border-warning/30';
      case 'LOW':
        return 'bg-success-light text-success border-success/20';
      default:
        return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  }
}
