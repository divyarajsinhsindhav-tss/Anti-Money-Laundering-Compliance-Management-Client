import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CaseService } from '../../../core/services/case.service';
import { TenantUserService, UserResponse } from '../../../core/services/tenant-user.service';
import { Alert, AlertStatus } from '../../../core/models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent implements OnInit {
  private alertService = inject(AlertService);
  private caseService = inject(CaseService);
  private tenantUserService = inject(TenantUserService);
  private router = inject(Router);

  alerts = signal<Alert[]>([]);
  isLoading = signal<boolean>(false);

  // Selection
  selectedAlertIds = signal<Set<string>>(new Set());
  isAnySelected = computed(() => this.selectedAlertIds().size > 0);

  // Create Case Modal
  showCreateModal = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  assignedToUserCode = signal<string>('');
  caseNotes = signal<string>('');

  // Real Compliance Officers from Backend
  officers = signal<UserResponse[]>([]);

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
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Escalated', value: 'ESCALATED' },
    { label: 'In Case', value: 'IN_CASE' },
    { label: 'Closed True Positive', value: 'CLOSED_TRUE_POSITIVE' },
    { label: 'Closed False Positive', value: 'CLOSED_FALSE_POSITIVE' },
    { label: 'Closed Inconclusive', value: 'CLOSED_INCONCLUSIVE' }
  ];

  ngOnInit(): void {
    this.loadAlerts();
    this.loadOfficers();
  }

  loadAlerts(): void {
    this.isLoading.set(true);
    this.selectedAlertIds.set(new Set());
    this.alertService.getAlerts(
      this.currentPage(),
      this.pageSize(),
      this.selectedStatus() || undefined,
      this.searchQuery() || undefined
    ).subscribe({
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
      }
    });
  }

  loadOfficers(): void {
    this.tenantUserService.getComplianceOfficers().subscribe({
      next: (response) => {
        if (response.data) {
          this.officers.set(response.data);
        }
      },
      error: () => {
        // Fallback mock data if backend fails
        this.officers.set([
          { userCode: 'OFF-001', firstName: 'John', lastName: 'Officer', email: 'john@bank.com', role: 'COMPLIANCE_OFFICER', isActive: true },
          { userCode: 'OFF-002', firstName: 'Jane', lastName: 'Doe', email: 'jane@bank.com', role: 'COMPLIANCE_OFFICER', isActive: true }
        ]);
      }
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
        createdAt: new Date().toISOString()
      },
      {
        alertCode: 'AL-1002',
        scenarioName: 'Rapid Movement of Funds',
        customerName: 'Priya Verma',
        customerCode: 'C-502',
        customerIncome: 800000,
        alertStatus: 'OPEN',
        createdAt: new Date().toISOString()
      },
      {
        alertCode: 'AL-1003',
        scenarioName: 'Structuring Activity',
        customerName: 'Amit Shah',
        customerCode: 'C-503',
        customerIncome: 1200000,
        alertStatus: 'UNDER_REVIEW',
        createdAt: new Date().toISOString()
      }
    ];
    this.alerts.set(mockAlerts);
    this.totalElements.set(mockAlerts.length);
    this.totalPages.set(1);
  }

  // Selection Logic
  toggleSelection(alertCode: string): void {
    const alert = this.alerts().find(a => a.alertCode === alertCode);
    if (alert?.alertStatus !== 'OPEN') return;

    const newSet = new Set(this.selectedAlertIds());
    if (newSet.has(alertCode)) {
      newSet.delete(alertCode);
    } else {
      newSet.add(alertCode);
    }
    this.selectedAlertIds.set(newSet);
  }

  isAllSelected(): boolean {
    const openAlerts = this.alerts().filter(a => a.alertStatus === 'OPEN');
    return openAlerts.length > 0 && openAlerts.every(a => this.selectedAlertIds().has(a.alertCode));
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedAlertIds.set(new Set());
    } else {
      const openAlertIds = this.alerts()
        .filter(a => a.alertStatus === 'OPEN')
        .map(a => a.alertCode);
      this.selectedAlertIds.set(new Set(openAlertIds));
    }
  }

  // Case Creation
  openCreateCaseModal(): void {
    if (this.selectedAlertIds().size === 0) return;
    this.showCreateModal.set(true);
  }

  submitCase(): void {
    if (!this.assignedToUserCode()) return;

    this.isCreating.set(true);
    const request = {
      alertCodes: Array.from(this.selectedAlertIds()),
      assignedToUserCode: this.assignedToUserCode(),
      notes: this.caseNotes()
    };

    this.caseService.createCase(request).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.showCreateModal.set(false);
        this.resetCreateForm();
        this.loadAlerts(); // Reload to update status (should be IN_CASE now)
      },
      error: () => {
        this.isCreating.set(false);
        this.showCreateModal.set(false);
        this.resetCreateForm();
        this.loadAlerts();
      }
    });
  }

  private resetCreateForm(): void {
    // Simulate status update for mock data
    const selectedIds = Array.from(this.selectedAlertIds());
    this.alerts.update(current => current.map(a => 
      selectedIds.includes(a.alertCode) ? { ...a, alertStatus: 'IN_CASE' as AlertStatus } : a
    ));

    this.assignedToUserCode.set('');
    this.caseNotes.set('');
    this.selectedAlertIds.set(new Set());
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
      this.currentPage.update(p => p - 1);
      this.loadAlerts();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadAlerts();
    }
  }

  viewDetail(alertCode: string): void {
    const tenant = this.router.url.split('/')[1];
    this.router.navigate([`/${tenant}/alerts`, alertCode]);
  }
}
