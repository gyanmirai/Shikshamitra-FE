'use client';

import React, { useState } from 'react';
import { StyleSheet } from '@react-pdf/renderer';

import { Divider, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import TemplateOne from './Templates/templates-one';
import TemplateTwo from './Templates/templates-two';

const predefinedTemplates = [
  {
    id: 1,
    name: 'Primary Fee Receipt',
    header: {
      showLogo: true,
      logoUrl:
        'data:image/png;base64,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', // Placeholder for logo
      title: 'Primary School Fee Receipt',
      subtitle: 'For Primary Students',
    },
    body: {
      includeTable: true,
      fields: ['Student Name', 'Class', 'Fee Amount', 'Date'],
    },
    footer: {
      showSignature: true,
      note: 'Thank you for your payment.',
    },
    styles: {
      fontFamily: 'Arial',
      fontSize: 12,
      primaryColor: '#0000FF',
    },
  },
  {
    id: 2,
    name: 'Secondary Fee Receipt',
    header: {
      showLogo: true,
      logoUrl: 'https://via.placeholder.com/150', // Placeholder for logo
      title: 'Secondary School Fee Receipt',
      subtitle: 'For Secondary Students',
    },
    body: {
      includeTable: true,
      fields: ['Student Name', 'Class', 'Fee Amount', 'Due Date'],
    },
    footer: {
      showSignature: true,
      note: 'Please keep this receipt for your records.',
    },
    styles: {
      fontFamily: 'Times New Roman',
      fontSize: 14,
      primaryColor: '#FF0000',
    },
  },
];

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

const FinanceCreateReceiptSetting = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(predefinedTemplates[0]);
  const fullScreen = useBoolean();
  const columns = ['Fee Head', 'Month', 'Amount'];
  const data = [
    { feeHead: 'Library Fee', month: 'January', amount: 1000 },
    { feeHead: 'Library Fee', month: 'February', amount: 1000 },
    { feeHead: 'Library Fee', month: 'March', amount: 1000 },
  ];
  return (
    <>
      {/* Top Bar: Template Previews */}
      <Typography variant="h5" mb={3}>
        Select a Template to View
      </Typography>

      {/* Template Grid */}
      <TemplateOne />
      <TemplateTwo />

      <Divider />

      {/* <PDFViewer style={{ height: '100%', width: '100%' }}>
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
                                    <View style={styles.tableCol} key={index}>
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
                             
                                <Text style={styles.typography}><Text style={{ fontWeight: 'bold' }}>Pending Fees: </Text>{1000}</Text>
                            </View>

                            <View style={styles.rightColumn}>
                                <Text style={styles.totalText}>
                                    <Text style={{ fontWeight: 'bold' }}>Total: </Text>{400}
                                </Text>
                                <Text style={styles.inWords}>
                                    (In Words: {numberToWords(400)} Rupees Only)
                                </Text>

                                <Text style={styles.separator}>_________________________</Text>
                                <Text style={styles.receiverSign}>Receiver Sign</Text>
                            </View>
                        </View>

                    </Page>
                </Document>
            </PDFViewer> */}
    </>
  );
};

export default FinanceCreateReceiptSetting;
