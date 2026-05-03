import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 3000,
  ) {
    this.toastSubject.next({ message, type, duration });
    setTimeout(() => {
      this.clear();
    }, duration);
  }

  error(message: string, duration: number = 5000) {
    this.show(message, 'error', duration);
  }

  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  clear() {
    this.toastSubject.next(null);
  }
}
