import React from 'react';
import dayjs from 'dayjs';
import { Page, Text, View, Document, PDFViewer, StyleSheet } from '@react-pdf/renderer';

import { formatNumber } from 'src/utils/formate_number';

import type { IFeeRefundReceiptPDFProps } from './fee-refund-receipt-interface';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    width: '45%',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typography: {
    fontSize: 11,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 6,
    textDecoration: 'underline',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  cell: {
    fontSize: 10,
    padding: 2,
    flex: 1,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  tableHeader: {
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 4,
    backgroundColor: '#f0f0f0',
  },
  container: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  rightColumn: { flex: 1, alignItems: 'flex-end' },
  totalText: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  inWords: { fontSize: 12, marginBottom: 10 },
  separator: { fontSize: 12, marginBottom: 5 },
  receiverSign: { fontSize: 12, fontStyle: 'italic' },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
});

// Convert numbers to words (simple)
const numberToWords = (num: number): string => {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ` ${a[num % 10]}` : '');
  if (num < 1000)
    return `${a[Math.floor(num / 100)]} Hundred${num % 100 ? ` and ${numberToWords(num % 100)}` : ''}`;
  if (num < 100000)
    return `${numberToWords(Math.floor(num / 1000))} Thousand${num % 1000 ? ` ${numberToWords(num % 1000)}` : ''}`;
  return num.toString();
};

const FeeRefundReceiptPDF: React.FC<IFeeRefundReceiptPDFProps> = ({
  from,
  to,
  selectedCharges,
  paymentDetails,
}) => {
  // Calculate total refunded amount from all selected charges
  const totalRefunded = selectedCharges.reduce((sum, row) => sum + (row.refundedAmount || 0), 0);

  // Renders payment details section based on payment mode (Cash/Cheque/Online/UPI)
  const renderPaymentDetails = () => {
    const mode = paymentDetails.paymentMode;

    // Helper function to format and display payment detail rows
    const getFormattedRows = (rows: { label: string; value?: string }[]) => (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {rows.map((row, index) => (
          <Text key={index} style={[styles.typography, { flexGrow: 1, marginBottom: 4 }]}>
            <Text style={{ fontWeight: 'bold' }}>{row.label}:</Text> {row.value || '-'}
          </Text>
        ))}
      </View>
    );

    // Return different payment details based on payment mode
    switch (mode) {
      case 'Cash':
        return getFormattedRows([{ label: 'Payment Mode', value: 'Cash' }]);
      case 'Cheque':
        return getFormattedRows([
          { label: 'Payment Mode', value: 'Cheque' },
          { label: 'Cheque No', value: paymentDetails.chequeNo },
          { label: 'Bank', value: paymentDetails.bank },
          {
            label: 'Date on Cheque',
            value: paymentDetails.dateOnCheque
              ? dayjs(paymentDetails.dateOnCheque).format('DD/MM/YYYY')
              : '-',
          },
        ]);
      case 'Online':
      case 'UPI':
        return getFormattedRows([
          { label: 'Payment Mode', value: mode },
          { label: 'Transaction ID', value: paymentDetails.transectionId },
        ]);
      default:
        return null;
    }
  };

  return (
    <PDFViewer width="100%" height="1000px">
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header Section */}
          <View style={styles.grid}>
            <View style={styles.column}>
              <Text style={styles.title}>From</Text>
              <Text style={styles.typography}>{from.name}</Text>
              <Text style={styles.typography}>{from.address}</Text>
              <Text style={styles.typography}>{from.branch}</Text>
            </View>

            <View style={styles.column}>
              <Text style={styles.title}>To</Text>
              <Text style={styles.typography}>
                <Text style={{ fontWeight: 'bold' }}>Name:</Text> {to.name}
              </Text>
              <Text style={styles.typography}>
                <Text style={{ fontWeight: 'bold' }}>Class:</Text> {to.className}
              </Text>
              <Text style={styles.typography}>
                <Text style={{ fontWeight: 'bold' }}>Roll No:</Text> {to.rollNo}
              </Text>
            </View>
          </View>
          {/* Payment Mode Details */}
          <Text style={styles.sectionTitle}>Payment Details</Text>
          {renderPaymentDetails()}
          {/* Refund Table */}
          {selectedCharges.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Refund Details</Text>
              <View>
                <View style={[styles.row, styles.tableHeader]}>
                  <Text style={styles.cell}>Fee Head</Text>
                  <Text style={styles.cell}>Refunded Amount</Text>
                </View>

                {selectedCharges.map((row, index) => (
                  <View style={styles.row} key={index}>
                    <Text style={styles.cell}>{row.feeHead}</Text>
                    <Text style={styles.cell}>{row.refundedAmount}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Footer Summary */}
          <View style={{ flexGrow: 1 }} />
          <View style={styles.container}>
            <View style={styles.rightColumn}>
              <Text style={styles.totalText}>
                Total Refunded: {formatNumber(totalRefunded, 'INR')}
              </Text>
              <Text style={styles.inWords}>
                (In Words: {numberToWords(totalRefunded)} Rupees Only)
              </Text>
              <Text style={styles.typography}>{dayjs().format('DD/MM/YYYY')}</Text>
              <Text style={styles.separator}>_________________________</Text>
              <Text style={styles.receiverSign}>Receiver Signature</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default FeeRefundReceiptPDF;
