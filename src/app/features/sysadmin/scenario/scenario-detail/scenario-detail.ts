import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ScenarioService } from '@core/services/scenario.service';
import { Scenario, RuleInfo } from '../../../../models/scenario.model';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-scenario-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownPipe],
  templateUrl: './scenario-detail.html',
  styleUrl: './scenario-detail.css',
})
export class ScenarioDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private scenarioService = inject(ScenarioService);

  scenario = signal<Scenario | null>(null);
  selectedRule = signal<RuleInfo | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  tenantSearchQuery = signal('');

  filteredTenants = computed(() => {
    const tenants = this.scenario()?.tenants || [];
    const query = this.tenantSearchQuery().toLowerCase();
    if (!query) return tenants;
    return tenants.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.tenantCode.toLowerCase().includes(query)
    );
  });

  tenantStats = computed(() => {
    const tenants = this.scenario()?.tenants || [];
    return {
      total: tenants.length,
      // Assuming all returned tenants are active for now, 
      // but we could filter by status if available
      active: tenants.length 
    };
  });

  onTenantSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.tenantSearchQuery.set(input.value);
  }

  selectRule(rule: RuleInfo | null): void {
    this.selectedRule.set(rule);
    if (rule) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('drawer-open');
  }

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('scenarioCode');
    if (code) {
      this.loadScenarioDetails(code);
    } else {
      this.error.set('No scenario code provided');
      this.isLoading.set(false);
    }
  }

  loadScenarioDetails(code: string): void {
    this.isLoading.set(true);
    this.scenarioService.getScenarioByCode(code).subscribe({
      next: (data) => {
        this.scenario.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching scenario details', err);
        this.error.set('Failed to load scenario details. It might not exist or you lack permissions.');
        this.isLoading.set(false);
      }
    });
  }
}
