import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TenantService } from '../../../../core/services/tenant.service';
import { ApiResponse } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-list.component.html',
})
export class TransactionListComponent implements OnInit {
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  transactions = signal<any[]>([]);
  isLoading = signal(true);
  totalElements = signal(0);
  page = signal(0);
  size = signal(10);
  searchQuery = signal('');
  startDate = signal('');
  endDate = signal('');

  totalPages = computed(() => Math.ceil(this.totalElements() / this.size()) || 1);

  ngOnInit(): void {
    this.fetchTransactions();
  }

  fetchTransactions(): void {
    this.isLoading.set(true);
    
    // Ensure dates are sent in ISO format without the 'Z' timezone indicator for LocalDateTime parsing
    const start = this.startDate() ? new Date(this.startDate()).toISOString().slice(0, 19) : undefined;
    const end = this.endDate() ? new Date(this.endDate()).toISOString().slice(0, 19) : undefined;

    this.tenantService.getTransactions(
      this.page(), 
      this.size(), 
      this.searchQuery(),
      start,
      end
    ).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data && response.data.content) {
          this.transactions.set(response.data.content);
          this.totalElements.set(response.data.meta?.totalElements || 0);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch transactions', err);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.page.set(0);
    this.fetchTransactions();
  }

  onDateFilter(): void {
    this.page.set(0);
    this.fetchTransactions();
  }

  onPageSizeChange(newSize: any): void {
    this.size.set(Number(newSize));
    this.page.set(0);
    this.fetchTransactions();
  }

  nextPage(): void {
    if ((this.page() + 1) * this.size() < this.totalElements()) {
      this.page.update((p) => p + 1);
      this.fetchTransactions();
    }
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update((p) => p - 1);
      this.fetchTransactions();
    }
  }

  viewDetail(txnId: string): void {
    this.router.navigate([txnId], { relativeTo: this.route });
  }

  getDirectionClass(direction: string): string {
    return direction === 'INBOUND' || direction === 'CREDIT' 
      ? 'text-success font-bold' 
      : 'text-danger font-bold';
  }
}
