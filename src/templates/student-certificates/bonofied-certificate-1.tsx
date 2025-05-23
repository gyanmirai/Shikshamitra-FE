import React from 'react';
import { Page, Text, View, Document, PDFViewer, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  border: {
    border: '2px solid black',
    // padding: 10,
    borderRadius: 5,
  },
  headerContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // marginBottom: 20,

    height: '100px',
    borderBottom: '3px solid black',
    padding: 10,
  },
  schoolName: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  schoolInfo: {
    textAlign: 'center',
    fontSize: 12,
  },
  certificateTitle: {
    marginVertical: 10,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  content: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 400,
  },
  boldContent: {
    fontSize: 12,
    fontWeight: 600,
    // textDecoration: 'underline',
    // borderBottom: '1px solid black',
    width: '100%',
  },
  signature: {
    textAlign: 'right',
    marginTop: 40,
    fontSize: 12,
    borderTop: '1px solid black',
    paddingTop: 10,
  },
  image: {
    width: 70,
    height: 70,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bodyHeader: {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    // gap: '50%',
    alignItems: 'center',
    gap: '100px',
    padding: '10px',
    position: 'relative',
  },
});

// Create Document Component
export const CertificateDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.border}>
        {/* Header with School Name and Info */}
        <View style={styles.headerContainer}>
          <View>
            {/* <Text style={styles.schoolName}>DEEP DARSHAN Vidhya Sankul</Text>
            <Text style={styles.schoolInfo}>Deladva road, Dindoli, Surat-394210</Text>
            <Text style={styles.schoolInfo}>Mo.: 98250 33150</Text>
            <Text style={styles.schoolInfo}>PRE. PRIMARY (E.M.)</Text> */}
            <Text>header part</Text>
          </View>
        </View>
        <View>
          <View style={styles.bodyHeader}>
            <Text style={{ fontWeight: 600 }}>No.: 54</Text>
            <View style={{ border: '2px solid black', padding: 10, height: 'auto' }}>
              <Text>To Whom May Concern</Text>
            </View>
            <View
              style={{
                position: 'absolute',
                right: 5,
                top: 2,
                height: '90px',
                width: '75px',
                border: '1px solid black',
              }}
            >
              sds
            </View>
          </View>
        </View>

        <View style={{ padding: '0px 10px', borderBottom: '2px solid black', marginTop: '24px' }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '80px',
              padding: '4px 0px',
              alignItems: 'baseline',
            }}
          >
            <Text style={styles.content}>This is to certify that</Text>
            <View style={{ borderBottom: '1px solid black', width: '100%' }}>
              <Text style={styles.boldContent}>PANDYA KRINCY KEYUR</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '80px',
              padding: '4px 0px',
              alignItems: 'baseline',
            }}
          >
            <Text style={styles.content}>is a student of class</Text>
            <View style={{ borderBottom: '1px solid black', width: '100%' }}>
              <Text style={styles.boldContent}>PANDYA KRINCY KEYUR</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '50px',
              padding: '4px 0px',
              alignItems: 'baseline',
            }}
          >
            <Text style={styles.content}>Her Birthdate is (in figure) :</Text>
            <View style={{ borderBottom: '1px solid black', width: '100%' }}>
              <Text style={styles.boldContent}>19/10/2019</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '50px',
              padding: '4px 0px',
              alignItems: 'baseline',
            }}
          >
            <Text style={styles.content}>Her Birthdate is (in Words):</Text>
            <View style={{ borderBottom: '1px solid black', width: '100%' }}>
              <Text style={styles.boldContent}>Nineteenth October Two Thousand Nineteen</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '50px',
              padding: '4px 0px',
              alignItems: 'baseline',
            }}
          >
            <Text style={styles.content}>Her Religion or SubCaste :</Text>
            <View style={{ borderBottom: '1px solid black', width: '100%' }}>
              <Text style={styles.boldContent}>BRAHMAN and religion is Hindu</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '90px',
              padding: '4px 0px',
              alignItems: 'baseline',
            }}
          >
            <Text style={styles.content}>Her BirthPlace :</Text>
            <View style={{ borderBottom: '1px solid black', width: '100%' }}>
              <Text style={styles.boldContent}>SURAT</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '105px',
              padding: '4px 0px',
              alignItems: 'baseline',
            }}
          >
            <Text style={styles.content}>Her Gr No :</Text>
            <View style={{ borderBottom: '1px solid black', width: '100%' }}>
              <Text style={styles.boldContent}>2244</Text>
            </View>
          </View>
        </View>

        {/* Date, Place, and Signature */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: '10px',
          }}
        >
          <Text style={{ fontSize: '12px' }}>Date: 23/04/2024</Text>
          <Text style={{ fontSize: '12px' }}>Place: Surat, Gujarat</Text>
          <View style={styles.signature}>
            <Text>Principal Sign</Text>
          </View>
        </View>

        {/* Additional Info */}
      </View>

      {/* Image (if necessary) */}
      {/* <Image
      style={styles.image}
      src="/path/to/your/school-logo.png" // Use a path to your logo
    /> */}
    </Page>
  </Document>
);

const BonofiedCertificateTemplate1 = () => (
  <div>
    <PDFViewer width="100%" height="600">
      <CertificateDocument />
    </PDFViewer>
    {/* <PDFDownloadLink document={<CertificateDocument />} fileName="Bonafide_Certificate.pdf">
      {({ loading }) => (loading ? 'Generating PDF...' : 'Download Certificate')}
    </PDFDownloadLink> */}
  </div>
);

export default BonofiedCertificateTemplate1;
