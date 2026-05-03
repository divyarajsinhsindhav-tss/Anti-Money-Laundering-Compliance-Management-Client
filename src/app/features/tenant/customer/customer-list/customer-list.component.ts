import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TenantService } from '../../../../core/services/tenant.service';
import { ApiResponse } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  customers = signal<any[]>([]);
  isLoading = signal(true);
  totalElements = signal(0);
  page = signal(0);
  size = signal(10);
  searchQuery = signal('');

  totalPages = computed(() => Math.ceil(this.totalElements() / this.size()) || 1);

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers(): void {
    this.isLoading.set(true);
    this.tenantService.getCustomers(this.page(), this.size(), this.searchQuery()).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data && response.data.content) {
          this.customers.set(response.data.content);
          this.totalElements.set(response.data.meta?.totalElements || 0);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch customers', err);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.page.set(0);
    this.fetchCustomers();
  }

  onPageSizeChange(newSize: any): void {
    this.size.set(Number(newSize));
    this.page.set(0);
    this.fetchCustomers();
  }

  nextPage(): void {
    if ((this.page() + 1) * this.size() < this.totalElements()) {
      this.page.update((p) => p + 1);
      this.fetchCustomers();
    }
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update((p) => p - 1);
      this.fetchCustomers();
    }
  }

  viewDetail(customerId: string): void {
    this.router.navigate([customerId], { relativeTo: this.route });
  }
}
