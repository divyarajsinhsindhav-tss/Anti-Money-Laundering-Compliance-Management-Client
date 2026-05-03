import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { MENU_CONFIG } from '../../core/config/menu.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  isOpen = input<boolean>(true);
  toggle = output<void>();

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  menuItems = computed(() => {
    const user = this.authService.user();
    const tenant = this.authService.tenantId() || 'public';
    const role = (user?.role || '').trim();

    if (!role) return [];

    const prefix = tenant === 'public' || !tenant ? '/sys' : `/${tenant}`;

    return MENU_CONFIG.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      if (item.roles.includes(role)) return true;

      const normalizedUserRole = role.replace(/^ROLE_/, '').toUpperCase();
      return item.roles.some((r) => {
        const normalizedItemRole = r.replace(/^ROLE_/, '').toUpperCase();
        return normalizedItemRole === normalizedUserRole;
      });
    }).map((item) => ({
      ...item,
      fullPath: `${prefix}/${item.path}`,
    }));
  });
}
