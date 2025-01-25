import React from 'react';
import { Page, Text, View, Image, Document, PDFViewer, StyleSheet } from '@react-pdf/renderer';

import { numberToWords } from 'src/utils/numberToWords';

// PDF styles
const styles = StyleSheet.create({
  dummy: {
    flexDirection: 'row',
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    marginTop: 10,
  },
  boldText: {
    fontWeight: 900,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 4,
    textAlign: 'center',
  },
  image: {
    width: '200px',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '8px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  keyValue: {
    marginBottom: 3,
  },
  rightAligned: {
    textAlign: 'right',
  },
  centerAligned: {
    textAlign: 'center',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center', // Aligns text vertically in the center
  },
  text: {
    margin: 6, // Handles spacing between words
    fontSize: 14,
    textAlign: 'justify',
    color: '#000000',
    fontWeight: 'normal',
    marginLeft: -3, // Adjust margin to align text correctly
  },
  textBold: {
    margin: 6, // Handles spacing between words
    fontSize: 14,
    textAlign: 'justify',
    color: '#000000',
    fontWeight: 'heavy',
  },
});

const TemplateTwoPDF = () => (
  <PDFViewer width="100%" height="600">
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.centerAligned}>
            <strong>Template 2</strong>
          </Text>
          {/* Center the image */}
          <Image src="/assets/ddvs-blank-and-white.jpeg" style={styles.image} />
          <Text style={styles.centerAligned}>Dealdva Road, Dindoli Surat-394210</Text>
          <Text style={styles.centerAligned}>Mo: 98250 33150</Text>

          <View style={styles.row}>
            <View>
              <Text style={styles.keyValue}>
                <Text style={styles.boldText}>Org: </Text>DDVS - EM - PRE-PRIMARY
              </Text>

              <Text style={styles.keyValue}>
                <Text style={styles.boldText}>No.</Text>: 1219
              </Text>
              <Text style={styles.keyValue}>
                <Text style={styles.boldText}>Name</Text>: BHANDARI FERI AKSHAYKUMAR
              </Text>
              <Text style={styles.keyValue}>
                <Text style={styles.boldText}>Class</Text>: 10-A
              </Text>
            </View>
            <View>
              <Text style={styles.keyValue}>
                <Text style={styles.boldText}>Date</Text>: 29/08/2025
              </Text>
              <Text style={styles.keyValue}>
                <Text style={styles.boldText}>Year.</Text>: 2024-2025
              </Text>
              <Text style={styles.keyValue}>
                <Text style={styles.boldText}>Roll No</Text>: 98
              </Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Fee Head</Text>
              <Text style={styles.tableCell}>Paid For</Text>
              <Text style={styles.tableCell}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Sports Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>800</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Library Fee</Text>
              <Text style={styles.tableCell}>March</Text>
              <Text style={styles.tableCell}>1000</Text>
            </View>
          </View>

          {/* Total amount and formatting */}
          <View style={styles.row}>
            <Text>{numberToWords(900)} Rupees Only</Text>
            <Text style={styles.rightAligned}>Rs. 4200</Text>
          </View>

          {/* Payment details */}
          <View style={styles.section}>
            <Text style={styles.keyValue}>
              <Text style={styles.boldText}>Pay Type</Text>: Payment Gateway
            </Text>
            <Text style={styles.keyValue}>
              <Text style={styles.boldText}>Ref. No</Text>: 2837000000899
            </Text>
            <Text style={styles.keyValue}>
              <Text style={styles.boldText}>Dt</Text>: 29/05/2023
            </Text>
            <Text style={styles.keyValue}>
              <Text style={styles.boldText}>Bank</Text>: Paytm
            </Text>
          </View>

          {/* Receiver signature */}
          <Text style={styles.rightAligned}>Receiver Sign</Text>
        </View>
      </Page>
    </Document>
  </PDFViewer>
);

export default TemplateTwoPDF;
