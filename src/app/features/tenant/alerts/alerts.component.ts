import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { Alert } from '../../../models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent implements OnInit {
  private alertService = inject(AlertService);
  private router = inject(Router);

  alerts = signal<Alert[]>([]);
  isLoading = signal<boolean>(false);
  
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
    { label: 'Closed True Positive', value: 'CLOSED_TRUE_POSITIVE' },
    { label: 'Closed False Positive', value: 'CLOSED_FALSE_POSITIVE' },
    { label: 'Closed Inconclusive', value: 'CLOSED_INCONCLUSIVE' }
  ];

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.isLoading.set(true);
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

  setMockData(): void {
    const mockAlerts: Alert[] = [
      {
        alertCode: 'AL-1001',
        scenarioName: 'High Frequency Transactions',
        customerName: 'John Doe',
        customerCode: 'C-501',
        alertStatus: 'OPEN',
        createdAt: new Date().toISOString()
      },
      {
        alertCode: 'AL-1002',
        scenarioName: 'Rapid Movement of Funds',
        customerName: 'Priya Verma',
        customerCode: 'C-502',
        alertStatus: 'UNDER_REVIEW',
        createdAt: new Date().toISOString()
      }
    ];
    this.alerts.set(mockAlerts);
    this.totalElements.set(2);
    this.totalPages.set(1);
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
