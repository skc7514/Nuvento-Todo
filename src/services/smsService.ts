import { getAllSms } from './smsReader';
import { parseSmsToTransaction } from './smsParser';
import { addExpenseToDB, getLastSmsTimestamp, checkIfTransactionExists } from '../db/db';
import { ExpenseItem } from '../types/types';

export const fetchAndStoreBankSms = async (): Promise<ExpenseItem[]> => {
  const allSms = await getAllSms();
  const lastStoredTime = await getLastSmsTimestamp();

  const newSms = allSms.filter(sms => sms.date > lastStoredTime);

  const bankSms = newSms.filter(sms =>
    /HDFCBK|ICICIBANK|SBIINB|AXISBK|KOTAK|YESBANK/i.test(sms.address)
  );

  const parsedTransactions = bankSms.map(parseSmsToTransaction);
  console.log('Parsed Transactions:', parsedTransactions);

  for (const txn of parsedTransactions) {
    const exists = await checkIfTransactionExists(txn);
    if (!exists) {
      await addExpenseToDB({
        type: txn.type === 'Credit' ? 'Credit' : 'Debit',
        category: 'CASH',
        amount: txn.amount,
        date: txn.date.toISOString(),
        notes: txn.description,
        bankName: txn.bank,
        source: 'sms',
      });
      console.log('New SMS transaction saved:', txn);
    } else {
      console.log('Duplicate SMS transaction skipped:', txn);
    }
  }

  return parsedTransactions;
};
