import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private tenantService = inject(TenantService);

  loginForm = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)], nonNullable: true })
  });

  isSystemAdmin = signal(false);
  tenantId = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const tenant = params['tenant'];
      this.tenantId.set(tenant || null);
      this.isSystemAdmin.set(this.router.url.includes('/sys/login'));

      // If already authenticated, redirect to dashboard
      if (this.authService.isAuthenticated()) {
        const user = this.authService.user();
        if (user) {
          this.redirectUser(user, tenant);
        } else {
          this.authService.fetchCurrentUser().subscribe(u => {
            if (u) this.redirectUser(u, tenant);
          });
        }
        return;
      }

      // Check tenant availability if not a system route
      if (tenant && tenant !== 'sys' && tenant !== 'not-found') {
        this.checkTenant(tenant);
      }
    });
  }

  private redirectUser(user: any, tenantFromUrl?: string): void {
    const role = user?.role || '';
    const isSysAdmin = role === 'SYSTEM_ADMIN' || role === 'ROLE_SYSTEM_ADMIN';

    if (isSysAdmin) {
      this.router.navigate(['/sys/dashboard']);
    } else if (user?.tenantId && user?.tenantId !== 'public') {
      this.router.navigate([`/${user.tenantId}/dashboard`]);
    } else if (tenantFromUrl) {
      this.router.navigate([`/${tenantFromUrl}/dashboard`]);
    } else {
      this.router.navigate(['/sys/dashboard']);
    }
  }

  private checkTenant(tenantCode: string): void {
    this.tenantService.checkTenantAvailable(tenantCode).subscribe({
      next: (response) => {
        const isAvailable = response?.data?.available ?? response?.data?.isAvailable ?? false;
        if (!isAvailable) {
          this.router.navigate(['/not-found']);
        }
      },
      error: () => {
        this.router.navigate(['/not-found']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);

      const credentials = this.loginForm.value;
      const tenant = this.tenantId();

      this.authService.login(credentials, tenant || undefined).subscribe({
        next: (response) => {
          this.loading.set(false);
          const loginData = response.data;
          const isSysAdmin = loginData.role === 'SYSTEM_ADMIN' || loginData.role === 'ROLE_SYSTEM_ADMIN';
          
          // Redirect immediately using role from response and current tenant context
          if (isSysAdmin) {
            this.router.navigate(['/sys/dashboard']);
          } else {
            // For tenant users, use the tenant from the URL or fallback to 'public'
            const targetTenant = tenant || 'public';
            this.router.navigate([`/${targetTenant}/dashboard`]);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Login failed. Please check your credentials.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
}
