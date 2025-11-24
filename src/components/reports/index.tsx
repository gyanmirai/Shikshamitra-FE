import type { PageProps, DocumentProps } from '@react-pdf/renderer';

import _ from 'lodash';
import React, { memo } from 'react';
import { Text, View, Page, Font, Image, Document, StyleSheet } from '@react-pdf/renderer';

Font.register({
  family: 'Oswald',
  src: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
});

interface ICommonReport {
  reportHeader?: React.ReactNode;
  reportBody?: React.ReactNode;
  documentProps?: DocumentProps;
  pageProps?: PageProps;
}

export const toPoints = (inches: number) => inches * 72;
export const pxToInches = (px: number) => px / 96;

const CommonReport = ({
  reportHeader,
  reportBody,
  documentProps,

  pageProps,
}: ICommonReport) => {
  const { style, ...page } = pageProps!;
  return (
    <Document {...documentProps}>
      <Page size="A2" style={{ ...tableStyles.page, ...(style || {}) }} {...page}>
        {reportHeader}
        {reportBody}
        <Text
          style={tableStyles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default React.memo(CommonReport);

export const ReportHeader = memo(
  ({
    elements,
    height,
    data = {},
  }: {
    elements: {
      type?: string;
      text?: string;
      label?: string;
      image?: string;
      style?: any;
      position?: any;
    }[];
    height?: number;
    data?: any;
  }) => (
    <View style={{ position: 'relative', height: height || 100 }}>
      {elements.map((item: any, index) => {
        if (item.type === 'text') {
          let value = '';
          if (item.filedType === 'dynamic') {
            const str = item.text.search('{{');
            const findDotIndex = item.label.search(/\./);

            value = item.text.slice(0, str) + data[item.label.slice(findDotIndex + 1)];
          } else {
            value = item.text;
          }
          return (
            // <View
            //   style={{
            //     transform: `translate(${item?.position?.x || 0}in, ${item?.position?.y || 0}in)`,
            //   }}
            // >
            <Text
              key={index}
              style={{
                position: 'absolute',
                display: 'inline-block',
                transform: `translate(${item?.position?.x || 0}, ${(item?.position?.y || 0) + 100})`,
                // transform: `translateX(${item?.position?.x || 0})`,
                // transform: `translateY(${item?.position?.y || 0})`,
                // top: 0,
                // left: 0,
                fontSize: 12,
                ...(item?.style || {}),
              }}
            >
              {value}
            </Text>
            // </View>
          );
        }
        if (item.type === 'image') {
          return (
            <Image
              key={index}
              src={item.image}
              style={{
                position: 'absolute',
                // top: item?.position?.y || 0,
                // left: item?.position?.x || 0,
                transform: `translate(${item?.position?.x || 0}, ${(item?.position?.y || 0) + 100})`,
                width: 100,
                height: 100,
                ...(item?.style || {}),
              }}
            />
          );
        }
        if (item.type === 'divider') {
          return (
            <View
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderTop: '1px solid #000',
                transform: `translate(${item?.position?.x || 0}, ${(item?.position?.y || 0) + 100})`,
                ...(item?.style || {}),
              }}
            />
          );
        }
        return null;
      })}
    </View>
  )
);

const tableStyles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: 'Helvetica',
    position: 'relative', // Enables absolute positioning
  },
  content: {
    marginTop: 10, // Leave space for the header
    marginBottom: 40, // Leave space for the footer
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: '#bfbfbf',
    padding: 4,
    flexGrow: 1,
  },
  headerTableCol: {
    borderWidth: 0.5,
    borderColor: '#bfbfbf',
    padding: 5,
    flexGrow: 1,
    border: 'none',
  },
  headerCol: {
    backgroundColor: '#1C252E',
    color: '#fff',
    fontWeight: 700,
    fontSize: 9,
    textAlign: 'center',
    // padding: 5,
    borderWidth: 0,
    borderColor: 'red',
  },
  tableCell: {
    fontSize: 9,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});
interface Data {
  [key: string]: any;
}
interface Column {
  id: string;
  label: string;
  style?: Data;
  render?: (value: any, row: Data) => React.ReactNode;
}

export const PdfTable = ({ columns, data = [] }: { columns: Column[]; data: Data[] }) => (
  <View style={tableStyles.content}>
    <View style={tableStyles.table}>
      {/* Table Header */}
      <View style={[tableStyles.tableRow, tableStyles.headerCol]}>
        {columns.map((col) => (
          <View
            key={col.id}
            style={[
              tableStyles.headerTableCol,
              { width: `${100 / columns.length}%`, ...(col?.style || {}) },
            ]}
          >
            <Text style={tableStyles.headerCol}>{col.label}</Text>
          </View>
        ))}
      </View>
      {/* Table Rows */}
      {data.map((employee) => (
        <View key={employee.id} style={tableStyles.tableRow}>
          {columns.map((col) => (
            <View
              key={col.id}
              style={[
                tableStyles.tableCol,
                { width: `${100 / columns.length}%`, ...(col?.style || {}) },
              ]}
            >
              <Text style={tableStyles.tableCell}>
                {col.render
                  ? col.render(_.get(employee, col.id, '-'), employee)
                  : _.get(employee, col.id, '-')}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  </View>
);
