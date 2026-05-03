import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, of, catchError } from 'rxjs';
import { User } from '@core/models/auth.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.user();

    if (!user) {
      return authService.fetchCurrentUser().pipe(
        map((u) => {
          if (u) {
            return checkAccess(u, state, route, router);
          }
          return handleUnauthenticated(state, route, router);
        }),
        catchError(() => of(handleUnauthenticated(state, route, router))),
      );
    }

    return checkAccess(user, state, route, router);
  }

  return handleUnauthenticated(state, route, router);
};

function checkAccess(user: User, state: any, route: any, router: Router): boolean | UrlTree {
  const isSysRoute = state.url.startsWith('/sys');
  const routeTenant = route.params['tenant'] || route.parent?.params['tenant'];
  const userRole = user?.role || '';
  const isUserSystemAdmin = userRole === 'SYSTEM_ADMIN' || userRole === 'ROLE_SYSTEM_ADMIN';

  // 1. System Admin Access Control
  if (isUserSystemAdmin) {
    if (isSysRoute) {
      return true;
    }
    // System admin trying to access tenant routes or root
    return router.parseUrl('/sys/dashboard');
  }

  // 2. Tenant User Access Control
  if (!isUserSystemAdmin) {
    const userTenant = user?.tenantId;

    // Tenant user trying to access system routes
    if (isSysRoute) {
      return userTenant
        ? router.parseUrl(`/${userTenant}/dashboard`)
        : router.parseUrl('/sys/login');
    }

    // Tenant user trying to access a different tenant's route
    if (routeTenant && routeTenant !== userTenant) {
      return router.parseUrl(`/${userTenant}/dashboard`);
    }

    return true;
  }

  return true;
}

function handleUnauthenticated(state: any, route: any, router: Router): UrlTree {
  const tenantId = route.params['tenant'] || route.parent?.params['tenant'];

  if (state.url.startsWith('/sys')) {
    return router.parseUrl('/sys/login');
  } else if (tenantId) {
    return router.parseUrl(`/${tenantId}/login`);
  }

  return router.parseUrl('/sys/login');
}
