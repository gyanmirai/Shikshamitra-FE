import { pdf, Font, Page, Text, View, Document } from '@react-pdf/renderer';

import type { PdfTableData } from './pdf-export';

const BASE_FAMILY = 'TableUnicode';
const DEVANAGARI_FAMILY = 'TableDevanagari';

function registerFonts(fontBasePath: string) {
  Font.register({
    family: BASE_FAMILY,
    fonts: [
      { src: `${fontBasePath}/ShikshaMitraUnicode-Regular.ttf` },
      { src: `${fontBasePath}/ShikshaMitraUnicode-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.register({
    family: DEVANAGARI_FAMILY,
    fonts: [
      { src: `${fontBasePath}/NotoSansDevanagari-Regular.ttf` },
      { src: `${fontBasePath}/NotoSansDevanagari-Bold.ttf`, fontWeight: 700 },
    ],
  });
}

// Keep combining marks, joiners and consonants in one shaped font run.
export function splitPdfScriptRuns(value: string) {
  // Whole Unicode blocks intentionally include combining characters for shaping.
  /* eslint-disable no-misleading-character-class */
  return value
    .split(/([\u0900-\u097f\ua8e0-\ua8ff\u200c\u200d]+)/u)
    .filter(Boolean)
    .map((text) => ({
      text,
      fontFamily: /[\u0900-\u097f\ua8e0-\ua8ff]/u.test(text) ? DEVANAGARI_FAMILY : BASE_FAMILY,
    }));
  /* eslint-enable no-misleading-character-class */
}

export async function createIndicTablePdfBlob(
  { title, head, body, context = [] }: PdfTableData,
  fontBasePath = '/fonts'
): Promise<Blob> {
  registerFonts(fontBasePath);
  const sections =
    head.length <= 8
      ? [head.map((_, index) => index)]
      : Array.from({ length: Math.ceil((head.length - 2) / 6) }, (_, index) => [
          0,
          1,
          ...head.slice(2 + index * 6, 8 + index * 6).map((cell, offset) => 2 + index * 6 + offset),
        ]);
  const renderText = (value: string) =>
    splitPdfScriptRuns(value).map((run, index) => (
      <Text key={index} style={{ fontFamily: run.fontFamily }}>
        {run.text}
      </Text>
    ));
  const renderCells = (cells: string[]) =>
    cells.map((value, index) => (
      <View key={index} style={{ width: `${100 / cells.length}%`, padding: 6 }}>
        <Text>{renderText(value)}</Text>
      </View>
    ));

  return pdf(
    <Document title={title} language="en-IN">
      {sections.map((section, sectionIndex) => (
        <Page
          key={sectionIndex}
          size="A4"
          orientation="landscape"
          style={{ padding: 28, paddingBottom: 40, fontFamily: BASE_FAMILY, fontSize: 8 }}
        >
          <View fixed style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 700, fontSize: 11 }}>{renderText(title)}</Text>
            {context.map((line, index) => (
              <Text key={index}>{renderText(line)}</Text>
            ))}
            {sections.length > 1 && (
              <Text>
                Section {sectionIndex + 1} of {sections.length}
              </Text>
            )}
          </View>
          <View
            fixed
            style={{
              flexDirection: 'row',
              backgroundColor: '#f4f6f8',
              color: '#212b36',
              fontWeight: 700,
            }}
          >
            {renderCells(section.map((index) => head[index]))}
          </View>
          {body.map((row, index) => (
            <View
              key={index}
              wrap={false}
              style={{
                flexDirection: 'row',
                backgroundColor: index % 2 === 0 ? '#f4f5f6' : '#ffffff',
              }}
            >
              {renderCells(section.map((columnIndex) => row[columnIndex]))}
            </View>
          ))}
          <Text
            fixed
            style={{ position: 'absolute', bottom: 20, right: 28 }}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </Page>
      ))}
    </Document>
  ).toBlob();
}
