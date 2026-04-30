import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CaseService } from '../../../core/services/case.service';
import { Case } from '../../../core/models/case.model';

@Component({
  selector: 'app-case-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './case-management.component.html',
  styleUrls: ['./case-management.component.css']
})
export class CaseManagementComponent implements OnInit {
  private caseService = inject(CaseService);
  private router = inject(Router);

  cases = signal<Case[]>([]);
  isLoading = signal<boolean>(false);
  
  // Pagination & Filters
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  
  selectedStatus = signal<string>('');

  statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Escalated', value: 'ESCALATED' },
    { label: 'Closed SAR Filed', value: 'CLOSED_SAR_FILED' },
    { label: 'Closed No Action', value: 'CLOSED_NO_ACTION' },
    { label: 'Closed Inconclusive', value: 'CLOSED_INCONCLUSIVE' }
  ];

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.isLoading.set(true);
    this.caseService.getCases(
      this.currentPage(),
      this.pageSize(),
      this.selectedStatus() || undefined
    ).subscribe({
      next: (response) => {
        if (response.data) {
          this.cases.set(response.data.content || []);
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
    const mockCases: Case[] = [
      {
        caseCode: 'CAS-1001',
        createdByEmail: 'admin@bank.com',
        assignedToUserCode: 'OFF-001',
        status: 'OPEN',
        notes: 'Initial investigation for structuring.',
        createdAt: new Date().toISOString()
      },
      {
        caseCode: 'CAS-1002',
        createdByEmail: 'admin@bank.com',
        assignedToUserCode: 'OFF-002',
        status: 'UNDER_REVIEW',
        notes: 'Checking international wire patterns.',
        createdAt: new Date().toISOString()
      }
    ];
    this.cases.set(mockCases);
    this.totalElements.set(2);
    this.totalPages.set(1);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.loadCases();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadCases();
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadCases();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadCases();
    }
  }

  viewDetail(caseCode: string): void {
    const tenant = this.router.url.split('/')[1];
    this.router.navigate([`/${tenant}/cases`, caseCode]);
  }
}
