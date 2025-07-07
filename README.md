This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

**Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

# Nuvento - Smart Expense Tracker

A smart expense tracker app built with React Native that automatically parses bank SMS and allows manual entry of expenses. Offline-first, with clean UI and intuitive features.

---

## Features Covered

* SMS reading and parsing to auto-add bank transactions
* Supports banks like HDFC, ICICI, SBI, Axis, Kotak, Yes Bank
* Manual expense entry with category, amount, date, and notes
* SQLite database for persistent offline storage
* Real-time SMS listener to detect and add new SMS transactions instantly
* Dashboard with:
  * Total Balance
  * Monthly Expenses
  * Last 5 Transactions
  * Pie Chart of expenses by category
* View complete Transaction History
* Swipe to Edit and Delete any transaction
* Basic error handling and duplicate SMS transaction prevention
* Clean UI using React Native Paper components
* Minimal state management using Zustand

---

## App Pages / Screens

* **Onboarding / Initial Setup**
  * Ask for SMS reading permission (Android only)
  * Explain basic app features
* **Dashboard**
  * Shows Total Balance and Monthly Expenses
  * Pie chart visualization of spending
  * Last 5 transactions list
  * Shortcut to add new expense
* **Add Expense**
  * Form to manually add new expenses
  * Fields: Amount, Category, Date, Notes
* **Transaction History**
  * Shows all expenses (auto and manual)
  * Swipe left to Edit or Delete an expense
* **SMS Permission Handling**
  * Prompt on first app launch if permission not granted
  * Skip if already granted

---

## Database (`/db`)

- **SQLite-powered local storage**
- **Tables:**
  - `expenses`: stores each transaction (manual and SMS)
- **Key functions:**
  - `initDB`: Create the expenses table if it does not exist
  - `addExpenseToDB`: Insert a new transaction (manual or SMS)
  - `fetchExpensesFromDB`: Fetch all stored transactions
  - `deleteExpense`: Remove a transaction by its ID
  - `updateExpense`: Update an existing transaction
  - `checkIfTransactionExists`: Prevent duplicate SMS transactions based on amount, date, and bank
  - `getLastSmsTimestamp`: Retrieve the timestamp of the last SMS transaction (used for incremental fetch)

---

## Services (`/services`)

- **SMS Parser (`smsParser.ts`)**
  - Extracts transaction details like amount, bank name, and transaction type (Credit/Debit) from SMS text

- **SMS Reader (`smsReader.ts`)**
  - Reads SMS inbox using the `react-native-get-sms-android` package

- **SMS Service (`smsService.ts`)**
  - Combines reading SMS, parsing them, checking for duplicates, and saving valid transactions to the database

- **SMS Listener (`smsListener.ts`)**
  - Listens to incoming SMS messages in real-time and automatically adds them to the database after parsing

