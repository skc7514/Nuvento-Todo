import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { FAB, Card, Text, useTheme } from 'react-native-paper';
import Header from '../components/Header';
import { PieChart } from 'react-native-chart-kit';
import { fetchAndStoreBankSms } from '../services/smsService';
import { fetchExpensesFromDB } from '../db/db';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  // Function to load all expenses from the DB and update state
  const loadExpenses = async () => {
    const expenses = await fetchExpensesFromDB();
    const sortedExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAllTransactions(sortedExpenses);
    generatePieChartData(sortedExpenses);
  };

  // First time fetch SMS and then load expenses
  useEffect(() => {
    const fetchSmsAndExpenses = async () => {
      try {
        await fetchAndStoreBankSms(); // Fetch and store SMS in DB
        await loadExpenses(); // After storing, fetch expenses from DB
      } catch (err: any) {
        Alert.alert('Error Fetching SMS', err.message);
      }
    };

    fetchSmsAndExpenses();
  }, []);

  // Refresh expenses whenever the screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadExpenses);
    return unsubscribe;
  }, [navigation]);

  // Calculate total balance
  const totalBalance = allTransactions.reduce(
    (sum, txn) => sum + (txn.type === 'Credit' ? txn.amount : -txn.amount),
    0
  );

  // Calculate current month's expenses
  const monthlyExpenses = allTransactions
    .filter(txn => txn.type === 'Debit' && new Date(txn.date).getMonth() === new Date().getMonth())
    .reduce((sum, txn) => sum + txn.amount, 0);

  // Generate data for Pie Chart based on Debit transactions
  const generatePieChartData = (transactions: any[]) => {
    const categoryMap: { [key: string]: number } = {};
    let total = 0;

    transactions
      .filter(txn => txn.type === 'Debit')
      .forEach(txn => {
        const category = txn.category || 'Other';
        categoryMap[category] = (categoryMap[category] || 0) + txn.amount;
        total += txn.amount;
      });

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#A4DD00'];
    const data = Object.entries(categoryMap).map(([category, amount], index) => ({
      name: `${category} (${((amount / total) * 100).toFixed(1)}%)`,
      amount,
      color: colors[index % colors.length],
      legendFontColor: '#777',
      legendFontSize: 10,
    }));

    setPieData(data);
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}> 
      <Header title="Dashboard" showBackButton={false} />

      {allTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 16, color: '#555' }}>No data found</Text>
        </View>
      ) : (
        <FlatList
          data={allTransactions.slice(0, 5)}
          keyExtractor={(item, index) => `${item.id || item.source}-${index}`}
          ListHeaderComponent={
            <>
              <View style={styles.summaryContainer}>
                <Card style={styles.summaryCard}>
                  <Card.Content>
                    <Text variant="labelMedium" style={styles.summaryTitle}>Total Balance</Text>
                    <Text variant="titleMedium" style={[styles.summaryValue, { color: colors.primary }]}>₹ {totalBalance.toFixed(2)}</Text>
                  </Card.Content>
                </Card>

                <Card style={styles.summaryCard}>
                  <Card.Content>
                    <Text variant="labelMedium" style={styles.summaryTitle}>Monthly Expenses</Text>
                    <Text variant="titleMedium" style={[styles.summaryValue, { color: colors.primary }]}>₹ {monthlyExpenses.toFixed(2)}</Text>
                  </Card.Content>
                </Card>
              </View>

              <View style={styles.headerContainer}>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>Last 5 Transactions</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                  <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary, textDecorationLine: 'underline', fontWeight: '600' }]}>View All</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <Card style={styles.transactionItem}>
              <Card.Content>
                <View style={styles.headerContainer}>
                  <Text variant="bodyLarge" style={[styles.amount, { color: item.type === 'Credit' ? colors.primary : colors.error }]}> 
                    {item.type === 'Credit' ? '+' : '-'} ₹{item.amount}
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryTitle}>{item.category}</Text>
                </View>
                <Text variant="bodySmall" style={styles.description}>{item.description || item.notes}</Text>
                <Text variant="labelSmall" style={styles.details}>
                  {[item.bankName, item.source?.toUpperCase() || 'DB', item.date ? new Date(item.date).toLocaleString() : 'No Date'].filter(Boolean).join(' | ')}
                </Text>
              </Card.Content>
            </Card>
          )}
          ListFooterComponent={
            <PieChart
              data={pieData.length ? pieData : [{ name: 'No Data', amount: 1, color: '#ccc', legendFontColor: '#7F7F7F', legendFontSize: 10 }]}
              width={screenWidth}
              height={220}
              chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
              hasLegend={true}
              accessor={'amount'}
              backgroundColor={'transparent'}
              paddingLeft={'15'}
              absolute
            />
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddExpense')}
        color="white"
      />
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  screenContainer: { flex: 1, position: 'relative', backgroundColor: '#f4f7fa' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 16, marginTop: '4%' },
  summaryCard: { flex: 1, margin: 8, borderRadius: 12, elevation: 3 },
  summaryTitle: { marginBottom: 4 },
  summaryValue: { marginTop: 4 },
  sectionTitle: { marginBottom: 12, marginTop: 10, paddingHorizontal: 16 },
  transactionItem: { marginHorizontal: 16, marginBottom: 8, borderRadius: 0, elevation: 1 },
  amount: { marginBottom: 4 },
  description: { marginBottom: 2 },
  details: { color: '#777' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
});
