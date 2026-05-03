import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TenantService } from '../../../../core/services/tenant.service';
import { ApiResponse } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './transaction-detail.component.html',
})
export class TransactionDetailComponent implements OnInit {
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);

  transaction = signal<any>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const transactionId = this.route.snapshot.paramMap.get('transactionId');
    if (transactionId) {
      this.fetchDetail(transactionId);
    }
  }

  fetchDetail(id: string): void {
    this.isLoading.set(true);
    this.tenantService.getTransactionDetail(id).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data) {
          this.transaction.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch transaction detail', err);
        this.isLoading.set(false);
      },
    });
  }

  getDirectionClass(direction: string): string {
    return direction === 'INBOUND' || direction === 'CREDIT' 
      ? 'bg-success/10 text-success border-success/20' 
      : 'bg-danger/10 text-danger border-danger/20';
  }
}
