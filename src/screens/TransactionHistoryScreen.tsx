import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Card, Text, useTheme, Snackbar } from 'react-native-paper';
import Header from '../components/Header';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { fetchExpensesFromDB, deleteExpense } from '../db/db';
import { ExpenseItem } from '../types/types';

const TransactionHistoryScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<(ExpenseItem & { source: string })[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setRefreshing(true);
    try {
      const manualData = await fetchExpensesFromDB();
      const combined = manualData
        .map(e => ({ ...e, source: 'manual' }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(combined);
    } catch (error) {
      console.error('Error loading transactions:', error);
      showSnackbar('Error loading transactions.');
    }
    setRefreshing(false);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleDelete = async (expenseId: number) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(expenseId);
            setTransactions(prev => prev.filter(txn => txn.id !== expenseId));
            showSnackbar('Expense deleted.');
          } catch (error) {
            console.error('Delete error:', error);
            showSnackbar('Error deleting expense.');
          }
        },
      },
    ]);
  };

  const handleEdit = (expenseId: number) => {
    navigation.navigate('EditExpense', { expenseId });
  };

  const renderRightActions = (expenseId: number) => (
    <View style={styles.actionsContainer}>
      <Text style={[styles.actionButton, { backgroundColor: colors.error }]} onPress={() => handleDelete(expenseId)}>
        Delete
      </Text>
    </View>
  );

  const renderLeftActions = (expenseId: number) => (
    <View style={styles.actionsContainer}>
      <Text style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => handleEdit(expenseId)}>
        Edit
      </Text>
    </View>
  );

  const renderTransaction = ({ item }: { item: ExpenseItem & { source: string } }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      renderLeftActions={() => renderLeftActions(item.id)}
    >
      <Card style={styles.card} key={item.id}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <Text
              variant="bodyLarge"
              style={[styles.amount, { color: item.type === 'Credit' ? colors.primary : colors.error }]}
            >
              {item.type === 'Credit' ? '+' : '-'} ₹{item.amount}
            </Text>
            <Text variant="bodyMedium">{item.category}</Text>
          </View>
          <Text variant="bodySmall">{item.description || item.notes}</Text>
          <Text variant="labelSmall" style={styles.details}>
            {[
              item.bankName,
              item.source?.toUpperCase() || 'DB',
              item.date ? new Date(item.date).toLocaleString() : 'No Date',
            ]
              .filter(Boolean)
              .join(' | ')}
          </Text>
        </Card.Content>
      </Card>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
        <Header title="Transaction History" showBackButton />

        <FlatList
          data={transactions}
          keyExtractor={item => `${item.source}-${item.id || item.date}`}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTransactions} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>No transactions found.</Text>
            </View>
          }
        />

        <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>
          {snackbarMessage}
        </Snackbar>
      </View>
    </GestureHandlerRootView>
  );
};

export default TransactionHistoryScreen;

const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  listContainer: { padding: 10 },
  card: { marginBottom: 12, borderRadius: 0 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontWeight: 'bold', fontSize: 16 },
  details: { color: '#777', marginTop: 4 },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  actionButton: {
    color: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    height: '100%',
    textAlign: 'center',
    fontSize: 14,
  },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
});
