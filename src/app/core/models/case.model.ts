import { Alert } from './alert.model';

export interface ApiResponse<T> {
  status: number;
  message: string;
  path: string;
  timestamp: string;
  data: T;
}

export type CaseStatus = 'OPEN' | 'UNDER_REVIEW' | 'ESCALATED' | 'CLOSED_SAR_FILED' | 'CLOSED_NO_ACTION' | 'CLOSED_INCONCLUSIVE';

export interface Case {
  caseCode: string;
  createdByEmail: string;
  assignedToUserCode: string;
  status: CaseStatus;
  notes: string;
  createdAt: string;
  closedAt?: string;
}

export interface CaseDetail {
  caseResponse: Case;
  alerts: Alert[];
}

export interface CreateCaseRequest {
  alertCodes: string[];
  assignedToUserCode: string;
  notes: string;
}

export interface CreateCaseResponse {
  caseCode: string;
}
