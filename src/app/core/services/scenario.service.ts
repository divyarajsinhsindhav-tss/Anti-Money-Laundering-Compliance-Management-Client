import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Scenario, ScenarioPage } from '../models/scenario.model';
import { ApiResponse } from '../models/auth.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private http = inject(HttpClient);
  private readonly API_BASE = `${API_CONFIG.BASE_URL}/admin`;

  getAllScenarios(): Observable<Scenario[]> {
    return this.http.get<ApiResponse<ScenarioPage>>(`${this.API_BASE}/scenarios`).pipe(
      map(response => response.data.content)
    );
  }

  getScenarioByCode(code: string): Observable<Scenario> {
    return this.http.get<ApiResponse<Scenario>>(`${this.API_BASE}/scenario/${code}`).pipe(
      map(response => response.data)
    );
  }

  updateScenario(code: string, scenario: Partial<Scenario>): Observable<Scenario> {
    return this.http.put<ApiResponse<Scenario>>(`${this.API_BASE}/scenario/${code}`, scenario).pipe(
      map(response => response.data)
    );
  }

  assignScenario(tenantCode: string, scenarioCode: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_BASE}/assign-scenario`, { tenantCode, scenarioCode });
  }
}
