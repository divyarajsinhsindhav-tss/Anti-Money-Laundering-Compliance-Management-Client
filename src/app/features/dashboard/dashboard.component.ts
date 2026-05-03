import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { AdminDashboardStats } from '../../core/models/admin-dashboard.model';
import { TenantService } from '../../core/services/tenant.service';

import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private tenantService = inject(TenantService);


  adminStats = signal<AdminDashboardStats | null>(null);
  isLoading = signal(true);


  isSystemAdmin = computed(() => {
    const role = this.authService.user()?.role;
    if (!role) return false;
    return role === 'ROLE_SYSTEM_ADMIN' || role === 'SYSTEM_ADMIN';
  });

  isComplianceOfficer = computed(() => {
    const role = this.authService.user()?.role;
    if (!role) return false;
    return role === 'ROLE_COMPLIANCE_OFFICER' || role === 'COMPLIANCE_OFFICER';
  });

  ngOnInit() {
    if (this.isSystemAdmin()) {
      this.fetchAdminStats();
    } else {
      this.fetchTenantStats();
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
      },
    });
  }

  statsCards = computed(() => {
    const stats = this.adminStats();
    if (!stats) return [];

    return [
      { label: 'Total Tenants', value: stats.totalTenants, icon: 'landmark', color: 'primary' },
      { label: 'Active Scenarios', value: stats.totalActiveScenarios, icon: 'zap', color: 'info' },
      {
        label: 'Total DB Storage',
        value: stats.totalDbStorage,
        icon: 'database',
        color: 'secondary',
      },
      { label: 'Total Jobs', value: stats.totalJobs, icon: 'activity', color: 'success' },
    ];
  });

  jobMetrics = computed(() => {
    const stats = this.adminStats();
    if (!stats) return [];

    return [
      { label: 'Running', value: stats.runningJobs, color: 'primary' },
      { label: 'Pending', value: stats.pendingJobs, color: 'warning' },
      { label: 'Completed', value: stats.completedJobs, color: 'success' },
      { label: 'Failed', value: stats.failedJobs, color: 'danger' },
    ];
  });

  recentJobs = computed(() => {
    return this.adminStats()?.recentJobs || [];
  });

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success/5 text-success border-success/30';
      case 'RUNNING':
        return 'bg-primary/5 text-primary border-primary/30';
      case 'PENDING':
      case 'OPEN':
        return 'bg-warning/5 text-warning border-warning/30';
      case 'FAILED':
        return 'bg-danger/5 text-danger border-danger/30';
      default:
        return 'secondary';
    }
  }

  // Tenant dynamic data
  tenantStats = signal([
    { label: 'Pending Alerts', value: '0', change: '', icon: 'bell', color: 'primary' },
    { label: 'Cases Under Review', value: '0', change: '', icon: 'briefcase', color: 'surface-dark' },
    {
      label: 'Total Customers',
      value: '0',
      change: '',
      icon: 'users',
      color: 'success',
    },
    {
      label: 'Total Transactions',
      value: '0',
      change: '',
      icon: 'activity',
      color: 'info',
    },
  ]);

  recentAlerts = signal<any[]>([]);
  recentCases = signal<any[]>([]);

  fetchTenantStats() {
    this.isLoading.set(true);

    this.tenantService.getDashboardStats().subscribe({
      next: (res) => {
        const stats = res.data;
        if (!stats) {
          this.isLoading.set(false);
          return;
        }

        this.recentAlerts.set(stats.recentAlerts || []);
        this.recentCases.set(stats.recentCases || []);

        this.tenantStats.set([
          {
            label: 'Pending Alerts',
            value: stats.totalOpenAlerts.toString(),
            change: '',
            icon: 'bell',
            color: 'primary',
          },
          {
            label: 'Cases Under Review',
            value: stats.totalUnderReviewCases.toString(),
            change: '',
            icon: 'briefcase',
            color: 'surface-dark',
          },
          {
            label: 'Total Customers',
            value: stats.totalCustomers.toString(),
            change: '',
            icon: 'users',
            color: 'success',
          },
          {
            label: 'Total Transactions',
            value: stats.totalTransactions.toString(),
            change: '',
            icon: 'activity',
            color: 'info',
          },
        ]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching tenant dashboard stats:', err);
        this.isLoading.set(false);
      },
    });
  }

}
