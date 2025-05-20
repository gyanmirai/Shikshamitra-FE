import React from 'react';
import { Page, Text, View, Document, PDFViewer, StyleSheet } from '@react-pdf/renderer';

import type { IFeeReceiptPDFProps } from './new-fee-receipt-interface';

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
});

const FeeReceiptPDF: React.FC<IFeeReceiptPDFProps> = ({ from, to, selectedFees }) => {
  const getPaymentDetail = (row: any) => {
    if (row.paymentMode === 'Cheque') {
      return `Cheque No: ${row.chequeNo.toUpperCase() || '-'} / Bank: ${row.bank.toUpperCase() || '-'}`;
    }
    if (row.paymentMode === 'Online' || row.paymentMode === 'UPI') {
      return `Txn ID: ${row.transectionId.toUpperCase() || '-'}`;
    }
    return '-';
  };

  const totalReceived = selectedFees.reduce((sum, row) => sum + (row.receivedAmount || 0), 0);

  return (
    <PDFViewer width="100%" height="1000px">
      <Document>
        <Page size="A3" style={styles.page}>
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

          {/* Payment Table */}
          <View style={styles.footer}>
            <Text style={styles.title}>Payment Breakdown</Text>

            {/* Table Header */}
            <View style={[styles.row, { fontWeight: 'bold', borderBottom: 1, paddingBottom: 4 }]}>
              <Text style={[styles.cell, { flex: 2 }]}>Fee Head</Text>
              <Text style={styles.cell}>Month</Text>
              <Text style={styles.cell}>Due</Text>
              <Text style={styles.cell}>Received</Text>
              <Text style={[styles.cell, { flex: 1.5 }]}>Mode</Text>
              <Text style={[styles.cell, { flex: 2 }]}>Details</Text>
            </View>

            {/* Table Rows */}
            {selectedFees.map((row, index) => (
              <View style={styles.row} key={index}>
                <Text style={[styles.cell, { flex: 2 }]}>{row.feeHead}</Text>
                <Text style={styles.cell}>{row.month}</Text>
                <Text style={styles.cell}>{row.dueAmount}</Text>
                <Text style={styles.cell}>{row.receivedAmount}</Text>
                <Text style={[styles.cell, { flex: 1.5 }]}>{row.paymentMode}</Text>
                <Text style={[styles.cell, { flex: 2 }]}>{getPaymentDetail(row)}</Text>
              </View>
            ))}

            {/* Total */}
            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={[styles.typography, { fontWeight: 'bold' }]}>
                Total Received: ₹{totalReceived}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default FeeReceiptPDF;
