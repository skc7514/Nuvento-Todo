export interface ExpenseItem {
  id?: number;
  type: 'Credit' | 'Debit';
  category: string;
  amount: number;
  date: string;
  notes?: string;
  bankName?: string;
  source?: 'sms' | 'manual';
}
