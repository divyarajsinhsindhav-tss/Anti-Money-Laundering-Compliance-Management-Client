export interface TenantAvailableResponse {
  available?: boolean;
  isAvailable?: boolean;
}

export interface TenantRegistrationRequest {
  tenantCode: string;
  name: string;
  displayName: string;
  onboardedByAdminId?: string;
  adminRegistrationRequest: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  };
}

export interface TenantResponse {
  tenantId: string;
  tenantCode: string;
  name: string;
  displayName: string;
  schemaName: string;
  status: string;
}

export interface ScenarioResponse {
  scenarioId: string;
  scenarioCode: string;
  scenarioName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobRecordResponse {
  jobId: string;
  jobType: string;
  status: string;
  startedAt: string;
  completedAt: string;
  createdAt: string;
}

export interface TenantDetailResponse {
  tenant: TenantResponse;
  subscribedScenarios: ScenarioResponse[];
  jobRunCount: number;
  jobHistory: JobRecordResponse[];
  storageMetrics?: {
    customerTableSize: string;
    transactionTableSize: string;
    totalSchemaSize: string;
  };
}

