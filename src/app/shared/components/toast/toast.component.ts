import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { Observable } from 'rxjs';
import { Toast } from '../../../core/models/toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements OnInit {
  toast$: Observable<Toast | null>;

  constructor(private toastService: ToastService) {
    this.toast$ = this.toastService.toast$;
  }

  ngOnInit(): void {}

  close() {
    this.toastService.clear();
  }

  getToastClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'border-success bg-success-light';
      case 'error':
        return 'border-danger bg-danger-light';
      case 'warning':
        return 'border-warning bg-warning-light';
      case 'info':
      default:
        return 'border-info bg-info-light';
    }
  }

  getTextClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'info':
      default:
        return 'text-info';
    }
  }
}
