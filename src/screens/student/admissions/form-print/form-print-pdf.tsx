import { pdf, Font, Page, Text, View, Image, Document } from '@react-pdf/renderer';
import { splitPdfScriptRuns } from 'src/components/customizabaleTable/indic-pdf-export';
import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { AdmissionPrintPageBorder } from './form-print-page-border';
import { AdmissionPaperTemplate } from './form-print-paper-templates';
import { AdmissionAdvancedPaperTemplate } from './form-print-advanced-template';
import { PrintSectionStart, ContinuedPrintSection } from './form-print-continued-section';
import { estimatePrintTextLines, estimateStandardPrintFieldHeight } from './form-print-text-layout';
import {
  getLegacyAdmissionPrintColors,
  usesAdvancedAdmissionPrintLayout,
} from './form-print-appearance';
import {
  PRINT_PAPER_POINTS,
  AdmissionPrintLayoutError,
  getAdmissionPrintLayoutError,
  formatAdmissionPrintPhotoSize,
} from './form-print-advanced-layout';

import type {
  AdmissionPrintField,
  AdmissionPrintBranding,
  AdmissionPrintDocument,
} from './form-print-model';

const BASE_FAMILY = 'AdmissionPrintUnicode';
const DEVANAGARI_FAMILY = 'AdmissionPrintDevanagari';

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
  Font.register({
    family: 'AdmissionPrintRoboto',
    fonts: [
      { src: `${fontBasePath}/Roboto-Regular.ttf` },
      { src: `${fontBasePath}/Roboto-Bold.ttf`, fontWeight: 700 },
    ],
  });
}

/** Keep the established Unicode/Indic shaping runs in preview and downloaded artifacts. */
const textRuns = (value: string) =>
  splitPdfScriptRuns(value).map((run, index) => (
    <Text
      key={index}
      style={{ fontFamily: run.fontFamily === 'TableDevanagari' ? DEVANAGARI_FAMILY : BASE_FAMILY }}
    >
      {run.text}
    </Text>
  ));

function fieldRows(fields: AdmissionPrintField[], columns: number) {
  const rows: AdmissionPrintField[][] = [];
  let current: AdmissionPrintField[] = [];
  fields.forEach((field) => {
    // Long paragraphs get the full printable width and may flow across physical pages.
    const fullWidth =
      field.kind === 'multiline' ||
      field.kind === 'static' ||
      field.value.length > 160 ||
      (field.options?.length ?? 0) > 4;
    if (fullWidth) {
      if (current.length) rows.push(current);
      rows.push([field]);
      current = [];
    } else {
      current.push(field);
      if (current.length === columns) {
        rows.push(current);
        current = [];
      }
    }
  });
  if (current.length) rows.push(current);
  return rows;
}

