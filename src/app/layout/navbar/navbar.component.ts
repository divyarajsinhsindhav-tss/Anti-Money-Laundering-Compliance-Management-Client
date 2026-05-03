import { Component, signal, HostListener, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HumanizeRolePipe } from '../../shared/pipes/humanize-role.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, HumanizeRolePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  authService = inject(AuthService);
  isProfileOpen = signal<boolean>(false);

  userName = computed(() => {
    const email = this.authService.user()?.email;
    return email ? email.split('@')[0] : 'User';
  });

  userInitial = computed(() => {
    const email = this.authService.user()?.email;
    return email ? email[0].toUpperCase() : 'U';
  });

  toggleProfile(event: Event) {
    event.stopPropagation();
    this.isProfileOpen.update((v) => !v);
  }

  logout() {
    this.isProfileOpen.set(false);
    this.authService.logout();
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.isProfileOpen.set(false);
  }
}
