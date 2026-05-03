import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { TenantService } from '../../core/services/tenant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent implements OnInit {
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  isSidebarOpen = signal<boolean>(true);

  ngOnInit() {
    // Fetch user details if not already loaded
    if (!this.authService.user() && this.authService.isAuthenticated()) {
      this.authService.fetchCurrentUser().subscribe();
    }

    this.route.params.subscribe((params) => {
      const tenant = params['tenant'];
      if (tenant && tenant !== 'sys' && tenant !== 'not-found') {
        this.checkTenant(tenant);
      }
    });
  }

  private checkTenant(tenantCode: string) {
    this.tenantService.checkTenantAvailable(tenantCode).subscribe({
      next: (response) => {
        const isAvailable = response?.data?.available ?? response?.data?.isAvailable ?? false;
        if (!isAvailable) {
          this.router.navigate(['/not-found']);
        }
      },
      error: () => {
        // If API fails (like 403 or 404), treat as unavailable for safety
        this.router.navigate(['/not-found']);
      },
    });
  }

  toggleSidebar() {
    this.isSidebarOpen.update((open) => !open);
  }
}
