import { Routes } from '@angular/router';

export const tenantRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('./customer/customer.component').then(m => m.CustomerComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transaction/transaction.component').then(m => m.TransactionComponent)
  },
  {
    path: 'rule-engine',
    loadComponent: () => import('./rule-engine/rule-engine.component').then(m => m.RuleEngineComponent)
  },
  {
    path: 'alerts',
    children: [
      {
        path: '',
        loadComponent: () => import('./alerts/alerts.component').then(m => m.AlertsComponent)
      },
      {
        path: ':alertId',
        loadComponent: () => import('./alerts/alert-detail/alert-detail').then(m => m.AlertDetailComponent)
      }
    ]
  },
  {
    path: 'cases',
    children: [
      {
        path: '',
        loadComponent: () => import('./case-management/case-management.component').then(m => m.CaseManagementComponent)
      },
      {
        path: ':caseId',
        loadComponent: () => import('./case-management/case-detail/case-detail.component').then(m => m.CaseDetailComponent)
      }
    ]
  },
  {
    path: 'users',
    loadComponent: () => import('./user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'audits',
    loadComponent: () => import('./audits/audits.component').then(m => m.AuditsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('../../shared/components/profile/profile.component').then(m => m.ProfileComponent)
  }
];
