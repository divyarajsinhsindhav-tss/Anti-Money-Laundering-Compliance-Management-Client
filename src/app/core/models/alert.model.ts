export type AlertStatus = 'OPEN' | 'IN_CASE' | 'REVIEWED' | 'ESCALATED' | 'CLOSED';

export interface Alert {
  alertCode: string;
  scenarioName: string;
  customerName: string;
  customerCode: string;
  customerIncome?: number;
  alertStatus: AlertStatus;
  createdAt: string;
}

export interface FinancialTransaction {
  txnNo: string;
  accountNo: string;
  amount: number;
  txnType: string;
  direction: string;
  counterpartyAccountNo: string;
  counterpartyBankIfsc: string;
  txnTimestamp: string;
  countryCode: string;
}

export interface Customer {
  customerCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerIncome: number;
}

export interface AlertDetail {
  alert: Alert;
  financialTransactionResponsesList: FinancialTransaction[];
  customerResponsesList: Customer[];
}
