import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerStats } from '../../../core/models/customer.model';
import { ApiResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './customer.component.html',
})
export class CustomerComponent implements OnInit {
  private customerService = inject(CustomerService);
  
  stats = signal<CustomerStats | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.customerService.getUploadStats().subscribe({
      next: (response: ApiResponse<CustomerStats>) => {
        if (response.data) {
          this.stats.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching stats', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-success/5 text-success border-success/10';
      case 'FAILED': return 'bg-danger/5 text-danger border-danger/10';
      case 'RUNNING':
      case 'PROCESSING': return 'bg-primary/5 text-primary border-primary/10';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  }
}
