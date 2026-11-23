import type { ReactNode } from 'react';

import COLORS from 'src/theme/core/colors.json';
import { Page, Text, View, Image, Document } from '@react-pdf/renderer';

import { estimatePrintTextLines } from './form-print-text-layout';
import { formatAdmissionPrintPhotoSize } from './form-print-advanced-layout';

import type {
  AdmissionPrintField,
  AdmissionPrintBranding,
  AdmissionPrintDocument,
} from './form-print-model';

type PaperTemplateProps = {
  model: AdmissionPrintDocument;
  branding: AdmissionPrintBranding;
  textRuns: (value: string) => ReactNode;
  fieldRows: (fields: AdmissionPrintField[], columns: number) => AdmissionPrintField[][];
  needsPageFlow: (field: AdmissionPrintField) => boolean;
  baseFamily: string;
  devanagariFamily: string;
};

/** Paper-only presentation. The model remains the authority for questions, ordering and answers. */
export function AdmissionPaperTemplate({
  model,
  branding,
  textRuns,
  fieldRows,
  needsPageFlow,
  baseFamily,
  devanagariFamily,
}: PaperTemplateProps) {
  const spacious = model.settings.layout === 'spacious';
  const boxed = model.settings.template === 'boxed-grid';
  const margin = spacious ? 36 : 28;
  const padding = spacious ? 10 : 7;
  const fontSize = spacious ? 10 : 9;
  const border = COLORS.grey[500];
  const schoolHeader = model.settings.showSchoolHeader;
  const addressLines = schoolHeader
    ? (branding.addressLines ?? []).filter((line) => line.trim())
    : [];
  const brandingWidth = 595.28 - margin * 2 - (schoolHeader && branding.logoUrl ? 57 : 0);
  // Reserve wrapped content before placing the fixed header so long Institute Setup addresses
  // remain complete and can never overlap the first question or registration-number line.
  const estimatedLines = (value: string, characterWidth: number) =>
    estimatePrintTextLines(value, brandingWidth, characterWidth);
  const mastheadHeight = Math.max(
    schoolHeader && branding.logoUrl ? 47 : 0,
    (schoolHeader && branding.schoolName ? estimatedLines(branding.schoolName, 10) * 24 : 0) +
      addressLines.reduce((height, line) => height + estimatedLines(line, 4.5) * 12, 0) +
      estimatedLines(model.title, 7.2) * 16 +
      7
  );
  const bannerHeight = schoolHeader && branding.bannerUrl ? 51 : 0;
  const headerHeight = mastheadHeight + bannerHeight + 37;
  let sectionNumber = 0;
  const paperRows = (fields: AdmissionPrintField[], columns: number) =>
    fieldRows(fields, columns).flatMap((row) =>
      boxed &&
      model.mode === 'blank' &&
      row.length > 2 &&
      row.some(
        (field) => field.kind === 'text' && field.writingFormat && field.writingFormat !== 'line'
      )
        ? [row.slice(0, 2), row.slice(2)]
        : [row]
    );

  const photoWidth = 68;
  const photoHeight = 82;
  const renderPhoto = (field: AdmissionPrintField) => (
    <View
      wrap={false}
      style={{
        width: photoWidth,
        height: photoHeight,
        borderWidth: 0.7,
        borderColor: border,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {model.mode === 'filled' && field.imageUrl ? (
        <Image
          src={field.imageUrl}
          style={{ width: photoWidth - 10, height: photoHeight - 10, objectFit: 'contain' }}
        />
      ) : (
        <>
          <Text style={{ fontSize: 8, textAlign: 'center' }}>{textRuns(model.labels.photo)}</Text>
          <Text style={{ fontSize: 7, textAlign: 'center', marginTop: 2 }}>
            {textRuns(formatAdmissionPrintPhotoSize(photoWidth, photoHeight))}
          </Text>
        </>
      )}
    </View>
  );
  const renderChoices = (field: AdmissionPrintField) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 3 }}>
      {(field.options?.length
        ? field.options.map((option) => option.label)
        : [model.labels.yes, model.labels.no]
      ).map((label, index) => (
        <View
          key={index}
          wrap={false}
          style={{ flexDirection: 'row', marginRight: 12, marginBottom: 5 }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderWidth: 0.6,
              borderColor: border,
              marginRight: 4,
              marginTop: 2,
            }}
          />
          <Text>{textRuns(label)}</Text>
        </View>
      ))}
    </View>
  );
  const renderWritingSpace = (field: AdmissionPrintField, rowCount: number) => {
    const format = field.writingFormat;
    if (boxed && model.mode === 'blank' && format && format !== 'line' && field.kind === 'text') {
      const availableWidth = (595.28 - margin * 2) / rowCount - padding * 2 - 2;
      const count =
        format === 'date'
          ? 8
          : format === 'phone' || format === 'pan'
            ? 10
            : format === 'aadhaar'
              ? 12
              : Math.min(30, Math.floor(availableWidth / 14));
      const cellSize = Math.min(
        spacious ? 19 : 17,
        (availableWidth - count - (format === 'date' ? 14 : 0)) / count
      );
      return (
        <View style={{ flexDirection: 'row', marginTop: 3 }}>
          {Array.from({ length: count }, (_, index) => (
            <View key={index} style={{ flexDirection: 'row' }}>
              {format === 'date' && [2, 4].includes(index) ? (
                <Text style={{ width: 7, textAlign: 'center', marginTop: 3 }}>/</Text>
              ) : null}
              <View
                style={{
                  width: cellSize,
                  height: spacious ? 23 : 20,
                  borderWidth: 0.5,
                  marginRight: 1,
                  borderColor: border,
                }}
              />
            </View>
          ))}
        </View>
      );
    }
    const lines = model.mode === 'blank' && field.kind === 'multiline' ? (spacious ? 3 : 2) : 1;
    return (
      <View style={{ minHeight: spacious ? 28 : 23 }}>
        {model.mode === 'filled' && field.value ? (
          <Text
            orphans={2}
            widows={2}
            style={{
              paddingTop: 2,
              paddingBottom: 5,
              borderBottomWidth: 0.5,
              borderBottomColor: border,
            }}
          >
            {textRuns(field.value)}
          </Text>
        ) : (
          Array.from({ length: lines }, (_, index) => (
            <View
              key={index}
              style={{
                height: spacious ? 22 : 18,
                borderBottomWidth: 0.5,
                borderBottomColor: border,
              }}
            />
          ))
        )}
      </View>
    );
  };
  const renderField = (field: AdmissionPrintField, rowCount: number) => (
    <View
      key={field.key}
      style={{
        width: `${100 / rowCount}%`,
        padding,
        borderRightWidth: boxed ? 0.5 : 0,
        borderRightColor: border,
      }}
    >
      <Text
        minPresenceAhead={fontSize * 2}
        style={{ fontSize: spacious ? 9 : 8, fontWeight: 700, marginBottom: 4 }}
      >
        {textRuns(`${field.label}${field.required ? ' *' : ''}`)}
      </Text>
      {field.kind === 'photo'
        ? renderPhoto(field)
        : field.kind === 'static'
          ? null
          : model.mode === 'blank' && (field.options?.length || field.kind === 'checkbox')
            ? renderChoices(field)
            : renderWritingSpace(field, rowCount)}
      {model.mode === 'blank' && field.conditional ? (
        <Text style={{ fontSize: 7, color: COLORS.grey[600], marginTop: 3 }}>
          {textRuns(model.labels.conditional)}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Document title={model.title} language={`${model.language}-IN`}>
      <Page
        size="A4"
        wrap
        style={{
          paddingTop: margin + headerHeight,
          paddingBottom: 44,
          paddingHorizontal: margin,
          fontFamily: baseFamily,
          fontSize,
          color: COLORS.grey[800],
        }}
      >
        <View
          fixed
          style={{
            position: 'absolute',
            top: margin,
            left: margin,
            right: margin,
            height: headerHeight - 9,
          }}
        >
          {schoolHeader && branding.bannerUrl ? (
            <Image
              src={branding.bannerUrl}
              style={{ height: 45, width: '100%', objectFit: 'contain', marginBottom: 6 }}
            />
          ) : null}
          <View style={{ flexDirection: 'row', minHeight: mastheadHeight, alignItems: 'center' }}>
            {schoolHeader && branding.logoUrl ? (
              <Image
                src={branding.logoUrl}
                style={{ width: 47, height: 47, objectFit: 'contain', marginRight: 10 }}
              />
            ) : null}
            <View style={{ flex: 1 }}>
              {schoolHeader && branding.schoolName ? (
                <Text style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>
                  {textRuns(branding.schoolName)}
                </Text>
              ) : null}
              {schoolHeader
                ? addressLines.map((line, index) => (
                    <Text key={index} style={{ fontSize: 8, marginBottom: 2 }}>
                      {textRuns(line)}
                    </Text>
                  ))
                : null}
              <Text style={{ fontSize: 12, fontWeight: 700, marginTop: 5 }}>
                {textRuns(model.title)}
              </Text>
            </View>
          </View>
          {/* Registration identifiers remain a normal writing line, independent of the grid template. */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 9,
              paddingBottom: 7,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.grey[700],
            }}
          >
            <View style={{ width: '65%', flexDirection: 'row', paddingRight: 25 }}>
              <Text style={{ fontSize: 8, marginRight: 6 }}>
                {textRuns(model.labels.registrationNumber)}
              </Text>
              <View style={{ flex: 1, borderBottomWidth: 0.5, borderBottomColor: border }}>
                <Text style={{ fontSize: 9 }}>{textRuns(model.registrationNumber || ' ')}</Text>
              </View>
            </View>
            <View style={{ width: '35%', flexDirection: 'row' }}>
              <Text style={{ fontSize: 8, marginRight: 6 }}>{textRuns(model.labels.date)}</Text>
              <View style={{ flex: 1, borderBottomWidth: 0.5, borderBottomColor: border }} />
            </View>
          </View>
        </View>
        {model.steps.map((step) => (
          <View key={step.key}>
            {model.steps.length > 1 &&
            !step.sections.every((section) => section.title === step.title) ? (
              <Text
                minPresenceAhead={70}
                style={{ fontWeight: 700, fontSize: 11, marginTop: 7, marginBottom: 6 }}
              >
                {textRuns(step.title)}
              </Text>
            ) : null}
            {step.sections.map((section) => {
              sectionNumber += 1;
              const sectionFields = section.entries.flatMap((entry) => entry.fields);
              const keepTogether =
                headerHeight < 300 &&
                !section.repeatable &&
                section.entries.reduce(
                  (count, entry) => count + paperRows(entry.fields, section.columns).length,
                  0
                ) <= 3 &&
                sectionFields.every((field) => field.kind !== 'photo' && !needsPageFlow(field)) &&
                sectionFields.reduce(
                  (count, field) =>
                    count +
                    field.label.length +
                    field.value.length +
                    (field.options?.reduce((length, option) => length + option.label.length, 0) ??
                      0),
                  0
                ) < 500;
              return (
                <View
                  key={section.key}
                  wrap={!keepTogether}
                  style={{ marginBottom: spacious ? 13 : 10 }}
                >
                  <View
                    minPresenceAhead={65}
                    wrap={false}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: COLORS.grey[100],
                      borderWidth: 0.7,
                      borderColor: border,
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                    }}
                  >
                    <Text style={{ fontWeight: 700, fontSize: 10, width: 23 }}>
                      {String(sectionNumber).padStart(2, '0')}
                    </Text>
                    <Text style={{ fontWeight: 700, fontSize: 10, flex: 1 }}>
                      {textRuns(section.title)}
                    </Text>
                  </View>
                  {section.entries.map((entry) => (
                    <View key={entry.key}>
                      {entry.label ? (
                        <Text
                          minPresenceAhead={
                            entry.fields.some((field) => field.kind === 'photo') ? 120 : 55
                          }
                          style={{
                            fontWeight: 700,
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                            borderLeftWidth: 0.5,
                            borderRightWidth: 0.5,
                            borderColor: border,
                          }}
                        >
                          {textRuns(entry.label)}
                        </Text>
                      ) : null}
                      {paperRows(
                        entry.fields.filter(
                          (field) => model.settings.showPhoto || field.kind !== 'photo'
                        ),
                        section.columns
                      ).map((row, index, rows) => (
                        <View
                          key={index}
                          wrap={row.some(needsPageFlow)}
                          minPresenceAhead={50}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'stretch',
                            borderLeftWidth: 0.5,
                            borderRightWidth: boxed ? 0 : 0.5,
                            borderBottomWidth: boxed || index === rows.length - 1 ? 0.5 : 0,
                            borderColor: border,
                          }}
                        >
                          {row.map((field) => renderField(field, row.length))}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ))}
        {model.settings.showSignature ? (
          <View wrap={false} style={{ marginTop: spacious ? 25 : 18, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 32 }}>
              {textRuns(model.labels.signature)}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[model.labels.parentSignature, model.labels.officeSignature].map((label) => (
                <View
                  key={label}
                  style={{
                    width: '42%',
                    borderTopWidth: 0.5,
                    borderTopColor: border,
                    paddingTop: 5,
                  }}
                >
                  <Text style={{ fontSize: 8 }}>{textRuns(label)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        <Text
          fixed
          style={{
            position: 'absolute',
            bottom: 20,
            left: margin,
            right: margin,
            height: 12,
            fontSize: 8,
            fontFamily: model.language === 'hi' ? devanagariFamily : baseFamily,
            textAlign: 'right',
          }}
          render={({ pageNumber, totalPages }) =>
            `${model.labels.page} ${pageNumber} ${model.labels.of} ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