export async function createAdmissionFormPdfBlob(
  model: AdmissionPrintDocument,
  branding: AdmissionPrintBranding = {},
  fontBasePath = '/fonts'
): Promise<Blob> {
  registerFonts(fontBasePath);
  if (usesAdvancedAdmissionPrintLayout(model.settings.advanced, model.settings.paperSize)) {
    const layoutError = getAdmissionPrintLayoutError(model, branding);
    if (layoutError) throw new AdmissionPrintLayoutError(layoutError);
    return pdf(
      <AdmissionAdvancedPaperTemplate
        model={model}
        branding={branding}
        baseFamily={BASE_FAMILY}
        devanagariFamily={DEVANAGARI_FAMILY}
      />
    ).toBlob();
  }
  if (
    model.settings.template === 'boxed-grid' ||
    model.settings.template === 'structured-classic'
  ) {
    return pdf(
      <AdmissionPaperTemplate
        model={model}
        branding={branding}
        textRuns={textRuns}
        fieldRows={fieldRows}
        baseFamily={BASE_FAMILY}
        devanagariFamily={DEVANAGARI_FAMILY}
      />
    ).toBlob();
  }
  const spacious = model.settings.layout === 'spacious';
  const colors = getLegacyAdmissionPrintColors(model.settings.advanced?.style);
  const margin = spacious ? 36 : 28;
  const fieldPadding = spacious ? 9 : 6;
  const fontSize = spacious ? 10 : 9;
  const labelSize = spacious ? 9 : 8;
  const [pageWidth, pageHeight] = PRINT_PAPER_POINTS.A4;
  const footerReserve = 43;
  const schoolHeader = model.settings.showSchoolHeader;
  const addressLines = schoolHeader
    ? (branding.addressLines ?? []).filter((line) => line.trim())
    : [];
  const brandingWidth = pageWidth - margin * 2 - (schoolHeader && branding.logoUrl ? 54 : 0);
  const titleSize = schoolHeader && branding.schoolName ? 10 : 14;
  const brandingHeight = Math.max(
    schoolHeader && branding.logoUrl ? 44 : 0,
    (schoolHeader && branding.schoolName
      ? estimatePrintTextLines(branding.schoolName, brandingWidth, 8.4) * 18
      : 0) +
      addressLines.reduce(
        (height, line) => height + estimatePrintTextLines(line, brandingWidth, 4.8) * 11,
        0
      ) +
      estimatePrintTextLines(model.title, brandingWidth, titleSize * 0.6) * (titleSize + 3) +
      2
  );
  const headerHeight = Math.max(
    schoolHeader && branding.bannerUrl ? 113 : schoolHeader ? 78 : 42,
    brandingHeight + (schoolHeader && branding.bannerUrl ? 57 : 0) + 18
  );
  const photoWidth = 70;
  const photoHeight = 84;
  const bodyCapacity = pageHeight - margin - headerHeight - footerReserve;
  const renderField = (field: AdmissionPrintField, width: string) => (
    <View key={field.key} style={{ width, padding: fieldPadding, paddingTop: spacious ? 8 : 5 }}>
      <Text
        minPresenceAhead={fontSize * 2}
        style={{ fontSize: labelSize, fontWeight: 700, marginBottom: 3 }}
      >
        {textRuns(`${field.label}${field.required ? ' *' : ''}`)}
      </Text>
      {field.kind === 'photo' && model.settings.showPhoto ? (
        <View
          wrap={false}
          style={{
            width: photoWidth,
            height: photoHeight,
            maxWidth: '100%',
            borderWidth: 0.6,
            borderColor: colors.border,
            padding: 4,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {model.mode === 'filled' && field.imageUrl ? (
            <Image
              src={field.imageUrl}
              style={{
                width: photoWidth - 10,
                height: photoHeight - 10,
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <>
              <Text style={{ fontSize: 8, textAlign: 'center' }}>
                {textRuns(model.labels.photo)}
              </Text>
              <Text style={{ fontSize: 7, textAlign: 'center', marginTop: 2 }}>
                {textRuns(formatAdmissionPrintPhotoSize(photoWidth, photoHeight))}
              </Text>
            </>
          )}
        </View>
      ) : null}
      {field.kind !== 'static' && field.kind !== 'photo' && (
        <View
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
            paddingBottom: 4,
            minHeight:
              model.mode === 'blank' && field.kind === 'multiline'
                ? spacious
                  ? 58
                  : 37
                : spacious
                  ? 25
                  : 19,
          }}
        >
          {model.mode === 'blank' && field.options?.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {field.options.map((option) => (
                <View
                  key={option.value}
                  wrap={false}
                  style={{ flexDirection: 'row', marginRight: 12, marginBottom: 5 }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderWidth: 0.6,
                      borderColor: colors.detailBorder,
                      marginRight: 4,
                      marginTop: 2,
                    }}
                  />
                  <Text>{textRuns(option.label)}</Text>
                </View>
              ))}
            </View>
          ) : model.mode === 'blank' && field.kind === 'checkbox' ? (
            <View style={{ flexDirection: 'row' }}>
              {[model.labels.yes, model.labels.no].map((label) => (
                <View key={label} style={{ flexDirection: 'row', marginRight: 20 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderWidth: 0.6,
                      borderColor: colors.detailBorder,
                      marginRight: 4,
                      marginTop: 2,
                    }}
                  />
                  <Text>{textRuns(label)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text orphans={2} widows={2}>
              {textRuns(field.value || ' ')}
            </Text>
          )}
        </View>
      )}
      {model.mode === 'blank' && field.conditional && (
        <Text style={{ fontSize: 7, marginTop: 2, color: colors.mutedText }}>
          {textRuns(model.labels.conditional)}
        </Text>
      )}
    </View>
  );

  return pdf(
    <Document title={model.title} language={`${model.language}-IN`}>
      <Page
        size="A4"
        orientation="portrait"
        wrap
        style={{
          paddingTop: margin + headerHeight,
          paddingBottom: footerReserve,
          paddingHorizontal: margin,
          fontFamily: BASE_FAMILY,
          fontSize,
          color: colors.text,
        }}
      >
        <AdmissionPrintPageBorder
          border={resolveAdmissionPrintAdvancedSettings(model.settings.advanced).border}
          color={colors.border}
          margin={margin}
        />
        <View
          fixed
          style={{
            position: 'absolute',
            top: margin,
            left: margin,
            right: margin,
            height: headerHeight - 10,
            borderBottomWidth: 0.7,
            borderBottomColor: colors.border,
            paddingBottom: 8,
          }}
        >
          {schoolHeader && branding.bannerUrl ? (
            <Image
              src={branding.bannerUrl}
              style={{ height: 52, width: '100%', objectFit: 'contain', marginBottom: 5 }}
            />
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {schoolHeader && branding.logoUrl ? (
              <Image
                src={branding.logoUrl}
                style={{ width: 44, height: 44, objectFit: 'contain', marginRight: 10 }}
              />
            ) : null}
            <View style={{ flex: 1 }}>
              {schoolHeader && branding.schoolName ? (
                <Text style={{ fontSize: 14, fontWeight: 700 }}>
                  {textRuns(branding.schoolName)}
                </Text>
              ) : null}
              {schoolHeader
                ? addressLines.map((line, index) => (
                    <Text key={index} style={{ fontSize: 8 }}>
                      {textRuns(line)}
                    </Text>
                  ))
                : null}
              <Text
                style={{
                  fontWeight: 700,
                  fontSize: schoolHeader && branding.schoolName ? 10 : 14,
                  marginTop: 2,
                }}
              >
                {textRuns(model.title)}
              </Text>
            </View>
          </View>
        </View>
        {model.steps.flatMap((step) =>
          step.sections.flatMap((section, sectionIndex) => {
            const tracker = { started: false };
            const rows = section.entries.flatMap((entry) =>
              fieldRows(
                entry.fields.filter((field) => model.settings.showPhoto || field.kind !== 'photo'),
                section.columns
              ).map((row, rowIndex) => ({ row, rowIndex, entry }))
            );
            if (!rows.length) return [];
            const sectionRows = rows.map(({ row, rowIndex, entry }, index) => {
              const firstRow = index === 0;
              const rowWidth = (pageWidth - margin * 2) / row.length - fieldPadding * 2;
              const canFlow = row.some(
                (field) =>
                  estimateStandardPrintFieldHeight(
                    field,
                    rowWidth,
                    fontSize,
                    model.mode === 'blank'
                  ) >
                  bodyCapacity - (firstRow ? 55 : 0)
              );
              return (
                <View
                  key={`${section.key}:${entry.key}:${rowIndex}`}
                  wrap={canFlow}
                  style={{ marginBottom: index === rows.length - 1 ? (spacious ? 12 : 8) : 0 }}
                >
                  {firstRow && <PrintSectionStart tracker={tracker} />}
                  {firstRow &&
                    sectionIndex === 0 &&
                    (model.steps.length > 1 || step.sections.length > 1) && (
                      <Text
                        minPresenceAhead={canFlow ? 55 : 0}
                        style={{
                          fontWeight: 700,
                          fontSize: 12,
                          marginTop: spacious ? 15 : 9,
                          marginBottom: 5,
                        }}
                      >
                        {textRuns(step.title)}
                      </Text>
                    )}
                  {firstRow && (
                    <Text
                      minPresenceAhead={canFlow ? 45 : 0}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: colors.sectionFill,
                        padding: 6,
                        borderBottomWidth: 0.5,
                        borderBottomColor: colors.lightBorder,
                      }}
                    >
                      {textRuns(section.title)}
                    </Text>
                  )}
                  {rowIndex === 0 && entry.label && (
                    <Text
                      minPresenceAhead={canFlow ? 35 : 0}
                      style={{ fontWeight: 700, marginTop: 7, paddingHorizontal: fieldPadding }}
                    >
                      {textRuns(entry.label)}
                    </Text>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    {row.map((field) => renderField(field, `${100 / row.length}%`))}
                  </View>
                </View>
              );
            });
            return [
              <ContinuedPrintSection
                key={section.key}
                title={section.title}
                language={model.language}
                fontFamily={model.language === 'hi' ? DEVANAGARI_FAMILY : BASE_FAMILY}
                fontSize={fontSize}
                tracker={tracker}
              >
                {sectionRows}
              </ContinuedPrintSection>,
            ];
          })
        )}
        {model.settings.showSignature ? (
          <View
            wrap={false}
            style={{ marginTop: spacious ? 30 : 22, paddingHorizontal: fieldPadding }}
          >
            <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 32 }}>
              {textRuns(model.labels.signature)}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[model.labels.parentSignature, model.labels.officeSignature].map((label) => (
                <View
                  key={label}
                  style={{
                    width: '43%',
                    borderTopWidth: 0.6,
                    borderTopColor: colors.detailBorder,
                    paddingTop: 5,
                  }}
                >
                  <Text style={{ fontSize: 8 }}>{textRuns(label)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {/* Avoid inherited numeric lineHeight: dynamic relayout scales it repeatedly in react-pdf. */}
        <Text
          fixed
          style={{
            position: 'absolute',
            bottom: 20,
            left: margin,
            right: margin,
            height: 12,
            fontSize: 8,
            fontFamily: model.language === 'hi' ? DEVANAGARI_FAMILY : BASE_FAMILY,
            textAlign: 'right',
          }}
          render={({ pageNumber, totalPages }) =>
            `${model.labels.page} ${pageNumber} ${model.labels.of} ${totalPages}`
          }
        />
      </Page>
    </Document>
  ).toBlob();
}
