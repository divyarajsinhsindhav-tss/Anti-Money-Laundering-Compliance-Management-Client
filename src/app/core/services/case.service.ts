import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/case.model';
import {
  Case,
  CaseDetail,
  CreateCaseRequest,
  CreateCaseResponse,
  UpdateCaseStatusRequest,
} from '../models/case.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class CaseService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/cases`;

  getCases(page: number, size: number, status?: string): Observable<ApiResponse<any>> {
    let params: any = { page, size };
    if (status) {
      params.status = status;
    }
    return this.http.get<ApiResponse<any>>(this.baseUrl, { params });
  }

  getCaseDetail(caseCode: string): Observable<ApiResponse<CaseDetail>> {
    return this.http.get<ApiResponse<CaseDetail>>(`${this.baseUrl}/${caseCode}`);
  }

  createCase(request: CreateCaseRequest): Observable<ApiResponse<CreateCaseResponse>> {
    return this.http.post<ApiResponse<CreateCaseResponse>>(this.baseUrl, request);
  }

  autoGenerateCases(): Observable<ApiResponse<Case[]>> {
    return this.http.post<ApiResponse<Case[]>>(`${this.baseUrl}/auto-generate`, {});
  }

  assignCase(caseCode: string, assignedToUserCode: string): Observable<ApiResponse<Case>> {
    return this.http.patch<ApiResponse<Case>>(`${this.baseUrl}/${caseCode}/assign`, null, {
      params: { assignedToUserCode },
    });
  }

  updateCaseStatus(
    caseCode: string,
    request: UpdateCaseStatusRequest,
  ): Observable<ApiResponse<CaseDetail>> {
    return this.http.patch<ApiResponse<CaseDetail>>(`${this.baseUrl}/${caseCode}/status`, request);
  }
}
