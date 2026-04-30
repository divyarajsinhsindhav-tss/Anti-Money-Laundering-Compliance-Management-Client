import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  user = this.authService.user;
  activeTab = signal<'general' | 'security'>('general');
  
  passwordForm: FormGroup;
  isChangingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  constructor() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // If user info isn't available, fetch it
    if (!this.user()) {
      this.authService.fetchCurrentUser().subscribe();
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  setActiveTab(tab: 'general' | 'security'): void {
    this.activeTab.set(tab);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    const { oldPassword, newPassword } = this.passwordForm.value;
    
    this.authService.changePassword({ oldPassword, newPassword }).subscribe({
      next: (res) => {
        this.isChangingPassword.set(false);
        this.passwordSuccess.set('Password updated successfully.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.passwordError.set(err.error?.message || 'Failed to update password. Please verify your current password.');
      }
    });
  }
}
