import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';

export interface UserResponse {
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  assignedCasesCount?: number;
}

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class TenantUserService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/tenant-users`;

  getComplianceOfficers(): Observable<ApiResponse<UserResponse[]>> {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.baseUrl}/complience-officers`);
  }

  registerComplianceOfficer(request: any): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(`${this.baseUrl}/compliance-officer`, request);
  }
}
