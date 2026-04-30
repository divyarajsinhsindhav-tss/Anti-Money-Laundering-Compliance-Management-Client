export interface ScenarioParameter {
  id: string;
  name: string;
  description: string;
  defaultValue: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export interface RuleInfo {
  ruleCode: string;
  ruleName: string;
  description?: string;
}

export interface TenantInfo {
  tenantCode: string;
  name: string;
}

export interface Scenario {
  id?: string;
  scenarioCode: string;
  scenarioName: string;
  description?: string;
  category?: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'ACTIVE' | 'INACTIVE';
  subscriptionsCount?: number;
  rules?: RuleInfo[];
  tenants?: TenantInfo[];
  parameters?: ScenarioParameter[];
  lastModified?: Date;
}

export interface ScenarioPage {
  content: Scenario[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
