import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService } from '@core/services/tenant.service';
import { ScenarioService } from '@core/services/scenario.service';
import { Scenario } from '../../../../core/models/scenario.model';
import { TenantDetailResponse } from '@core/models/tenant.model';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-detail.html',
  styleUrl: './tenant-detail.css',
})
export class TenantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tenantService = inject(TenantService);
  private scenarioService = inject(ScenarioService);

  tenantDetail = signal<TenantDetailResponse | null>(null);
  activeTab = signal<'overview' | 'scenarios' | 'jobs'>('overview');
  isLoading = signal(true);
  error = signal<string | null>(null);
  jobSearchQuery = signal('');
  today = new Date();

  // Scenario Assignment
  isAssignModalOpen = signal(false);
  availableScenarios = signal<Scenario[]>([]);
  isAssigning = signal(false);

  filteredJobHistory = computed(() => {
    const history = this.tenantDetail()?.jobHistory || [];
    const query = this.jobSearchQuery().toLowerCase();
    
    if (!query) return history;
    
    return history.filter(job => 
      job.jobType.toLowerCase().includes(query) || 
      job.status.toLowerCase().includes(query) ||
      job.jobId.toLowerCase().includes(query)
    );
  });

  jobStats = computed(() => {
    const history = this.tenantDetail()?.jobHistory || [];
    return {
      total: history.length,
      completed: history.filter(j => j.status === 'SUCCESS' || j.status === 'COMPLETED').length,
      failed: history.filter(j => j.status === 'FAILED' || j.status === 'FAILURE').length,
      pending: history.filter(j => j.status === 'PENDING' || j.status === 'RUNNING').length
    };
  });

  ngOnInit(): void {
    const tenantCode = this.route.snapshot.paramMap.get('tenantCode');
    if (tenantCode) {
      this.loadTenantDetail(tenantCode);
    } else {
      this.error.set('No tenant code provided');
      this.isLoading.set(false);
    }
  }

  loadTenantDetail(tenantCode: string) {
    this.isLoading.set(true);
    this.tenantService.getTenantDetail(tenantCode).subscribe({
      next: (response) => {
        if (response.status === 200 || response.data) {
          this.tenantDetail.set(response.data);
        } else {
          this.error.set(response.message || 'Failed to load tenant details');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading tenant detail', err);
        this.error.set('Failed to connect to the server');
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/sys/tenants']);
  }

  // Scenario Assignment Methods
  openAssignModal() {
    this.isAssignModalOpen.set(true);
    this.loadAvailableScenarios();
  }

  closeAssignModal() {
    this.isAssignModalOpen.set(false);
  }

  loadAvailableScenarios() {
    this.scenarioService.getAllScenarios().subscribe({
      next: (scenarios) => {
        // Filter out scenarios that are already subscribed
        const subscribedCodes = new Set(this.tenantDetail()?.subscribedScenarios?.map(s => s.scenarioCode) || []);
        this.availableScenarios.set(scenarios.filter(s => !subscribedCodes.has(s.scenarioCode)));
      },
      error: (err) => console.error('Error loading available scenarios', err)
    });
  }

  assignScenario(scenarioCode: string) {
    const tenantCode = this.tenantDetail()?.tenant?.tenantCode;
    if (!tenantCode) return;

    this.isAssigning.set(true);
    this.scenarioService.assignScenario(tenantCode, scenarioCode).subscribe({
      next: () => {
        this.isAssigning.set(false);
        this.closeAssignModal();
        this.loadTenantDetail(tenantCode); // Refresh details
      },
      error: (err) => {
        console.error('Error assigning scenario', err);
        this.isAssigning.set(false);
      }
    });
  }
}


