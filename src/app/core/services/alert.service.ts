import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { Alert, AlertDetail, AlertStatus } from '../models/alert.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/alerts`;

  getAlerts(
    page: number,
    size: number,
    status?: string,
    alertCode?: string,
  ): Observable<ApiResponse<any>> {
    let params: any = { page, size };
    if (status && status !== 'ALL') {
      params.status = status;
    }
    if (alertCode) {
      params.alertCode = alertCode;
    }
    return this.http.get<ApiResponse<any>>(this.baseUrl, { params });
  }

  getAlertDetail(alertCode: string): Observable<ApiResponse<AlertDetail>> {
    return this.http.get<ApiResponse<AlertDetail>>(`${this.baseUrl}/${alertCode}`);
  }

  updateAlertStatus(
    alertCode: string,
    status: AlertStatus,
    reason: string,
  ): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/${alertCode}/status`, {
      status,
      reason,
    });
  }
}
