import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../../core/services/transaction.service';
import { TransactionStats, TransactionJob } from '../../../../core/models/transaction.model';
import { ApiResponse } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
})
export class FileUpload implements OnInit {
  private transactionService = inject(TransactionService);
  
  jobs = signal<TransactionJob[]>([]);
  isLoading = signal<boolean>(true);
  showUploadModal = signal(false);
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading.set(true);
    this.transactionService.getTransactionJobs().subscribe({
      next: (response: ApiResponse<TransactionJob[]>) => {
        if (response.data) {
          this.jobs.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);
    this.transactionService.uploadTransactionFile(file).subscribe({
      next: (response) => {
        console.log('Upload successful', response);
        this.isUploading.set(false);
        this.showUploadModal.set(false);
        this.selectedFile.set(null);
        this.loadJobs();
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.isUploading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-success/5 text-success border-success/10';
      case 'FAILED': return 'bg-danger/5 text-danger border-danger/10';
      case 'RUNNING':
      case 'PROCESSING': return 'bg-primary/5 text-primary border-primary/10';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  }
}
