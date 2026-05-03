import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ScenarioParam, ScenarioParamUploadRequest } from '../models/scenario-param.model';
import { ApiResponse } from '../models/auth.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ScenarioParamService {
  private http = inject(HttpClient);
  private readonly API_BASE = `${API_CONFIG.BASE_URL}/sceario-param`;

  getAllScenarioParams(): Observable<ScenarioParam[]> {
    return this.http
      .get<ApiResponse<ScenarioParam[]>>(this.API_BASE)
      .pipe(map((response) => response.data));
  }

  updateScenarioParam(request: ScenarioParamUploadRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(this.API_BASE, request);
  }
}
