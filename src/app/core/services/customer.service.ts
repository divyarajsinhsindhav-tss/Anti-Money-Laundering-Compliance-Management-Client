import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { CustomerError, CustomerJob, CustomerStats } from '../models/customer.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/tenants`;

  getUploadStats(): Observable<ApiResponse<CustomerStats>> {
    return this.http.get<ApiResponse<CustomerStats>>(`${this.baseUrl}/customer-stats`);
  }

  getCustomerJobs(): Observable<ApiResponse<CustomerJob[]>> {
    return this.http.get<ApiResponse<CustomerJob[]>>(`${this.baseUrl}/customer-jobs`);
  }

  uploadCustomerFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${API_CONFIG.BASE_URL}/file/uploadCustomer`, formData, { responseType: 'text' });
  }

  getCustomerErrors(page: number = 0, size: number = 10, jobId?: string): Observable<ApiResponse<any>> {
    const params: any = { page: page.toString(), size: size.toString() };
    if (jobId) params.jobId = jobId;
    
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/customer-errors`, { params });
  }
}
