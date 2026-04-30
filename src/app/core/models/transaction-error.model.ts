export interface TransactionError {
  error_id: number;
  job_id: string;
  txn_no: string;
  raw_row: string;
  raw_row_data?: TransactionRawData;
  critical_errors: string[];
  warning_errors: string[];
  created_at: string;
  _expanded?: boolean;
}

export interface TransactionRawData {
  staging_id: number;
  job_id: string;
  txn_no: string;
  account_number: string;
  amount: string;
  txn_type: string;
  direction: string;
  counterparty_account_no: string;
  counterparty_bank_ifsc: string;
  swift_code: string;
  txn_timestamp: string;
  country_code: string;
}
