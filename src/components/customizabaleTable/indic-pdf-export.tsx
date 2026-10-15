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
  { title, head, body }: PdfTableData,
  fontBasePath = '/fonts'
): Promise<Blob> {
  registerFonts(fontBasePath);
  const width = `${100 / Math.max(1, head.length)}%` as const;
  const renderCells = (cells: string[]) =>
    cells.map((value, index) => (
      <View key={index} style={{ width, padding: 6 }}>
        <Text>
          {splitPdfScriptRuns(value).map((run, runIndex) => (
            <Text key={runIndex} style={{ fontFamily: run.fontFamily }}>
              {run.text}
            </Text>
          ))}
        </Text>
      </View>
    ));

  return pdf(
    <Document title={title} language="en-IN">
      <Page
        size="A4"
        orientation="landscape"
        style={{ padding: 28, fontFamily: BASE_FAMILY, fontSize: 8 }}
      >
        <View
          fixed
          style={{
            flexDirection: 'row',
            backgroundColor: '#1677ff',
            color: '#ffffff',
            fontWeight: 700,
          }}
        >
          {renderCells(head)}
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
            {renderCells(row)}
          </View>
        ))}
      </Page>
    </Document>
  ).toBlob();
}
