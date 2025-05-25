import React from 'react';
import dayjs from 'dayjs';
import { Page, Text, View, Document, PDFViewer, StyleSheet } from '@react-pdf/renderer';

import type { IChargesReceiptPDFProps } from './charges-receipt-interface';

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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
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
    paddingTop: 8,
    backgroundColor: '#f0f0f0', // light gray for visual separation
  },

  container: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  leftColumn: { flex: 1, marginRight: 10 },
  rightColumn: { flex: 1, alignItems: 'flex-end' },
  totalText: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  inWords: { fontSize: 12, marginBottom: 10 },
  separator: { fontSize: 12, marginBottom: 5 },
  receiverSign: { fontSize: 12, fontStyle: 'italic' },
});

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
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ` ${a[num % 10]}` : '');
  if (num < 1000)
    return `${a[Math.floor(num / 100)]} Hundred${num % 100 !== 0 ? ` and ${numberToWords(num % 100)}` : ''}`;
  if (num < 100000)
    return `${numberToWords(Math.floor(num / 1000))} Thousand${num % 1000 !== 0 ? ` ${numberToWords(num % 1000)}` : ''}`;
  return num.toString();
};

const ChargesReceiptPDF: React.FC<IChargesReceiptPDFProps> = ({ from, to, selectedCharges }) => {
  const getPaymentDetail = (row: any) => {
    if (row.paymentMode === 'Cheque') {
      return `Cheque No: ${row.chequeNo.toUpperCase() || '-'} / Bank: ${row.bank.toUpperCase() || '-'}`;
    }
    if (row.paymentMode === 'Online' || row.paymentMode === 'UPI') {
      return `Txn ID: ${row.transectionId.toUpperCase() || '-'}`;
    }
    return '-';
  };

  // const totalReceived = selectedFees.reduce((sum, row) => sum + (row.receivedAmount || 0), 0);

  return (
    <PDFViewer width="100%" height="1000px">
      <Document>
        <Page size="A3" style={styles.page}>
          <View style={{ flex: 1 }}>
            {/* Header */}
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
                  <Text style={{ fontWeight: 'bold' }}>Name: </Text>
                  {to.name}
                </Text>
                <Text style={styles.typography}>
                  <Text style={{ fontWeight: 'bold' }}>Class: </Text>
                  {to.className}
                </Text>
                <Text style={styles.typography}>
                  <Text style={{ fontWeight: 'bold' }}>Roll No: </Text>
                  {to.rollNo}
                </Text>
              </View>
            </View>

            {/* Late Fee Charges Table */}
            {selectedCharges.some((row) => row.type === 'late') && (
              <>
                <Text style={styles.sectionTitle}>Late Fee Charges</Text>
                <View style={styles.footer}>
                  <View style={[styles.row, styles.tableHeader]}>
                    <Text style={styles.cell}>Fee Head</Text>
                    <Text style={styles.cell}>Due Date</Text>
                    <Text style={styles.cell}>Days Overdue</Text>
                    <Text style={styles.cell}>Charge Per Day</Text>
                    <Text style={styles.cell}>Total Charges</Text>
                  </View>

                  {selectedCharges
                    .filter((row) => row.type === 'late')
                    .map((row, index) => (
                      <View style={styles.row} key={index}>
                        <Text style={styles.cell}>{row.feeHead}</Text>
                        <Text style={styles.cell}>{dayjs(row.dueDate).format('DD/MM/YYYY')}</Text>
                        <Text style={styles.cell}>{row.dayOverDue}</Text>
                        <Text style={styles.cell}>{row.chargePerDay}</Text>
                        <Text style={styles.cell}>{row.totalCharges}</Text>
                      </View>
                    ))}
                </View>
              </>
            )}

            {/* Cheque Bounce Charges Table */}
            {selectedCharges.some((row) => row.type === 'bounce') && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Cheque Bounce Charges</Text>
                <View style={styles.footer}>
                  <View style={[styles.row, styles.tableHeader]}>
                    <Text style={[styles.cell, { flex: 2 }]}>Fee Head</Text>
                    <Text style={styles.cell}>Cheque Date</Text>
                    <Text style={styles.cell}>Received Date</Text>
                    <Text style={styles.cell}>Cheque Amount</Text>
                    <Text style={styles.cell}>Bank Name</Text>
                    <Text style={styles.cell}>Bounce Charges</Text>
                  </View>

                  {selectedCharges
                    .filter((row) => row.type === 'bounce')
                    .map((row, index) => (
                      <View style={styles.row} key={index}>
                        <Text style={[styles.cell, { flex: 2 }]}>{row.feeHead}</Text>
                        <Text style={styles.cell}>
                          {dayjs(row.dateOnCheque).format('DD/MM/YYYY')}
                        </Text>
                        <Text style={styles.cell}>
                          {dayjs(row.ReceivedChequeDate).format('DD/MM/YYYY')}
                        </Text>
                        <Text style={styles.cell}>{row.chequeAmount}</Text>
                        <Text style={styles.cell}>{row.bankName}</Text>
                        <Text style={styles.cell}>{row.totalCharges}</Text>
                      </View>
                    ))}
                </View>
              </>
            )}
          </View>

          {/* Footer Section at Bottom */}
          <View style={styles.container}>
            <View style={styles.rightColumn}>
              <Text style={styles.totalText}>
                <Text style={{ fontWeight: 'bold' }}>Total Paid: 900 </Text>-
              </Text>
              <Text style={styles.inWords}>(In Words: {numberToWords(900)} Rupees Only)</Text>
              <Text style={styles.typography}>{dayjs().format('DD/MM/YYYY')}</Text>
              <Text style={styles.separator}>_________________________</Text>
              <Text style={styles.receiverSign}>Receiver Sign</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default ChargesReceiptPDF;
