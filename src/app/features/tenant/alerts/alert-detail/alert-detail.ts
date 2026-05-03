import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AlertDetail, AlertStatus } from '../../../../core/models/alert.model';
import { computed } from '@angular/core';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './alert-detail.html',
  styleUrl: './alert-detail.css',
})
export class AlertDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  alertId = signal<string | null>(null);
  alertDetail = signal<AlertDetail | null>(null);
  isLoading = signal<boolean>(false);

  // Investigation Form
  newStatus = signal<AlertStatus>('OPEN');
  reason = signal<string>('');
  isUpdating = signal<boolean>(false);

  canUpdate = computed(() => {
    const user = this.authService.user();
    const isNotAdmin = user?.role !== 'BANK_ADMIN' && user?.role !== 'ROLE_BANK_ADMIN';
    return isNotAdmin && this.alertDetail()?.alert.alertStatus !== 'OPEN';
  });

  statuses = [
    { label: 'Reviewed', value: 'REVIEWED' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('alertId');
    if (id) {
      this.alertId.set(id);
      this.loadAlertDetail(id);
    }
  }

  loadAlertDetail(id: string): void {
    this.isLoading.set(true);
    this.alertService.getAlertDetail(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.alertDetail.set(response.data);
          this.newStatus.set(response.data.alert.alertStatus);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.setMockDetail(id);
      },
    });
  }

  setMockDetail(id: string): void {
    const mock: AlertDetail = {
      alert: {
        alertCode: id,
        scenarioName: 'Large Cash Deposit',
        customerName: 'Aman Sharma',
        customerCode: 'CUST-8829',
        customerIncome: 1250000,
        alertStatus: 'IN_CASE',
        createdAt: new Date().toISOString(),
      },
      financialTransactionResponsesList: [
        {
          txnNo: 'TXN-901',
          accountNo: 'ACC-123',
          amount: 5000,
          txnType: 'CASH',
          direction: 'INBOUND',
          counterpartyAccountNo: 'N/A',
          counterpartyBankIfsc: 'N/A',
          txnTimestamp: new Date().toISOString(),
          countryCode: 'IN',
        },
        {
          txnNo: 'TXN-902',
          accountNo: 'ACC-123',
          amount: 7500,
          txnType: 'CASH',
          direction: 'INBOUND',
          counterpartyAccountNo: 'N/A',
          counterpartyBankIfsc: 'N/A',
          txnTimestamp: new Date().toISOString(),
          countryCode: 'IN',
        },
      ],
      customerResponsesList: [
        {
          customerCode: 'CUST-8829',
          customerName: 'Aman Sharma',
          customerEmail: 'aman@example.com',
          customerPhone: '9876543210',
          customerIncome: 1250000,
        },
      ],
    };
    this.alertDetail.set(mock);
    this.newStatus.set(mock.alert.alertStatus);
  }

  updateStatus(): void {
    if (!this.alertId()) return;

    this.isUpdating.set(true);
    this.alertService
      .updateAlertStatus(this.alertId()!, this.newStatus(), this.reason())
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.loadAlertDetail(this.alertId()!);
            this.reason.set('');
            this.toastService.success('Alert status updated successfully');
          }
          this.isUpdating.set(false);
        },
        error: () => {
          this.isUpdating.set(false);
          // Mock update
          if (this.alertDetail()) {
            const updated = { ...this.alertDetail()! };
            updated.alert.alertStatus = this.newStatus();
            this.alertDetail.set(updated);
            this.reason.set('');
          }
        },
      });
  }

  goBack(): void {
    const tenant = this.router.url.split('/')[1];
    this.router.navigate([`/${tenant}/alerts`]);
  }
}
