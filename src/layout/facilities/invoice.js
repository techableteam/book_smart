import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet, TextInput, Button, Text } from 'react-native';
import axios from 'axios';
import { fetchInvoices } from '../../utils/useApi';

const Invoice = () => {    
  const [facilityId, setFacilityId] = useState('');
  const [email, setEmail] = useState('');
  const [invoicePath, setInvoicePath] = useState('');
  const [invoice, setInvoice] = useState(null);

  // Function to generate invoice
  const generateInvoice = async () => {
      const response = await fetchInvoices(facilityId);
    setInvoicePath(response.path); // Store the invoice path
    setInvoice(response.invoice);
    Alert.alert('Success', 'Invoice generated successfully!');
  };

  // Function to send invoice
  const sendInvoice = async () => {
      try {
          await axios.post('http://95.216.240.153:5000/api/facilities/sendInvoice', {
              facilityId: parseInt(facilityId),
              email: email,
          });
          Alert.alert('Success', 'Invoice sent successfully!');
      } catch (error) {
          console.error('Error sending invoice:', error);
          Alert.alert('Error', 'Failed to send invoice.');
      }
  };

  return (
      <View style={styles.container}>
          <Text style={styles.title}>Invoice Management</Text>
          <TextInput
              style={styles.input}
              placeholder="Enter Facility ID"
              value={facilityId}
              onChangeText={setFacilityId}
              keyboardType="numeric"
          />
          <TextInput
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
          />
          <Button title="Generate Invoice" onPress={generateInvoice} />
          <Button title="Send Invoice" onPress={sendInvoice} />
          {invoicePath ? <Text>Invoice Path: {invoicePath}</Text> : null}
           {/* Display Invoice Details */}
           {invoice && (
                <View style={styles.invoiceContainer}>
                    <Text style={styles.invoiceTitle}>Invoice Details</Text>
                    <Text>Facility ID: {invoice.facilityId}</Text>
                    <Text>Facility Name: {invoice.facilityName}</Text>
                    <Text>Amount Due: ${invoice.amountDue}</Text>
                    <Text>Invoice Path: {invoice.invoicePath}</Text>
                </View>
            )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
      display: 'flex',
      justifyContent: 'center',
      padding: 20,
      marginTop: 100,
      height: 500,
      width: '100%',
      backgroundColor:'green'
  },
  title: {
      fontSize: 24,
      marginVertical: 50,
      textAlign: 'center',
      color: 'black',
      height: 30,
      width: 200
  },
  input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 15,
      paddingHorizontal: 10,
  },
  invoiceContainer: {
      marginTop: 20,
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
  },
  invoiceTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
  },
});

export default Invoice;
