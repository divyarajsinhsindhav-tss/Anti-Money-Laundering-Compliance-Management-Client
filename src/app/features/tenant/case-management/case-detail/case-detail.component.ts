import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CaseService } from '../../../../core/services/case.service';
import { AlertService } from '../../../../core/services/alert.service';
import {
  CaseDetail,
  CaseStatus,
  UpdateCaseStatusRequest,
} from '../../../../core/models/case.model';
import { AlertStatus } from '../../../../core/models/alert.model';
import { ApiResponse } from '../../../../core/models/auth.model';
import { TenantUserService, UserResponse } from '../../../../core/services/tenant-user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';
import { computed } from '@angular/core';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './case-detail.component.html',
  styleUrls: ['./case-detail.component.css'],
})
export class CaseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private caseService = inject(CaseService);
  private alertService = inject(AlertService);
  private tenantUserService = inject(TenantUserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  caseId = signal<string | null>(null);
  caseDetail = signal<CaseDetail | null>(null);
  isLoading = signal<boolean>(false);

  complianceOfficers = signal<UserResponse[]>([]);
  selectedOfficer = signal<string>('');
  isAssigning = signal<boolean>(false);

  // Status update states
  isUpdatingStatus = signal<boolean>(false);
  isDownloadingPdf = signal<boolean>(false);

  // Custom Modal States
  showStatusModal = signal<boolean>(false);
  modalReason = signal<string>('');
  modalTargetType = signal<'ALERT' | 'CASE'>('CASE');
  modalTargetId = signal<string>('');
  modalTargetStatus = signal<string>('');

  canAssign = computed(() => {
    const user = this.authService.user();
    return user?.role === 'BANK_ADMIN' || user?.role === 'ROLE_BANK_ADMIN';
  });

  isAssignedOfficer = computed(() => {
    const user = this.authService.user();
    const currentCase = this.caseDetail()?.caseResponse;
    return user?.email === currentCase?.assignedToEmail;
  });

  canUpdateStatus = computed(() => {
    const user = this.authService.user();
    const status = this.caseDetail()?.caseResponse.status;
    const isReviewable = status === 'UNDER_REVIEW' || status === 'ESCALATED';

    // Strictly exclude Bank Admins from investigation actions (Escalate/Close Case/Alerts)
    if (user?.role === 'BANK_ADMIN' || user?.role === 'ROLE_BANK_ADMIN') {
      return false;
    }

    const isOfficer =
      user?.role === 'COMPLIANCE_OFFICER' || user?.role === 'ROLE_COMPLIANCE_OFFICER';
    return isOfficer && this.isAssignedOfficer() && isReviewable;
  });

  canEscalate = computed(() => {
    if (!this.canUpdateStatus()) return false;
    const currentStatus = this.caseDetail()?.caseResponse.status;
    if (currentStatus === 'ESCALATED') return false; // Cannot escalate an already escalated case

    const alerts = this.caseDetail()?.alerts || [];
    const allReviewedOrClosed = alerts.every(
      (a) => a.alertStatus === 'REVIEWED' || a.alertStatus === 'CLOSED',
    );
    const atLeastOneReviewed = alerts.some((a) => a.alertStatus === 'REVIEWED');
    return allReviewedOrClosed && atLeastOneReviewed;
  });

  canClose = computed(() => {
    if (!this.canUpdateStatus()) return false;
    const alerts = this.caseDetail()?.alerts || [];
    // A case can be closed if all alerts are CLOSED
    const allClosed = alerts.every((a) => a.alertStatus === 'CLOSED');
    return allClosed;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('caseId');
    if (id) {
      this.caseId.set(id);
      this.loadCaseDetail(id);
      if (this.canAssign()) {
        this.loadComplianceOfficers();
      }
    }
  }

  loadCaseDetail(id: string): void {
    this.isLoading.set(true);
    this.caseService.getCaseDetail(id).subscribe({
      next: (response: ApiResponse<CaseDetail>) => {
        if (response.data) {
          this.caseDetail.set(response.data);
          if (response.data.caseResponse.assignedToUserCode) {
            this.selectedOfficer.set(response.data.caseResponse.assignedToUserCode);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    const tenant = this.router.url.split('/')[1];
    this.router.navigate([`/${tenant}/cases`]);
  }

  viewAlertDetail(alertCode: string): void {
    const tenant = this.router.url.split('/')[1];
    this.router.navigate([`/${tenant}/alerts`, alertCode]);
  }

  loadComplianceOfficers(): void {
    this.tenantUserService.getComplianceOfficers().subscribe({
      next: (response: ApiResponse<UserResponse[]>) => {
        this.complianceOfficers.set(response.data || []);
      },
      error: (err) => {
        console.error('Failed to fetch compliance officers:', err);
      },
    });
  }

  assignCase(): void {
    if (!this.selectedOfficer() || !this.caseId()) return;

    this.isAssigning.set(true);
    this.caseService.assignCase(this.caseId()!, this.selectedOfficer()).subscribe({
      next: () => {
        this.isAssigning.set(false);
        this.loadCaseDetail(this.caseId()!);
        this.toastService.success('Case assigned successfully');
      },
      error: () => {
        this.isAssigning.set(false);
      },
    });
  }

  updateAlertStatus(alertCode: string, status: AlertStatus): void {
    this.modalTargetType.set('ALERT');
    this.modalTargetId.set(alertCode);
    this.modalTargetStatus.set(status);
    this.modalReason.set('');
    this.showStatusModal.set(true);
  }

  changeCaseStatus(status: CaseStatus): void {
    this.modalTargetType.set('CASE');
    this.modalTargetId.set(this.caseId() || '');
    this.modalTargetStatus.set(status);
    this.modalReason.set('');
    this.showStatusModal.set(true);
  }

  confirmStatusUpdate(): void {
    const type = this.modalTargetType();
    const id = this.modalTargetId();
    const status = this.modalTargetStatus();
    const reason = this.modalReason();

    if (!reason.trim()) return;

    if (type === 'ALERT') {
      this.isUpdatingStatus.set(true);
      this.alertService.updateAlertStatus(id, status as AlertStatus, reason).subscribe({
        next: () => {
          this.loadCaseDetail(this.caseId()!);
          this.closeModal();
          this.toastService.success('Alert status updated successfully');
        },
        error: (err) => {
          this.isUpdatingStatus.set(false);
        },
      });
    } else {
      const request: UpdateCaseStatusRequest = {
        caseStatus: status as CaseStatus,
        reason: reason,
      };

      this.isUpdatingStatus.set(true);
      this.caseService.updateCaseStatus(id, request).subscribe({
        next: (response) => {
          this.caseDetail.set(response.data);
          this.closeModal();
          this.toastService.success('Case status updated successfully');
        },
        error: (err) => {
          this.isUpdatingStatus.set(false);
        },
      });
    }
  }

  closeModal(): void {
    this.showStatusModal.set(false);
    this.isUpdatingStatus.set(false);
  }

  downloadPdf(): void {
    const code = this.caseId();
    if (!code) return;

    this.isDownloadingPdf.set(true);
    this.caseService.downloadPdf(code).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `case-${code}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isDownloadingPdf.set(false);
        this.toastService.success('PDF downloaded successfully');
      },
      error: (err) => {
        console.error('Failed to download PDF:', err);
        this.toastService.error('Failed to download PDF');
        this.isDownloadingPdf.set(false);
      },
    });
  }
}
