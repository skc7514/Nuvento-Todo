import React from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { addExpenseToDB } from '../db/db';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card, useTheme } from 'react-native-paper';
import Header from '../components/Header';


const EditExpenseScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { expenseId } = route.params;

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      <Header title="Edit Expense" showBackButton />
      <View style={{padding: 16}}>
         <Text style={{textAlign: 'center', fontSize: 12}}>Edit Expense Screen for ID: {expenseId}</Text>
         <Text style={{textAlign: 'center', fontSize: 18, marginTop: 20}}>Work In Progress...</Text>
      </View>
    </View>
  );
};

export default EditExpenseScreen;

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#f4f7fa' },
});
