import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../../../core/services/customer.service';
import { CustomerError } from '../../../../core/models/customer.model';
import { DatePipe, CommonModule, KeyValuePipe, TitleCasePipe } from '@angular/common';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-error',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule, KeyValuePipe, TitleCasePipe, FormsModule],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class CustomerErrorComponent implements OnInit {
  private customerService = inject(CustomerService);
  protected readonly math = Math;
  
  errors = signal<CustomerError[]>([]);
  isLoading = signal<boolean>(true);

  // Pagination and Filter state
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  jobIdFilter = signal<string>('');

  ngOnInit(): void {
    this.fetchErrors();
  }

  fetchErrors(): void {
    this.isLoading.set(true);
    this.customerService.getCustomerErrors(this.currentPage(), this.pageSize(), this.jobIdFilter()).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.totalElements.set(response.data.totalElements || 0);
          this.totalPages.set(response.data.totalPages || 0);
          
          const errorList = response.data.content || (Array.isArray(response.data) ? response.data : []);
          
          const mappedErrors = errorList.map((err: any) => {
            const criticals = this.parsePostgresArray(err.criticalErrors || err.critical_errors);
            const warnings = this.parsePostgresArray(err.warningErrors || err.warning_errors);
            const rawRowStr = err.rawRow || err.raw_row;
            const parsedRaw = this.parseRawRow(rawRowStr);

            return {
              ...err,
              error_id: err.errorId || err.error_id,
              job_id: err.jobId || err.job_id,
              cif: err.identifier || err.cif,
              raw_row: rawRowStr,
              created_at: err.createdAt || err.created_at,
              raw_row_data: parsedRaw,
              critical_errors: criticals,
              warning_errors: warnings,
              _expanded: false
            };
          });
          this.errors.set(mappedErrors);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching customer errors:', error);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchErrors();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.fetchErrors();
  }

  onFilterChange(jobId: string): void {
    this.jobIdFilter.set(jobId);
    this.currentPage.set(0);
    this.fetchErrors();
  }

  private parseRawRow(rawRow: any): any {
    if (!rawRow) return null;
    if (typeof rawRow === 'object') return rawRow;
    
    try {
      return JSON.parse(rawRow);
    } catch (e) {
      try {
        let cleaned = rawRow.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1).replace(/\\"/g, '"').replace(/""/g, '"');
        }
        return JSON.parse(cleaned);
      } catch (e2) {
        return null;
      }
    }
  }

  private parsePostgresArray(arr: any): string[] {
    if (Array.isArray(arr)) return arr;
    if (!arr || typeof arr !== 'string') return [];
    return arr.replace(/[\{\}]/g, '').split(',')
      .map(x => x.trim().replace(/^"(.*)"$/, '$1'))
      .filter(x => x.length > 0);
  }
}
