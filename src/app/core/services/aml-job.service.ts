import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/models/auth.model';
import { API_CONFIG } from '../config/api.config';

export interface AmlJobRequest {
  fromDate: string;
  toDate: string;
}

export interface RuleEngineResponse {
  jobId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AmlJobService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/aml-job`;

  executeRuleEngine(request: AmlJobRequest): Observable<ApiResponse<RuleEngineResponse>> {
    return this.http.post<ApiResponse<RuleEngineResponse>>(`${this.baseUrl}/execute`, request);
  }
}
