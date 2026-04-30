import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AmlJobService, AmlJobRequest } from '@core/services/aml-job.service';
import { ApiResponse } from '@core/models/auth.model';

@Component({
  selector: 'app-rule-engine-run',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './run.html',
  styleUrl: './run.css'
})
export class RuleEngineRunComponent {
  private amlJobService = inject(AmlJobService);
  private router = inject(Router);

  isRunningJob = signal(false);
  fromDate = signal(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  toDate = signal(new Date().toISOString().split('T')[0]);

  runRuleEngine(): void {
    const request: AmlJobRequest = {
      fromDate: this.fromDate(),
      toDate: this.toDate()
    };

    this.isRunningJob.set(true);
    this.amlJobService.executeRuleEngine(request).subscribe({
      next: (response) => {
        this.isRunningJob.set(false);
        alert('Rule Engine job started successfully. Job ID: ' + response.data?.jobId);
        this.router.navigate(['../'], { relativeTo: this.router.routerState.root.firstChild?.firstChild?.firstChild });
        // Simplified navigation for now, I'll check the exact path
        this.goBack();
      },
      error: (err) => {
        this.isRunningJob.set(false);
        alert('Failed to start Rule Engine job: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}
