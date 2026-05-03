import { Routes } from '@angular/router';

export const tenantRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'customers',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./customer/customer.component').then((m) => m.CustomerComponent),
      },
      {
        path: 'file-upload',
        loadComponent: () => import('./customer/file-upload/file-upload').then((m) => m.FileUpload),
      },
      {
        path: 'error',
        loadComponent: () => import('./customer/error/error').then((m) => m.CustomerErrorComponent),
      },
      {
        path: 'customer-list',
        loadComponent: () =>
          import('./customer/customer-list/customer-list.component').then(
            (m) => m.CustomerListComponent,
          ),
      },
      {
        path: 'customer-list/:customerId',
        loadComponent: () =>
          import('./customer/customer-detail/customer-detail.component').then(
            (m) => m.CustomerDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'transactions',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./transaction/transaction.component').then((m) => m.TransactionComponent),
      },
      {
        path: 'file-upload',
        loadComponent: () =>
          import('./transaction/file-upload/file-upload').then((m) => m.FileUpload),
      },
      {
        path: 'error',
        loadComponent: () =>
          import('./transaction/error/error').then((m) => m.TransactionErrorComponent),
      },
      {
        path: 'transaction-list',
        loadComponent: () =>
          import('./transaction/transaction-list/transaction-list.component').then(
            (m) => m.TransactionListComponent,
          ),
      },
      {
        path: 'transaction-list/:transactionId',
        loadComponent: () =>
          import('./transaction/transaction-detail/transaction-detail.component').then(
            (m) => m.TransactionDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'rule-engine',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./rule-engine/rule-engine.component').then((m) => m.RuleEngineComponent),
      },
      {
        path: 'run',
        loadComponent: () => import('./rule-engine/run/run').then((m) => m.RuleEngineRunComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./rule-engine/history/history.component').then((m) => m.RuleEngineHistoryComponent),
      },
    ],
  },
  {
    path: 'alerts',
    children: [
      {
        path: '',
        loadComponent: () => import('./alerts/alerts.component').then((m) => m.AlertsComponent),
      },
      {
        path: ':alertId',
        loadComponent: () =>
          import('./alerts/alert-detail/alert-detail').then((m) => m.AlertDetailComponent),
      },
    ],
  },
  {
    path: 'cases',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./case-management/case-management.component').then(
            (m) => m.CaseManagementComponent,
          ),
      },
      {
        path: ':caseId',
        loadComponent: () =>
          import('./case-management/case-detail/case-detail.component').then(
            (m) => m.CaseDetailComponent,
          ),
      },
    ],
  },

  {
    path: 'users',
    loadComponent: () =>
      import('./user-management/user-management.component').then((m) => m.UserManagementComponent),
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('../../shared/components/profile/profile.component').then((m) => m.ProfileComponent),
  },
];
