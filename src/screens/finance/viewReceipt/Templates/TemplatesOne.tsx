import React from 'react';
import { Page, View, Text, Document, PDFViewer, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
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
  tableCell: {
    fontSize: 10,
    textAlign: 'center',
  },
  divider: {
    marginTop: 8,
    marginBottom: 8,
    height: 1,
    backgroundColor: '#bfbfbf',
  },
  section: {
    marginBottom: 10,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  typography: {
    fontSize: 12,
    marginBottom: 4,
  },
  column: {
    width: '48%',
  },
  footer: {
    marginTop: 10,
    paddingBottom: 10,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  leftColumn: {
    flex: 1,
    marginRight: 10, // Optional: to add space between columns
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end', // Align the right column's content to the right
  },

  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inWords: {
    fontSize: 12,
    marginBottom: 10,
  },
  separator: {
    fontSize: 12,
    marginBottom: 5,
  },
  receiverSign: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
const columns = ['Fee Head', 'Month', 'Amount'];
const data = [
  { feeHead: 'Library Fee', month: 'January', amount: 1000 },
  { feeHead: 'Library Fee', month: 'February', amount: 1000 },
  { feeHead: 'Library Fee', month: 'March', amount: 1000 },
];

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
    return `${
      a[Math.floor(num / 100)]
    } Hundred${num % 100 !== 0 ? ` and ${numberToWords(num % 100)}` : ''}`;
  if (num < 100000)
    return `${numberToWords(
      Math.floor(num / 1000)
    )} Thousand${num % 1000 !== 0 ? ` ${numberToWords(num % 1000)}` : ''}`;
  return num.toString();
};

interface TemplatesOneFeeReceiptProps {
  showPdf?: boolean;
}
const TemplatesOneFeeReceipt: React.FC<TemplatesOneFeeReceiptProps> = ({ showPdf }) => (
  <PDFViewer width="100%" height="600">
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.grid}>
          <View style={styles.column}>
            <Text style={styles.title}>From</Text>
            <Text style={styles.typography}>Deep Darshan Vidhya Sankool</Text>
            <Text style={styles.typography}>Dindoli - 560078</Text>
            <Text style={styles.typography}>DDVS - Secondary</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.title}>To</Text>
            <Text style={styles.typography}>
              <Text style={{ fontWeight: 'bold' }}>Name: </Text>Vishal Rameshbhai Patel
            </Text>
            <Text style={styles.typography}>
              <Text style={{ fontWeight: 'bold' }}>Class: </Text>10-A
            </Text>
            <Text style={styles.typography}>
              <Text style={{ fontWeight: 'bold' }}>Roll No: </Text>78
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.row}>
            <Text style={styles.typography}>
              <Text style={{ fontWeight: 'bold' }}>Payment Mode: </Text>Payment Gateway
            </Text>
            <Text style={styles.typography}>
              <Text style={{ fontWeight: 'bold' }}>Reference Number: </Text>09788nhgh679jlk
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.typography}>
              <Text style={{ fontWeight: 'bold' }}>Bank: </Text>Paytm
            </Text>
            <Text style={styles.typography}>
              <Text style={{ fontWeight: 'bold' }}>Date: </Text>12/10/2025
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.table}>
          <View style={styles.tableRow}>
            {columns.map((col, index) => (
              <View style={styles.tableHead} key={index}>
                <Text style={styles.tableCell}>{col}</Text>
              </View>
            ))}
          </View>

          {data.map((row, rowIndex) => (
            <View style={styles.tableRow} key={rowIndex}>
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

        <View style={styles.container}>
          <View style={styles.leftColumn}>
            <Text style={styles.typography}>
              <Text style={{ fontWeight: 'bold' }}>Pending Fees: </Text>
              {1000}
            </Text>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.totalText}>
              <Text style={{ fontWeight: 'bold' }}>Total: </Text>
              {400}
            </Text>
            <Text style={styles.inWords}>(In Words: {numberToWords(400)} Rupees Only)</Text>

            <Text style={styles.separator}>_________________________</Text>
            <Text style={styles.receiverSign}>Receiver Sign</Text>
          </View>
        </View>
      </Page>
    </Document>
  </PDFViewer>
);

export default TemplatesOneFeeReceipt;
