import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../../../core/services/transaction.service';
import { TransactionError } from '../../../../core/models/transaction.model';
import { DatePipe, CommonModule, KeyValuePipe, TitleCasePipe } from '@angular/common';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule, KeyValuePipe, TitleCasePipe, FormsModule],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class TransactionErrorComponent implements OnInit {
  private transactionService = inject(TransactionService);
  protected readonly math = Math;

  errors = signal<TransactionError[]>([]);
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
    this.transactionService
      .getTransactionErrors(this.currentPage(), this.pageSize(), this.jobIdFilter())
      .subscribe({
        next: (response) => {
          try {
            if (response && response.data) {
              this.totalElements.set(response.data.totalElements || 0);
              this.totalPages.set(response.data.totalPages || 0);

              const errorList =
                response.data.content || (Array.isArray(response.data) ? response.data : []);

              const mappedErrors = errorList.map((err: any) => {
                try {
                  const criticals = this.parsePostgresArray(
                    err.criticalErrors || err.critical_errors,
                  );
                  const warnings = this.parsePostgresArray(err.warningErrors || err.warning_errors);
                  const rawRowStr = err.rawRow || err.raw_row;
                  const parsedRaw = this.parseRawRow(rawRowStr);

                  return {
                    ...err,
                    error_id: err.errorId || err.error_id,
                    id: err.errorId || err.error_id,
                    job_id: err.jobId || err.job_id,
                    txn_no: err.identifier || err.txn_no || err.transactionId,
                    transactionId: err.identifier || err.txn_no || err.transactionId,
                    raw_row: rawRowStr,
                    created_at: err.createdAt || err.created_at,
                    timestamp: err.createdAt || err.created_at,
                    errorCode: criticals[0] || 'ERROR',
                    errorMessage: warnings[0] || 'Validation Failure',
                    raw_row_data: parsedRaw,
                    critical_errors: criticals,
                    warning_errors: warnings,
                    _expanded: false,
                  };
                } catch (e) {
                  console.error('Error mapping individual record:', e, err);
                  return err;
                }
              });
              this.errors.set(mappedErrors);
            }
          } catch (e) {
            console.error('Error processing response data:', e);
          } finally {
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          console.error('Error fetching transaction errors:', error);
          this.isLoading.set(false);
          this.mockData();
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchErrors();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0); // Reset to first page
    this.fetchErrors();
  }

  onFilterChange(jobId: string): void {
    this.jobIdFilter.set(jobId);
    this.currentPage.set(0); // Reset to first page
    this.fetchErrors();
  }

  getPageRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const range: number[] = [];

    // Show max 5 pages around current page
    let start = Math.max(0, current - 2);
    let end = Math.min(total, start + 5);

    if (end - start < 5) {
      start = Math.max(0, end - 5);
    }

    for (let i = start; i < end; i++) {
      range.push(i);
    }
    return range;
  }

  private parseRawRow(rawRow: any): any {
    if (!rawRow) return null;
    if (typeof rawRow === 'object') return rawRow;

    try {
      // Handle standard JSON string
      return JSON.parse(rawRow);
    } catch (e) {
      try {
        // Handle PostgreSQL escaped JSON or bracketed format
        let cleaned = rawRow.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1).replace(/\\"/g, '"').replace(/""/g, '"');
        }
        return JSON.parse(cleaned);
      } catch (e2) {
        console.warn('Failed to parse raw_row:', rawRow);
        return null;
      }
    }
  }

  private parsePostgresArray(arr: any): string[] {
    if (Array.isArray(arr)) return arr;
    if (!arr || typeof arr !== 'string') return [];

    // Handle Postgres array format {val1,val2} or simple comma string
    return arr
      .replace(/[\{\}]/g, '')
      .split(',')
      .map((x) => x.trim().replace(/^"(.*)"$/, '$1'))
      .filter((x) => x.length > 0);
  }

  private mockData(): void {
    this.errors.set([
      {
        error_id: 1,
        id: 1,
        job_id: '908fb43a-b214-44fc-bce6-029ca8e09dee',
        txn_no: 'TXN_2024-0000001',
        transactionId: 'TXN_2024-0000001',
        raw_row: `{"staging_id":300021,"job_id":"908fb43a-b214-44fc-bce6-029ca8e09dee","txn_no":"TXN_2024-0000001","account_number":"22248195960174759","amount":"36653.47","txn_type":"DEBIT","direction":"OUT","counterparty_account_no":"7729822664222763","counterparty_bank_ifsc":"ICIC0AIRD79","swift_code":"SBININ7A","txn_timestamp":"2022-06-21 01:15:02","country_code":"IN"}`,
        raw_row_data: {
          staging_id: 300021,
          job_id: '908fb43a-b214-44fc-bce6-029ca8e09dee',
          txn_no: 'TXN_2024-0000001',
          account_number: '22248195960174759',
          amount: '36653.47',
          txn_type: 'DEBIT',
          direction: 'OUT',
          counterparty_account_no: '7729822664222763',
          counterparty_bank_ifsc: 'ICIC0AIRD79',
          swift_code: 'SBININ7A',
          txn_timestamp: '2022-06-21 01:15:02',
          country_code: 'IN',
        },
        critical_errors: ['ACCOUNT_NOT_FOUND'],
        warning_errors: ['INVALID_TXN_TYPE'],
        errorCode: 'ACCOUNT_NOT_FOUND',
        errorMessage: 'INVALID_TXN_TYPE',
        created_at: '2026-04-30 20:26:57.214174',
        timestamp: '2026-04-30 20:26:57.214174',
      },
    ]);
  }
}
