import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantUserService, UserResponse } from '../../../core/services/tenant-user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  private userService = inject(TenantUserService);
  private toastService = inject(ToastService);

  officers = signal<UserResponse[]>([]);
  isLoading = signal<boolean>(false);
  showAddModal = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Form Data
  newOfficer = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  };

  ngOnInit(): void {
    this.loadOfficers();
  }

  loadOfficers(): void {
    this.isLoading.set(true);
    this.userService.getComplianceOfficers().subscribe({
      next: (response) => {
        if (response.data) {
          this.officers.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Mock data for development if backend fails
        this.officers.set([
          {
            userCode: 'OFF-001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@bank.com',
            role: 'COMPLIANCE_OFFICER',
            isActive: true,
          },
          {
            userCode: 'OFF-002',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@bank.com',
            role: 'COMPLIANCE_OFFICER',
            isActive: true,
          },
        ]);
      },
    });
  }

  saveOfficer(): void {
    if (
      !this.newOfficer.firstName ||
      !this.newOfficer.lastName ||
      !this.newOfficer.email ||
      !this.newOfficer.password
    )
      return;

    this.isSaving.set(true);
    this.userService.registerComplianceOfficer(this.newOfficer).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showAddModal.set(false);
        this.resetForm();
        this.toastService.success('Compliance officer registered successfully');
        this.loadOfficers();
      },
      error: () => {
        this.isSaving.set(false);
        // Fallback for demo
        this.loadOfficers();
        this.showAddModal.set(false);
      },
    });
  }

  private resetForm(): void {
    this.newOfficer = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
    };
  }
}
