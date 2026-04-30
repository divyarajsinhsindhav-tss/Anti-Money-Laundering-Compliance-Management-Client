import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CaseService } from '../../../../core/services/case.service';
import { CaseDetail } from '../../../../models/case.model';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './case-detail.component.html',
  styleUrls: ['./case-detail.component.css']
})
export class CaseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private caseService = inject(CaseService);

  caseId = signal<string | null>(null);
  caseDetail = signal<CaseDetail | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('caseId');
    if (id) {
      this.caseId.set(id);
      this.loadCaseDetail(id);
    }
  }

  loadCaseDetail(id: string): void {
    this.isLoading.set(true);
    this.caseService.getCaseDetail(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.caseDetail.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    const tenant = this.router.url.split('/')[1];
    this.router.navigate([`/${tenant}/cases`]);
  }
}
