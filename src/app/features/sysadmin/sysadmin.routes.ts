import { Routes } from '@angular/router';

export const sysadminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'tenants',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./tenant-management/tenant-management.component').then(
            (m) => m.TenantManagementComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./tenant-management/tenant-registration/tenant-registration').then(
            (m) => m.TenantRegistrationComponent,
          ),
      },
      {
        path: ':tenantCode',
        loadComponent: () =>
          import('./tenant-management/tenant-detail/tenant-detail').then(
            (m) => m.TenantDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'scenarios',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./scenario/scenario.component').then((m) => m.ScenarioComponent),
      },
      {
        path: ':scenarioCode',
        loadComponent: () =>
          import('./scenario/scenario-detail/scenario-detail').then(
            (m) => m.ScenarioDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'job-records',
    loadComponent: () => import('./job-record/job-record').then((m) => m.JobRecordComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../../shared/components/profile/profile.component').then((m) => m.ProfileComponent),
  },
];
