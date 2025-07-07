import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { addExpenseToDB } from '../db/db';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card, useTheme, Snackbar } from 'react-native-paper';
import Header from '../components/Header';


const AddExpenseScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      <Header title="Add Expense" showBackButton />
      <View style={{padding: 16}}>
      <Card style={styles.card}>
        <Card.Content>
          <Formik
            initialValues={{
              category: '',
              amount: '',
              date: null,
              notes: '',
              showDate: false,
            }}
            validationSchema={Yup.object({
              category: Yup.string().required('Please select a category'),
              amount: Yup.number().required('Amount is required').positive('Must be positive'),
              date: Yup.date().required('Please select a date'),
              notes: Yup.string().max(100, 'Max 100 characters'),
            })}
            onSubmit={async (values, { resetForm }) => {
                try {
                  const saveData = {
                    type: 'Debit',
                    category: values.category,
                    amount: Number(values.amount),
                    date: values.date ? values.date.toISOString() : null,
                    notes: values.notes,
                    bankName: '',
                    source: 'manual',
                  };
                  await addExpenseToDB(saveData);
                  showSnackbar('Expense added successfully!');
                  resetForm();
                  setTimeout(() => {
                    navigation.goBack();
                  }, 1500); 
                } catch (error) {
                  console.log('Error:', error);
                  Alert.alert('Error', 'Failed to save expense');
                }
            }}
          >
            {({ handleChange, handleSubmit, setFieldValue, values, errors, touched }) => (
              <View>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.category}
                    onValueChange={(itemValue) => setFieldValue('category', itemValue)}
                  >
                    <Picker.Item label="Select Category" value="" />
                    <Picker.Item label="Food" value="Food" />
                    <Picker.Item label="Travel" value="Travel" />
                    <Picker.Item label="Shopping" value="Shopping" />
                    <Picker.Item label="Bills" value="Bills" />
                    <Picker.Item label="Entertainment" value="Entertainment" />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>
                {errors.category && touched.category && <Text style={styles.error}>{errors.category}</Text>}

                <View style={styles.spacer} />

                <Text style={styles.label}>Amount</Text>
                <TextInput
                  placeholder="Enter amount"
                  value={values.amount?.toString()}
                  onChangeText={(text) => setFieldValue('amount', text.replace(/[^0-9.]/g, ''))}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
                {errors.amount && touched.amount && <Text style={styles.error}>{errors.amount}</Text>}

                <View style={styles.spacer} />

                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  onPress={() => setFieldValue('showDate', true)}
                  style={styles.datePickerContainer}
                >
                  <Text style={styles.dateText}>
                    {values.date ? values.date.toDateString() : 'Select Date'}
                  </Text>
                </TouchableOpacity>
                {errors.date && touched.date && <Text style={styles.error}>{errors.date}</Text>}

                {values.showDate && (
                  <DateTimePicker
                    value={values.date || new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(event: any, selectedDate: any) => {
                      setFieldValue('showDate', false);
                      if (selectedDate) setFieldValue('date', selectedDate);
                    }}
                  />
                )}

                <View style={styles.spacer} />

                <Text style={styles.label}>Notes</Text>
                <TextInput
                  placeholder="Optional notes"
                  value={values.notes}
                  onChangeText={handleChange('notes')}
                  multiline
                  numberOfLines={4}
                  style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
                />
                {errors.notes && touched.notes && <Text style={styles.error}>{errors.notes}</Text>}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleSubmit as any}
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Add Expense</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
      </View>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#f4f7fa' },
  card: { paddingVertical: 8, borderRadius: 12, elevation: 3, backgroundColor: '#fff', marginTop: '4%' },
  label: { marginBottom: 6, fontWeight: '600', color: '#333' },
  pickerContainer: {
    backgroundColor: '#f0f4f7',
    borderRadius: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#f0f4f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerContainer: {
    backgroundColor: '#f0f4f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: { color: '#333' },
  error: { color: 'red', marginTop: 4, fontSize: 10.5 },
  spacer: { height: 16 },
  buttonContainer: { marginTop: 24 },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
});
