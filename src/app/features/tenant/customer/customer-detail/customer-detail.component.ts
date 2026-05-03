import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TenantService } from '../../../../core/services/tenant.service';
import { ApiResponse } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-detail.component.html',
})
export class CustomerDetailComponent implements OnInit {
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);

  customer = signal<any>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('customerId');
    if (customerId) {
      this.fetchDetail(customerId);
    }
  }

  fetchDetail(id: string): void {
    this.isLoading.set(true);
    this.tenantService.getCustomerDetail(id).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data) {
          this.customer.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch customer detail', err);
        this.isLoading.set(false);
      },
    });
  }

  getAccountTypeClass(type: string): string {
    switch (type?.toUpperCase()) {
      case 'SAVINGS':
        return 'bg-success/10 text-success border-success/20';
      case 'CURRENT':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  }
}
