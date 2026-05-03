import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantService } from '@core/services/tenant.service';
import { ApiResponse } from '@core/models/auth.model';
import { map, catchError, of } from 'rxjs';

export const tenantAvailableGuard: CanActivateFn = (route, state) => {
  const tenantService = inject(TenantService);
  const router = inject(Router);

  const tenantCode = route.params['tenant'] || route.parent?.params['tenant'];

  const reservedKeywords = ['sys', 'not-found', 'login', 'admin'];
  if (!tenantCode || reservedKeywords.includes(tenantCode)) {
    return true;
  }

  console.log(`Checking availability for tenant: ${tenantCode}`);

  return tenantService.checkTenantAvailable(tenantCode).pipe(
    map((response) => {
      console.log('Tenant check response:', response);
      const data = response?.data;
      const isAvailable = data?.available ?? data?.isAvailable ?? false;

      if (isAvailable) {
        return true;
      } else {
        console.warn(`Tenant ${tenantCode} is not available, redirecting to not-found`);
        return router.parseUrl('/not-found');
      }
    }),
    catchError((error) => {
      console.error('Error checking tenant availability:', error);
      return of(router.parseUrl('/not-found'));
    }),
  );
};
