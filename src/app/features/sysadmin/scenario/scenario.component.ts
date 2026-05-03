import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Scenario } from '../../../core/models/scenario.model';
import { ScenarioService } from '@core/services/scenario.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-scenario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './scenario.component.html',
  styleUrl: './scenario.component.css',
})
export class ScenarioComponent implements OnInit, OnDestroy {
  private scenarioService = inject(ScenarioService);
  private authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = signal('');
  scenarios = signal<Scenario[]>([]);
  isLoading = signal(true);

  isBankAdmin = computed(() => {
    const user = this.authService.user();
    return user?.role === 'BANK_ADMIN' || user?.role === 'ROLE_BANK_ADMIN';
  });

  filteredScenarios = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.scenarios().filter(
      (s) =>
        s.scenarioName.toLowerCase().includes(query) ||
        s.scenarioCode.toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.loadScenarios();
  }

  ngOnDestroy(): void {}

  loadScenarios() {
    this.isLoading.set(true);
    this.scenarioService.getAllScenarios().subscribe({
      next: (data) => {
        this.scenarios.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load scenarios', err);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  viewDetail(code: string): void {
    this.router.navigate(['/sys/scenarios', code]);
  }
}
