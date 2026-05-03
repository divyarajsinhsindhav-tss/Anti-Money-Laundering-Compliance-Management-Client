import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { TransactionStats } from '../../../core/models/transaction.model';
import { ApiResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit {
  private transactionService = inject(TransactionService);

  stats = signal<TransactionStats | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.transactionService.getUploadStats().subscribe({
      next: (response: ApiResponse<TransactionStats>) => {
        if (response.data) {
          const mappedStats = {
            ...response.data,
            recentErrors: response.data.recentErrors.map((err) => ({
              ...err,
              id: err.id || err.error_id,
              transactionId: err.transactionId || err.txn_no,
              timestamp: err.timestamp || err.created_at,
              errorCode:
                err.errorCode || (err.critical_errors && err.critical_errors[0]) || 'ERROR',
              errorMessage:
                err.errorMessage ||
                (err.warning_errors && err.warning_errors[0]) ||
                'Validation Failure',
            })),
          };
          this.stats.set(mappedStats);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching stats', err);
        this.isLoading.set(false);
      },
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success/5 text-success border-success/30';
      case 'FAILED':
        return 'bg-danger/5 text-danger border-danger/30';
      case 'RUNNING':
      case 'PROCESSING':
        return 'bg-primary/5 text-primary border-primary/30';
      case 'PENDING':
      case 'OPEN':
        return 'bg-warning/5 text-warning border-warning/30';
      default:
        return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  }
}
