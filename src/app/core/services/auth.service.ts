import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, of, Observable, catchError, map, filter, shareReplay, finalize } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { LoginResponse, User, ApiResponse } from '@core/models/auth.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'aml_token';
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _tenantId = signal<string>(this.getTenantFromUrl());
  private currentUserRequest$: Observable<User | null> | null = null;

  public readonly user = this._user.asReadonly();
  public readonly tenantId = this._tenantId.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._token());

  constructor() {
    // Cleanup any legacy storage keys
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    // Sync tenant from URL on navigation
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this._tenantId.set(this.getTenantFromUrl());
    });

    // Optimistically load user from token if available
    this.loadUserFromToken();
  }

  private loadUserFromToken() {
    const token = this._token();
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(''),
        );

        const payload = JSON.parse(jsonPayload);
        this._user.set({
          email: payload.sub || payload.email || 'user@system',
          role:
            payload.role || (Array.isArray(payload.roles) ? payload.roles[0] : payload.roles) || '',
          tenantId: payload.tenantId || this.getTenantFromUrl(),
        });
      } catch (e) {
        console.warn('Failed to optimistically load user from token', e);
      }
    }
  }

  private getTenantFromUrl(): string {
    const path = window.location.pathname;
    const segments = path.split('/').filter((s) => s);
    if (segments.length > 0) {
      const first = segments[0];
      // Skip 'sys' and 'not-found' to treat them as public context
      return first === 'sys' || first === 'not-found' ? 'public' : first;
    }
    return 'public';
  }

  login(credentials: any, tenantId?: string) {
    let headers = new HttpHeaders();
    if (tenantId) {
      headers = headers.set('X-Tenant-Id', tenantId);
    }

    // Cleanup legacy keys on login as well
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    return this.http
      .post<LoginResponse>(`${API_CONFIG.BASE_URL}/auth/login`, credentials, { headers })
      .pipe(
        tap((response) => {
          const data = response.data;
          localStorage.setItem(this.TOKEN_KEY, data.accessToken);
          this._token.set(data.accessToken);

          // Immediately set user role and tenant in local store context
          this._user.set({
            role: data.role,
            email: credentials.email || 'user@system',
            tenantId: tenantId || 'public',
          });
        }),
      );
  }

  fetchCurrentUser(): Observable<User | null> {
    if (!this.isAuthenticated()) {
      return of(null);
    }

    if (this.currentUserRequest$) {
      return this.currentUserRequest$;
    }

    this.currentUserRequest$ = this.http
      .get<ApiResponse<User>>(`${API_CONFIG.BASE_URL}/auth/me`)
      .pipe(
        tap((response) => {
          const data = response.data;
          if (data.firstName && data.lastName) {
            data.name = `${data.firstName} ${data.lastName}`;
          }
          this._user.set(data);
        }),
        map((response) => response.data),
        catchError(() => {
          this.logout();
          return of(null);
        }),
        finalize(() => {
          this.currentUserRequest$ = null;
        }),
        shareReplay(1),
      );

    return this.currentUserRequest$;
  }

  logout() {
    const user = this._user();
    const currentTenant = this._tenantId();

    // Clear state
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    this._token.set(null);
    this._user.set(null);
    this._tenantId.set(this.getTenantFromUrl());

    // Redirect based on role and tenant context
    if (user?.role === 'SYSTEM_ADMIN' || user?.role === 'ROLE_SYSTEM_ADMIN') {
      this.router.navigate(['/sys/login']);
    } else if (currentTenant && currentTenant !== 'public') {
      this.router.navigate([`/${currentTenant}/login`]);
    } else {
      this.router.navigate(['/sys/login']);
    }
  }

  changePassword(request: {
    oldPassword: string;
    newPassword: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_CONFIG.BASE_URL}/auth/change-password`, request);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
