import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '@core/models/auth.model';
import { TenantAvailableResponse, TenantRegistrationRequest, TenantDetailResponse } from '@core/models/tenant.model';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/tenants`;

  registerTenant(request: TenantRegistrationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, request);
  }

  getAllTenants(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getTenantDetail(tenantCode: string): Observable<ApiResponse<TenantDetailResponse>> {
    return this.http.get<ApiResponse<TenantDetailResponse>>(`${this.baseUrl}/${tenantCode}`);
  }

  checkTenantAvailable(tenantCode: string): Observable<ApiResponse<TenantAvailableResponse>> {
    return this.http.get<ApiResponse<TenantAvailableResponse>>(`${this.baseUrl}/check-tenant-available`, {
      params: { tenantCode }
    });
  }

  getScenarios(page: number = 0, size: number = 10): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/scenarios`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getRuleEngineStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/rule-engine-stats`);
  }
}
