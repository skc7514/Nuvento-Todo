import SQLite from 'react-native-sqlite-storage';
import { ExpenseItem } from '../types/types'; // adjust the path based on your project

SQLite.enablePromise(true);

export const openDatabase = async () => {
  return SQLite.openDatabase({ name: 'expenses.db', location: 'default' });
};

// Create expenses table
export const initDB = async () => {
  const db = await openDatabase();
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      category TEXT,
      amount REAL,
      date TEXT,
      notes TEXT,
      bankName TEXT,
      source TEXT
    )`
  );
};

// Add new expense (manual or sms)
export const addExpenseToDB = async (expense: ExpenseItem) => {
  const db = await openDatabase();
  return db.executeSql(
    `INSERT INTO expenses (type, category, amount, date, notes, bankName, source)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      expense.type,
      expense.category,
      expense.amount,
      expense.date,
      expense.notes || '',
      expense.bankName || '',
      expense.source || 'manual',
    ]
  );
};

// Fetch all expenses
export const fetchExpensesFromDB = async (): Promise<ExpenseItem[]> => {
  const db = await openDatabase();
  const [results] = await db.executeSql('SELECT * FROM expenses ORDER BY date DESC');
  const expenses: ExpenseItem[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const item = results.rows.item(i);
    expenses.push({
      id: item.id,
      type: item.type,
      category: item.category,
      amount: item.amount,
      date: item.date,
      notes: item.notes,
      bankName: item.bankName,
      source: item.source,
    });
  }
  return expenses;
};

// Delete by id
export const deleteExpense = async (id: number) => {
  const db = await openDatabase();
  return db.executeSql('DELETE FROM expenses WHERE id = ?', [id]);
};

// Update an expense
export const updateExpense = async (expense: ExpenseItem) => {
  const db = await openDatabase();
  return db.executeSql(
    `UPDATE expenses SET type = ?, category = ?, amount = ?, date = ?, notes = ?, bankName = ?, source = ? WHERE id = ?`,
    [
      expense.type,
      expense.category,
      expense.amount,
      expense.date,
      expense.notes || '',
      expense.bankName || '',
      expense.source || 'manual',
      expense.id,
    ]
  );
};


export const checkIfTransactionExists = async (txn: { amount: number; date: Date; bank: string; }) => {
  const db = await openDatabase();

  return new Promise<boolean>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id FROM expenses WHERE amount = ? AND date = ? AND bankName = ? LIMIT 1',
        [txn.amount, txn.date.toISOString(), txn.bank],
        (_, results) => {
          resolve(results.rows.length > 0);
          return true;
        },
        (_, error) => {
          console.error('Error checking transaction:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};


// Get last SMS timestamp for incremental SMS fetch
export const getLastSmsTimestamp = async (): Promise<number> => {
  const rows = await fetchExpensesFromDB();
  const smsExpenses = rows
    .filter(e => e.source === 'sms')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return smsExpenses.length ? new Date(smsExpenses[0].date).getTime() : 0;
};
