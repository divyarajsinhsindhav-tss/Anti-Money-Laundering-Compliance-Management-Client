import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantService } from '@core/services/tenant.service';
import { TenantResponse } from '@core/models/tenant.model';

@Component({
  selector: 'app-tenant-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-management.component.html',
  styleUrl: './tenant-management.component.css'
})
export class TenantManagementComponent implements OnInit {
  private tenantService = inject(TenantService);
  private router = inject(Router);

  searchQuery = signal('');
  tenants = signal<TenantResponse[]>([]);
  isLoading = signal(true);

  filteredTenants = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.tenants().filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.tenantCode.toLowerCase().includes(query) ||
      t.displayName.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants() {
    this.isLoading.set(true);
    this.tenantService.getAllTenants().subscribe({
      next: (response) => {
        // Assuming response is the list or has a data property
        this.tenants.set(Array.isArray(response) ? response : response.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load tenants', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  navigateToRegister() {
    this.router.navigate(['/sys/tenants/register']);
  }

  viewTenantDetail(tenantCode: string) {
    this.router.navigate(['/sys/tenants', tenantCode]);
  }
}

