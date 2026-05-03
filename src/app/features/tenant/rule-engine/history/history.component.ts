import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../../../core/services/tenant.service';
import { ApiResponse } from '../../../../core/models/auth.model';
import { RecentJob } from '../../../../core/models/admin-dashboard.model';

@Component({
  selector: 'app-rule-engine-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
})
export class RuleEngineHistoryComponent implements OnInit {
  private tenantService = inject(TenantService);
  protected Math = Math;

  // State
  jobs = signal<RecentJob[]>([]);
  isLoading = signal(true);
  totalElements = signal(0);
  page = signal(0);
  size = signal(15);
  totalPages = computed(() => Math.ceil(this.totalElements() / this.size()) || 1);

  ngOnInit(): void {
    this.fetchHistory();
  }

  fetchHistory(): void {
    this.isLoading.set(true);
    this.tenantService.getRuleEngineJobs(this.page(), this.size()).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data && response.data.content) {
          this.jobs.set(
            response.data.content.map((job: any) => ({
              jobId: job.id,
              jobType: job.jobType || 'RULE_ENGINE',
              status: job.status,
              createdAt: job.startTime,
            })),
          );
          this.totalElements.set(response.data.meta?.totalElements || 0);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch job history', err);
        this.isLoading.set(false);
      },
    });
  }

  getJobStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-success-light text-success border-success/30';
      case 'RUNNING':
      case 'IN_PROGRESS':
        return 'bg-primary-lighter text-primary border-primary/30';
      case 'FAILED':
        return 'bg-danger-light text-danger border-danger/30';
      default:
        return 'bg-warning-light text-warning border-warning/30';
    }
  }

  nextPage(): void {
    if ((this.page() + 1) * this.size() < this.totalElements()) {
      this.page.update((p) => p + 1);
      this.fetchHistory();
    }
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update((p) => p - 1);
      this.fetchHistory();
    }
  }

  onPageSizeChange(newSize: any): void {
    this.size.set(Number(newSize));
    this.page.set(0);
    this.fetchHistory();
  }
}
