import SmsListener from 'react-native-android-sms-listener';
import { parseSmsToTransaction } from './smsParser';
import { addExpenseToDB, checkIfTransactionExists } from '../db/db';

let subscription: any = null;

export const startSmsListener = () => {
  if (subscription) return; // prevent multiple listeners

  subscription = SmsListener.addListener(async (message: any) => {
    console.log('Received SMS:', message.body);

    const txn = parseSmsToTransaction({
      body: message.body,
      address: message.originatingAddress,
      date: Date.now(),
    });

    console.log('Parsed Transaction:', txn);

    if (!txn.amount || txn.type === 'unknown') return; // skip if not a valid txn

    const exists = await checkIfTransactionExists(txn);
    if (!exists) {
      await addExpenseToDB({
        type: txn.type === 'Credit' ? 'Credit' : 'Debit',
        category: 'CASH',
        amount: txn.amount,
        date: new Date().toISOString(),
        notes: txn.description,
        bankName: txn.bank,
        source: 'sms',
      });

      console.log('New SMS transaction saved:', txn);
    } else {
      console.log('Duplicate transaction skipped:', txn);
    }
  });

  console.log('SMS listener started.');
};

export const stopSmsListener = () => {
  if (subscription) {
    subscription.remove();
    subscription = null;
    console.log('SMS listener stopped.');
  }
};
