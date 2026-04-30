import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { AdminDashboardStats } from '../../core/models/admin-dashboard.model';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);

  adminStats = signal<AdminDashboardStats | null>(null);
  isLoading = signal(true);

  isSystemAdmin = computed(() => {
    const role = this.authService.user()?.role;
    if (!role) return false;
    return role === 'ROLE_SYSTEM_ADMIN' || role === 'SYSTEM_ADMIN';
  });

  ngOnInit() {
    if (this.isSystemAdmin()) {
      this.fetchAdminStats();
    } else {
      this.isLoading.set(false);
    }
  }

  fetchAdminStats() {
    this.isLoading.set(true);
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.data) {
          this.adminStats.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching admin stats:', err);
        this.isLoading.set(false);
      }
    });
  }

  statsCards = computed(() => {
    const stats = this.adminStats();
    if (!stats) return [];

    return [
      { label: 'Total Tenants', value: stats.totalTenants, icon: 'landmark', color: 'primary' },
      { label: 'Active Scenarios', value: stats.totalActiveScenarios, icon: 'zap', color: 'info' },
      { label: 'Total DB Storage', value: stats.totalDbStorage, icon: 'database', color: 'secondary' },
      { label: 'Total Jobs', value: stats.totalJobs, icon: 'activity', color: 'success' }
    ];
  });

  jobMetrics = computed(() => {
    const stats = this.adminStats();
    if (!stats) return [];

    return [
      { label: 'Running', value: stats.runningJobs, color: 'primary' },
      { label: 'Pending', value: stats.pendingJobs, color: 'warning' },
      { label: 'Completed', value: stats.completedJobs, color: 'success' },
      { label: 'Failed', value: stats.failedJobs, color: 'danger' }
    ];
  });

  recentJobs = computed(() => {
    return this.adminStats()?.recentJobs || [];
  });

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'RUNNING': return 'primary';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'danger';
      default: return 'secondary';
    }
  }

  // Tenant mock data for fallback
  tenantStats = signal([
    { label: 'Pending Alerts', value: '24', change: '+12%', icon: 'bell', color: 'primary' },
    { label: 'Active Cases', value: '12', change: '-2', icon: 'briefcase', color: 'surface-dark' },
    { label: 'High Risk Txns', value: '156', change: '+15%', icon: 'alert-triangle', color: 'danger' },
    { label: 'Compliance Score', value: '98%', change: 'Stable', icon: 'shield-check', color: 'success' }
  ]);
}
