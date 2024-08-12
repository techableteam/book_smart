// InvoiceGenerationScreen.js
import React, { useEffect } from 'react';
import BackgroundTask from 'react-native-background-task';
import cron from 'react-native-cron';
import { fetchInvoices } from '../utils/useApi';

const InvoiceGenerationScreen = () => {
  useEffect(() => {
    // Schedule the invoice generation task
    console.log(new Date());
    
    cron.schedule('0 18 * * 6', () => {
      BackgroundTask.schedule({
        taskKey: 'generateInvoice',
        delay: 0,
      });
    });

    // Clean up the cron job when the screen unmounts
    return () => {
      cron.cancel();
    };
  }, []);

  // Function to generate the invoice
  const generateInvoice = async () => {
    try {
      // Fetch data and generate the invoice
      const invoiceData = await fetchInvoices(1);
      generatePdfInvoice(invoiceData);
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  // Register the background task
  BackgroundTask.define(async () => {
    await generateInvoice();
    BackgroundTask.finish();
  });

  return null; // This screen doesn't need any UI elements
};

export default InvoiceGenerationScreen;
