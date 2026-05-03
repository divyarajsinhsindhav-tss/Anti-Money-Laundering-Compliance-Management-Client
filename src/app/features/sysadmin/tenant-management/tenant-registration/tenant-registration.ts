import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantService } from '@core/services/tenant.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-tenant-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-registration.html',
  styleUrl: './tenant-registration.css',
})
export class TenantRegistrationComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private toastService = inject(ToastService);

  registrationForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.registrationForm = this.fb.group({
      tenant: this.fb.group({
        tenantCode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
        name: ['', Validators.required],
        displayName: ['', Validators.required],
      }),
      admin: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        phoneNumber: [''],
      }),
    });
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.registrationForm.value;
    const request = {
      tenantCode: formValue.tenant.tenantCode,
      name: formValue.tenant.name,
      displayName: formValue.tenant.displayName,
      adminRegistrationRequest: {
        ...formValue.admin,
      },
    };

    this.tenantService.registerTenant(request).subscribe({
      next: (response) => {
        if (response.status === 201 || response.status === 200) {
          this.toastService.success('Tenant registered successfully');
          this.router.navigate(['/sys/tenants', request.tenantCode]);
        } else {
          this.errorMessage.set(response.message || 'Registration failed');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Server error during registration');
        this.isLoading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/sys/tenants']);
  }
}
