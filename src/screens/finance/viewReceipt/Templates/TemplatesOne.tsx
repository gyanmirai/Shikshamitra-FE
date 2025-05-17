import React from 'react';
import dayjs from 'dayjs';
import { Page, View, Text, Document, PDFViewer, StyleSheet } from '@react-pdf/renderer';

// === Styles (Same as before, kept unchanged for brevity) ===
const styles = StyleSheet.create({
  page: { padding: 20 },
  table: { width: '100%', marginBottom: 10 },
  tableRow: { flexDirection: 'row' },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
  },
  tableHead: {
    width: '33.33%',
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
    backgroundColor: '#f4f6f8',
    color: 'black',
    fontWeight: 'semibold',
  },
  tableCell: { fontSize: 10, textAlign: 'center' },
  divider: { marginTop: 8, marginBottom: 8, height: 1, backgroundColor: '#bfbfbf' },
  section: { marginBottom: 10 },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  typography: { fontSize: 12, marginBottom: 4 },
  column: { width: '48%' },
  footer: { marginTop: 10, paddingBottom: 10 },
  row: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  container: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  leftColumn: { flex: 1, marginRight: 10 },
  rightColumn: { flex: 1, alignItems: 'flex-end' },
  totalText: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  inWords: { fontSize: 12, marginBottom: 10 },
  separator: { fontSize: 12, marginBottom: 5 },
  receiverSign: { fontSize: 12, fontStyle: 'italic' },
});

// === Utility ===
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

// === Props Interface ===
interface FeeRow {
  feeHead: string;
  month: string;
  amount: number;
}

interface TemplatesOneFeeReceiptProps {
  showPdf?: boolean;
  from?: {
    name?: string;
    address?: string;
    branch?: string;
  };
  to?: {
    name?: string;
    className?: string;
    rollNo?: string;
  };
  paymentDetails?: {
    mode?: string;
    reference?: string;
    bank?: string;
    date?: string;
    chequeNo?: string;
    transectionId?: string;
    chequeDate?: string;
  };
  data?: FeeRow[];
  total?: number;
  pending?: number;
}

// === Component ===
const TemplatesOneFeeReceipt: React.FC<TemplatesOneFeeReceiptProps> = ({
  showPdf = true,
  from = {
    name: 'Deep Darshan Vidhya Sankool',
    address: 'Dindoli - 560078',
    branch: 'DDVS - Secondary',
  },
  to = {
    name: 'Vishal Rameshbhai Patel',
    className: '10-A',
    rollNo: '78',
  },
  paymentDetails = {
    mode: 'Payment Gateway',
    bank: 'Paytm',
    date: '12/10/2025',
    chequeNo: '1',
    transectionId: '1234567890',
    chequeDate: '12/10/2025',
  },
  data = [
    { feeHead: 'Library Fee', month: 'January', amount: 1000 },
    { feeHead: 'Library Fee', month: 'February', amount: 1000 },
    { feeHead: 'Library Fee', month: 'March', amount: 1000 },
  ],
  total = 400,
  pending = 1000,
}) => {
  const columns = ['Fee Head', 'Month', 'Amount'];

  return (
    <PDFViewer width="100%" height="1000px">
      <Document>
        <Page size="A3" style={styles.page}>
          {/* Main Content */}
          <View style={{ flex: 1 }}>
            {/* Header Grid */}
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

            {/* Payment Details */}
            <View style={styles.footer}>
              {/* <View style={styles.row}>
                <Text style={styles.typography}>
                  <Text style={{ fontWeight: 'bold' }}>Payment Mode: </Text>{paymentDetails.mode}
                </Text>
                
              </View> */}
              <View style={styles.row}>
                {paymentDetails.mode === 'Cheque' && (
                  <View>
                    <Text style={styles.typography}>
                      <Text style={{ fontWeight: 'bold' }}>Payment Mode: </Text>
                      {paymentDetails.mode}
                    </Text>
                    <Text style={styles.typography}>
                      <Text style={{ fontWeight: 'bold' }}>Bank Name: </Text>
                      {paymentDetails.bank}
                    </Text>

                    <Text style={styles.typography}>
                      <Text style={{ fontWeight: 'bold' }}>Cheque Number: </Text>
                      {paymentDetails.chequeNo}
                    </Text>
                  </View>
                )}
                {paymentDetails.mode === 'Online' && (
                  <View>
                    <Text style={styles.typography}>
                      <Text style={{ fontWeight: 'bold' }}>Payment Mode: </Text>
                      {paymentDetails.mode}
                    </Text>
                    <Text style={styles.typography}>
                      <Text style={{ fontWeight: 'bold' }}>Transection ID: </Text>
                      {paymentDetails.transectionId}
                    </Text>
                  </View>
                )}
                <View>
                  {paymentDetails.mode === 'Cheque' && (
                    <Text style={styles.typography}>
                      <Text style={{ fontWeight: 'bold' }}>Date on Cheque: </Text>
                      {dayjs(paymentDetails.chequeDate).format('DD/MM/YYYY')}
                    </Text>
                  )}
                  <Text style={styles.typography}>
                    <Text style={{ fontWeight: 'bold' }}>Receipt Generation Date: </Text>
                    {paymentDetails.date}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Fee Table */}
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {columns.map((col, index) => (
                  <View style={styles.tableHead} key={index}>
                    <Text style={styles.tableCell}>{col}</Text>
                  </View>
                ))}
              </View>
              {data.map((row, index) => (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{row.feeHead}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{row.month}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{row.amount}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.divider} />
          </View>

          {/* Footer Section at Bottom */}
          <View style={styles.container}>
            <View style={styles.rightColumn}>
              <Text style={styles.totalText}>
                <Text style={{ fontWeight: 'bold' }}>Total: </Text>
                {total}
              </Text>
              <Text style={styles.inWords}>(In Words: {numberToWords(total)} Rupees Only)</Text>
              <Text style={styles.separator}>_________________________</Text>
              <Text style={styles.receiverSign}>Receiver Sign</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default TemplatesOneFeeReceipt;
