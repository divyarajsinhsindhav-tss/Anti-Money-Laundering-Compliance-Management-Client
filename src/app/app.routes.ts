import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { tenantAvailableGuard } from './core/guards/tenant-available.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'sys/dashboard', pathMatch: 'full' },
  {
    path: 'sys/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: ':tenant/login',
    canActivate: [tenantAvailableGuard],
    runGuardsAndResolvers: 'always',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'sys',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    loadChildren: () => import('./features/sysadmin/sysadmin.routes').then(m => m.sysadminRoutes)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: ':tenant',
    canActivate: [authGuard, tenantAvailableGuard],
    runGuardsAndResolvers: 'always',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    loadChildren: () => import('./features/tenant/tenant.routes').then(m => m.tenantRoutes)
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
