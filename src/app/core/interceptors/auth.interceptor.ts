import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Determine the context
  const isPublicPath = req.url.includes('/api/v1/auth/') || req.url.includes('/check-tenant-available');
  const isSysPath = req.url.includes('/api/v1/admin/');
  const existingTenantId = req.headers.get('X-Tenant-Id');
  const tenantId = existingTenantId || authService.tenantId() || 'public';

  // 2. Clone request and add common headers
  let authReq = req.clone();
  
  if (!(req.body instanceof FormData)) {
    authReq = authReq.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  // 3. Add X-Tenant-Id ONLY if it's not a public or system path
  if (!isPublicPath && !isSysPath) {
    authReq = authReq.clone({
      setHeaders: {
        'X-Tenant-Id': tenantId
      }
    });
  }

  if (token && !isPublicPath) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
