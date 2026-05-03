import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AmlJobService, AmlJobRequest } from '@core/services/aml-job.service';
import { ScenarioParamService } from '@core/services/scenario-param.service';
import { ToastService } from '@core/services/toast.service';
import { ScenarioParam, GroupedParams } from '@core/models/scenario-param.model';
import { ApiResponse } from '@core/models/auth.model';

@Component({
  selector: 'app-rule-engine-run',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './run.html',
  styleUrl: './run.css',
})
export class RuleEngineRunComponent implements OnInit {
  private amlJobService = inject(AmlJobService);
  private scenarioParamService = inject(ScenarioParamService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isRunningJob = signal(false);
  isUpdatingParam = signal<string | null>(null);
  fromDate = signal(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
  );
  toDate = signal(new Date().toISOString().split('T')[0]);

  groupedParams = signal<GroupedParams>({});
  scenarios = signal<string[]>([]);

  ngOnInit(): void {
    this.fetchParams();
  }

  fetchParams(): void {
    this.scenarioParamService.getAllScenarioParams().subscribe({
      next: (params) => {
        const grouped: GroupedParams = {};
        params.forEach((param) => {
          // Format decimal values to 2 decimal places if applicable
          if (param.dataType === 'DECIMAL' && param.value) {
            const num = parseFloat(param.value);
            if (!isNaN(num)) {
              param.value = num.toFixed(2);
            }
          }

          if (!grouped[param.scenarioCode]) {
            grouped[param.scenarioCode] = {};
          }
          const ruleKey = param.ruleCode || 'COMMON';
          if (!grouped[param.scenarioCode][ruleKey]) {
            grouped[param.scenarioCode][ruleKey] = [];
          }
          grouped[param.scenarioCode][ruleKey].push(param);
        });
        this.groupedParams.set(grouped);
        this.scenarios.set(Object.keys(grouped));
      },
      error: (err) => {
        console.error('Failed to fetch parameters', err);
      },
    });
  }

  getRuleKeys(scenarioCode: string): string[] {
    return Object.keys(this.groupedParams()[scenarioCode] || {});
  }

  updateAllParams(): void {
    const allParams: ScenarioParam[] = [];
    Object.values(this.groupedParams()).forEach((rules) => {
      Object.values(rules).forEach((params) => {
        allParams.push(...params);
      });
    });

    if (allParams.length === 0) return;

    // Validation: No negative numbers for INT and DECIMAL
    const hasNegative = allParams.some((param) => {
      if (param.dataType === 'INT' || param.dataType === 'DECIMAL') {
        const val = parseFloat(param.value);
        return !isNaN(val) && val < 0;
      }
      return false;
    });

    if (hasNegative) {
      this.toastService.error('Negative numbers are not allowed for scenario parameters');
      return;
    }

    this.isUpdatingParam.set('ALL');

    // We update them sequentially or in parallel. Parallel is faster.
    let completedCount = 0;
    let errorCount = 0;

    allParams.forEach((param) => {
      this.scenarioParamService.updateScenarioParam(param).subscribe({
        next: () => {
          completedCount++;
          this.checkCompletion(completedCount, errorCount, allParams.length);
        },
        error: () => {
          errorCount++;
          completedCount++;
          this.checkCompletion(completedCount, errorCount, allParams.length);
        },
      });
    });
  }

  private checkCompletion(completed: number, errors: number, total: number): void {
    if (completed === total) {
      this.isUpdatingParam.set(null);
      if (errors === 0) {
        this.toastService.success('All parameters updated successfully');
      } else {
        this.toastService.error(`Updated ${total - errors} parameters. ${errors} failed.`);
      }
    }
  }

  runRuleEngine(): void {
    const request: AmlJobRequest = {
      fromDate: this.fromDate(),
      toDate: this.toDate(),
    };

    this.isRunningJob.set(true);
    this.amlJobService.executeRuleEngine(request).subscribe({
      next: (response) => {
        this.isRunningJob.set(false);
        this.toastService.success('Rule Engine job started successfully');
        this.goBack();
      },
      error: (err) => {
        this.isRunningJob.set(false);
      },
    });
  }

  goBack(): void {
    window.history.back();
  }
}
