import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/auth.model';

import { TransactionError, TransactionJob, TransactionStats } from '../models/transaction.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/tenants`;

  getUploadStats(): Observable<ApiResponse<TransactionStats>> {
    return this.http.get<ApiResponse<TransactionStats>>(`${this.baseUrl}/transaction-stats`);
  }

  getTransactionJobs(): Observable<ApiResponse<TransactionJob[]>> {
    return this.http.get<ApiResponse<TransactionJob[]>>(`${this.baseUrl}/transaction-jobs`);
  }

  uploadTransactionFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${API_CONFIG.BASE_URL}/file/uploadTransaction`, formData, {
      responseType: 'text',
    });
  }
  getTransactionErrors(
    page: number = 0,
    size: number = 10,
    jobId?: string,
  ): Observable<ApiResponse<any>> {
    const params: any = { page: page.toString(), size: size.toString() };
    if (jobId) params.jobId = jobId;

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/transaction-errors`, { params });
  }
}
