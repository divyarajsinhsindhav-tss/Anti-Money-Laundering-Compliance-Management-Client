import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TenantService } from '@core/services/tenant.service';
import { Scenario } from '@core/models/scenario.model';
import { ApiResponse } from '@core/models/auth.model';
import { AmlJobService, AmlJobRequest } from '@core/services/aml-job.service';

@Component({
  selector: 'app-rule-engine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rule-engine.component.html',
  styleUrl: './rule-engine.component.css'
})
export class RuleEngineComponent implements OnInit {
  private tenantService = inject(TenantService);
  private amlJobService = inject(AmlJobService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  scenarios = signal<Scenario[]>([]);
  isLoading = signal(true);
  isRunningJob = signal(false);
  totalElements = signal(0);
  page = signal(0);
  size = signal(10);
  
  totalScenarios = signal(0);
  totalRuns = signal(0);

  ngOnInit(): void {
    this.fetchScenarios();
    this.fetchStats();
  }

  fetchStats(): void {
    this.tenantService.getRuleEngineStats().subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data) {
          this.totalScenarios.set(response.data.totalScenarios || 0);
          this.totalRuns.set(response.data.totalRuns || 0);
        }
      }
    });
  }

  navigateToRun(): void {
    this.router.navigate(['run'], { relativeTo: this.route });
  }

  fetchScenarios(): void {
    this.isLoading.set(true);
    this.tenantService.getScenarios(this.page(), this.size()).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.data && response.data.content) {
          this.scenarios.set(response.data.content);
          this.totalElements.set(response.data.meta?.totalElements || 0);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch scenarios', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    return status === 'ACTIVE' 
      ? 'bg-success/5 text-success border-success/10' 
      : 'bg-secondary/5 text-secondary border-secondary/10';
  }

  getRiskColor(risk: string): string {
    switch (risk?.toUpperCase()) {
      case 'CRITICAL': return 'bg-danger/10 text-danger border-danger/20';
      case 'HIGH': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'LOW': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  }
}
