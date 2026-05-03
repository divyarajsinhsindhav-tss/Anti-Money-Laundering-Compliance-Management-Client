export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  data: T;
}

export interface LoginData {
  message: string;
  accessToken: string;
  tokenType: string;
  role:
    | 'SYSTEM_ADMIN'
    | 'BANK_ADMIN'
    | 'COMPLIANCE_OFFICER'
    | 'ROLE_SYSTEM_ADMIN'
    | 'ROLE_BANK_ADMIN'
    | 'ROLE_COMPLIANCE_OFFICER';
}

export type LoginResponse = ApiResponse<LoginData>;

export interface User {
  name?: string;
  email: string;
  role: string;
  tenantId?: string;
}
