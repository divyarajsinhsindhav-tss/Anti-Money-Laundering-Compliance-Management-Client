import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminDashboardStats } from '../models/admin-dashboard.model';
import { ApiResponse } from '../models/auth.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/admin`;

  getDashboardStats(): Observable<ApiResponse<AdminDashboardStats>> {
    return this.http.get<ApiResponse<AdminDashboardStats>>(`${this.baseUrl}/dashboard/stats`);
  }

  getJobRecords(
    page: number,
    size: number,
    status?: string,
    tenantCode?: string,
  ): Observable<ApiResponse<any>> {
    let params: any = { page, size };
    if (status) params.status = status;
    if (tenantCode) params.tenantCode = tenantCode;
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/job-records`, { params });
  }
}
