import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { TenantService } from '../../../core/services/tenant.service';
import { RecentJob } from '../../../core/models/admin-dashboard.model';

@Component({
  selector: 'app-job-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-record.html',
  styleUrl: './job-record.css',
})
export class JobRecordComponent implements OnInit {
  private adminService = inject(AdminService);
  private tenantService = inject(TenantService);

  // State
  jobRecords = signal<RecentJob[]>([]);
  tenants = signal<{ name: string; tenantCode: string }[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  isLoading = signal(true);

  // Filters
  selectedStatus = signal<string>('');
  selectedTenant = signal<string>('');

  statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Running', value: 'RUNNING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Failed', value: 'FAILED' },
  ];

  ngOnInit() {
    this.fetchTenants();
    this.fetchJobRecords();
  }

  fetchTenants() {
    this.tenantService.getAllTenants().subscribe({
      next: (response) => {
        if (response.data) {
          this.tenants.set(response.data);
        }
      },
    });
  }

  fetchJobRecords() {
    this.isLoading.set(true);
    this.adminService
      .getJobRecords(
        this.currentPage(),
        this.pageSize(),
        this.selectedStatus() || undefined,
        this.selectedTenant() || undefined,
      )
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.jobRecords.set(response.data.content);
            this.totalElements.set(response.data.totalElements);
            this.totalPages.set(response.data.totalPages);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onStatusChange(status: string) {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.fetchJobRecords();
  }

  onTenantChange(tenantCode: string) {
    this.selectedTenant.set(tenantCode);
    this.currentPage.set(0);
    this.fetchJobRecords();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
      this.fetchJobRecords();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
      this.fetchJobRecords();
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.fetchJobRecords();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success/5 text-success border-success/30';
      case 'RUNNING':
        return 'bg-primary/5 text-primary border-primary/30';
      case 'PENDING':
      case 'OPEN':
        return 'bg-warning/5 text-warning border-warning/30';
      case 'FAILED':
        return 'bg-danger/5 text-danger border-danger/30';
      default:
        return 'secondary';
    }
  }
}
