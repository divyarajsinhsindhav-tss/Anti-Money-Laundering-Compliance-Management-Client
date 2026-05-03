import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CaseService } from '../../../core/services/case.service';
import { TenantUserService, UserResponse } from '../../../core/services/tenant-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse } from '../../../core/models/auth.model';
import { Alert, AlertStatus } from '../../../core/models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css',
})
export class AlertsComponent implements OnInit {
  private alertService = inject(AlertService);
  private caseService = inject(CaseService);
  private tenantUserService = inject(TenantUserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  alerts = signal<Alert[]>([]);
  isLoading = signal<boolean>(false);

  canSelect = computed(() => {
    const user = this.authService.user();
    return user?.role === 'BANK_ADMIN' || user?.role === 'ROLE_BANK_ADMIN';
  });

  // Pagination & Filters
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  selectedStatus = signal<string>('');
  searchQuery = signal<string>('');

  statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Open', value: 'OPEN' },
    { label: 'In Case', value: 'IN_CASE' },
    { label: 'Reviewed', value: 'REVIEWED' },
    { label: 'Escalated', value: 'ESCALATED' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.isLoading.set(true);
    this.alertService
      .getAlerts(
        this.currentPage(),
        this.pageSize(),
        this.selectedStatus() || undefined,
        this.searchQuery() || undefined,
      )
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.alerts.set(response.data.content || []);
            const meta = response.data.meta;
            if (meta) {
              this.totalElements.set(meta.totalElements || 0);
              this.totalPages.set(meta.totalPages || 0);
            }
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.setMockData();
        },
      });
  }

  setMockData(): void {
    const mockAlerts: Alert[] = [
      {
        alertCode: 'AL-1001',
        scenarioName: 'High Frequency Transactions',
        customerName: 'John Doe',
        customerCode: 'C-501',
        customerIncome: 1500000,
        alertStatus: 'OPEN',
        createdAt: new Date().toISOString(),
      },
      {
        alertCode: 'AL-1002',
        scenarioName: 'Rapid Movement of Funds',
        customerName: 'Priya Verma',
        customerCode: 'C-502',
        customerIncome: 800000,
        alertStatus: 'OPEN',
        createdAt: new Date().toISOString(),
      },
      {
        alertCode: 'AL-1003',
        scenarioName: 'Structuring Activity',
        customerName: 'Amit Shah',
        customerCode: 'C-503',
        customerIncome: 1200000,
        alertStatus: 'REVIEWED',
        createdAt: new Date().toISOString(),
      },
    ];
    this.alerts.set(mockAlerts);
    this.totalElements.set(mockAlerts.length);
    this.totalPages.set(1);
  }

  autoGenerateCases(): void {
    if (
      confirm(
        'Are you sure you want to auto-generate cases for all OPEN alerts? This will group alerts by customer.',
      )
    ) {
      this.isLoading.set(true);
      this.caseService.autoGenerateCases().subscribe({
        next: (response: ApiResponse<any[]>) => {
          this.isLoading.set(false);
          alert(`Successfully generated ${response.data?.length || 0} cases.`);
          this.loadAlerts();
        },
        error: () => {
          this.isLoading.set(false);
          alert('Failed to auto-generate cases.');
        },
      });
    }
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.loadAlerts();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(0);
    this.loadAlerts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadAlerts();
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
      this.loadAlerts();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
      this.loadAlerts();
    }
  }

  viewDetail(alertCode: string): void {
    const tenant = this.router.url.split('/')[1];
    this.router.navigate([`/${tenant}/alerts`, alertCode]);
  }
}
