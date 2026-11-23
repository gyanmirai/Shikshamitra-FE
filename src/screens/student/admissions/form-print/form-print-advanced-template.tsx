import type { ReactNode } from 'react';

import { Page, Text, View, Image, Document } from '@react-pdf/renderer';
import { splitPdfScriptRuns } from 'src/components/customizabaleTable/indic-pdf-export';
import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { estimatePrintTextLines } from './form-print-text-layout';
import {
  PRINT_MM,
  advancedFieldRows,
  estimatedTableHeight,
  advancedPrintGeometry,
  advancedHeaderGeometry,
  collectAdvancedPrintPhotos,
  formatAdmissionPrintPhotoSize,
} from './form-print-advanced-layout';

import type { AdvancedPrintCell } from './form-print-advanced-layout';
import type {
  AdmissionPrintField,
  AdmissionPrintSection,
  AdmissionPrintBranding,
  AdmissionPrintDocument,
} from './form-print-model';

type Props = {
  model: AdmissionPrintDocument;
  branding: AdmissionPrintBranding;
  baseFamily: string;
  devanagariFamily: string;
};
type Part = { key: string; nodes: ReactNode[]; table?: AdmissionPrintSection };

/** Explicit paper customization shares one flow for builder previews and blank/filled Pipeline copies. */
export function AdmissionAdvancedPaperTemplate({
  model,
  branding,
  baseFamily,
  devanagariFamily,
}: Props) {
  const options = resolveAdmissionPrintAdvancedSettings(model.settings.advanced);
  const geometry = advancedPrintGeometry(model, options);
  const { contentWidth, margins } = geometry;
  const fontSize = options.style.baseSize;
  const { textColor } = options.style;
  const { borderColor } = options.style;
  const boxed = model.settings.template === 'boxed-grid';
  const labelWeight = options.style.labelWeight === 'regular' ? 400 : 700;
  const defaultPadding = model.settings.layout === 'spacious' ? 10 : 7;
  const title = options.header.title.trim() || model.title;
  const copy =
    options.content.translations[model.language] ?? options.content.translations.en ?? {};
  const sectionNumbers = new Map(
    model.steps.flatMap((step) => step.sections).map((section, index) => [section.key, index + 1])
  );
  const sectionStepTitles = new Map(
    model.steps.flatMap((step) => step.sections.map((section) => [section.key, step.title]))
  );
  const tableStepTitle = (section: AdmissionPrintSection) =>
    options.flow.stepTitles && sectionStepTitles.get(section.key) !== section.title
      ? sectionStepTitles.get(section.key)
      : undefined;
  const familyFor = (value: string) => {
    if (/[\u0900-\u097f]/.test(value)) return devanagariFamily;
    if (/[\u0a80-\u0aff]/.test(value)) return baseFamily;
    switch (options.style.fontFamily) {
      case 'serif':
        return 'Times-Roman';
      case 'monospace':
        return 'Courier';
      case 'roboto':
        return 'AdmissionPrintRoboto';
      default:
        return baseFamily;
    }
  };
  const runs = (value: string) =>
    splitPdfScriptRuns(value).map((run, index) => (
      <Text key={index} style={{ fontFamily: familyFor(run.text) }}>
        {run.text}
      </Text>
    ));
  const displayValue = (field: AdmissionPrintField) => field.value;

  const {
    assets,
    showBannerOnPage,
    address,
    contacts,
    schoolName,
    academicKeys,
    headerPhoto,
    firstBandHeight,
    laterBandHeight,
    fullHeaderHeight,
    compactHeaderHeight,
    compactLogo,
    compactLogoSize,
    compactRegistrationWidth,
    footerHeight,
    bodyCapacity,
  } = advancedHeaderGeometry(model, branding, options, geometry);
  const photos =
    model.settings.showPhoto && ['first', 'last'].includes(options.photo.placement)
      ? collectAdvancedPrintPhotos(model)
      : [];
  const movedPhotos = photos.length > 0;
  const visibleFields = (fields: AdmissionPrintField[]) =>
    fields.filter(
      (field) =>
        field.kind !== 'photo' ||
        (model.settings.showPhoto && !movedPhotos && field !== headerPhoto?.field)
    );

  const photoAlignment = { left: 'flex-start', center: 'center', right: 'flex-end' } as const;
  const photoPosition = photoAlignment[options.photo.alignment];
  const renderPhoto = (
    field: AdmissionPrintField,
    maximumWidth = contentWidth,
    inHeader = false
  ) => {
    const width = Math.min(options.photo.width * PRINT_MM, maximumWidth);
    const height = (options.photo.height * width) / options.photo.width;
    return (
      <View
        key={field.key}
        wrap={false}
        style={{
          margin: inHeader ? 0 : 5,
          alignItems: 'center',
          alignSelf: options.photo.placement === 'field' ? photoPosition : undefined,
          maxWidth: maximumWidth,
        }}
      >
        <View
          style={{
            width,
            height,
            borderWidth: 0.6,
            borderColor,
            padding: 4,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {model.mode === 'filled' && options.photo.useSaved && field.imageUrl ? (
            <Image
              src={field.imageUrl}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <>
              <Text style={{ fontSize: fontSize - 2, textAlign: 'center' }}>
                {runs(model.labels.photo)}
              </Text>
              <Text style={{ fontSize: fontSize - 3, textAlign: 'center', marginTop: 2 }}>
                {runs(formatAdmissionPrintPhotoSize(width, height))}
              </Text>
            </>
          )}
        </View>
        <Text
          style={{ maxWidth: width, fontSize: fontSize - 2, marginTop: 3, textAlign: 'center' }}
        >
          {runs(options.photo.caption || field.label || model.labels.photo)}
        </Text>
      </View>
    );
  };

  const writingLine = (label: string, value: string, fraction = 1) => (
    <View
      key={label}
      style={{
        flexDirection: 'row',
        width: `${fraction * 100}%`,
        paddingRight: 10,
        marginTop: 7,
        alignItems: 'flex-end',
      }}
    >
      <Text style={{ fontSize: fontSize - 1, paddingRight: 6 }}>{runs(label)}</Text>
      <View
        style={{
          flex: 1,
          borderBottomWidth: 0.5,
          borderBottomColor: borderColor,
          minHeight: fontSize + 3,
        }}
      >
        <Text style={{ fontSize }}>{runs(value || ' ')}</Text>
      </View>
    </View>
  );
  const renderBrandingBand = (page: number, height: number, includeLogo: boolean) =>
    height > 0 ? (
      <View style={{ height, position: 'relative', marginBottom: 5 }}>
        {assets
          .filter((asset) => (asset.key === 'logo' ? includeLogo : showBannerOnPage(page)))
          .map((asset) => (
            <Image
              key={asset.key}
              src={asset.src}
              style={{
                position: 'absolute',
                left: `${asset.placement.x}%`,
                top: `${asset.placement.y}%`,
                width: `${asset.placement.width}%`,
                height: `${asset.placement.height}%`,
                objectFit: asset.placement.lockAspectRatio === false ? 'fill' : 'contain',
              }}
            />
          ))}
      </View>
    ) : null;
  const headerText = () => (
    <View style={{ textAlign: options.header.alignment }}>
      {schoolName ? (
        <Text style={{ fontSize: options.style.titleSize, fontWeight: 700, marginBottom: 3 }}>
          {runs(schoolName)}
        </Text>
      ) : null}
      {[...address, ...contacts].map((line, index) => (
        <Text key={index} style={{ fontSize: fontSize - 1, marginBottom: 2 }}>
          {runs(line)}
        </Text>
      ))}
      <Text style={{ fontSize: options.style.titleSize, fontWeight: 700, marginTop: 3 }}>
        {runs(title)}
      </Text>
      {options.header.subtitle ? (
        <Text style={{ fontSize, marginTop: 2 }}>{runs(options.header.subtitle)}</Text>
      ) : null}
    </View>
  );

  const fullHeader = (page: number) => (
    <View
      wrap={false}
      style={{
        ...(page === 1 && headerPhoto
          ? { minHeight: fullHeaderHeight }
          : { height: page === 1 ? fullHeaderHeight : compactHeaderHeight }),
        paddingBottom: 8,
        borderBottomWidth: options.border.dividers ? 0.7 : 0,
        borderBottomColor: borderColor,
      }}
    >
      {renderBrandingBand(page, page === 1 ? firstBandHeight : laterBandHeight, true)}
      {page === 1 && headerPhoto ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: headerPhoto.gap }}>
          <View style={{ width: contentWidth - headerPhoto.width - headerPhoto.gap }}>
            {headerText()}
          </View>
          {renderPhoto(headerPhoto.field, headerPhoto.width, true)}
        </View>
      ) : (
        headerText()
      )}
      <View style={{ flexDirection: 'row' }}>
        {options.header.registrationNumber
          ? writingLine(
              model.labels.registrationNumber,
              model.registrationNumber,
              options.header.date ? 0.65 : 1
            )
          : null}
        {options.header.date
          ? writingLine(model.labels.date, '', options.header.registrationNumber ? 0.35 : 1)
          : null}
      </View>
      {academicKeys.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {academicKeys.map((key) =>
            writingLine(model.labels[key], model.academicDetails[key] ?? '', 0.5)
          )}
        </View>
      ) : null}
    </View>
  );

  const renderPageHeader = () =>
    compactHeaderHeight > 0 ? (
      <View
        fixed
        style={{
          position: 'absolute',
          top: margins.top,
          left: margins.left,
          right: margins.right,
          height: compactHeaderHeight,
        }}
        render={({ pageNumber }) => {
          if (pageNumber === 1) return null;
          if (options.header.continuation === 'full') return fullHeader(pageNumber);
          return (
            <View>
              {renderBrandingBand(pageNumber, laterBandHeight, false)}
              {options.header.continuation === 'compact' && (
                <View
                  style={{
                    borderBottomWidth: options.border.dividers ? 0.6 : 0,
                    borderBottomColor: borderColor,
                    paddingBottom: 5,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {compactLogo && (
                      <Image
                        src={compactLogo.src}
                        style={{
                          width: compactLogoSize,
                          height: compactLogoSize,
                          objectFit: 'contain',
                          marginRight: 7,
                        }}
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      {schoolName ? (
                        <Text style={{ fontWeight: 700, fontSize }}>{runs(schoolName)}</Text>
                      ) : null}
                      <Text style={{ fontSize: fontSize - 1 }}>{runs(title)}</Text>
                    </View>
                    {!!compactRegistrationWidth && (
                      <View style={{ width: compactRegistrationWidth }}>
                        {writingLine(model.labels.registrationNumber, model.registrationNumber)}
                      </View>
                    )}
                  </View>
                  {options.header.registrationNumber &&
                    !compactRegistrationWidth &&
                    writingLine(model.labels.registrationNumber, model.registrationNumber)}
                </View>
              )}
            </View>
          );
        }}
      />
    ) : null;
  const renderBorder = () =>
    options.border.enabled ? (
      <View
        fixed
        style={{
          position: 'absolute',
          top: options.border.inset * PRINT_MM,
          bottom: options.border.inset * PRINT_MM,
          left: options.border.inset * PRINT_MM,
          right: options.border.inset * PRINT_MM,
        }}
        render={({ pageNumber }) =>
          options.border.placement === 'every' || pageNumber === 1 ? (
            <View
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                borderWidth:
                  options.border.thickness === 'thick'
                    ? 1.5
                    : options.border.thickness === 'medium'
                      ? 1
                      : 0.5,
                borderColor,
                borderRadius: options.border.corners === 'rounded' ? 7 : 0,
              }}
            >
              {options.border.style === 'double' ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 3,
                    bottom: 3,
                    left: 3,
                    right: 3,
                    borderWidth: 0.5,
                    borderColor,
                    borderRadius: options.border.corners === 'rounded' ? 5 : 0,
                  }}
                />
              ) : null}
            </View>
          ) : null
        }
      />
    ) : null;
  const renderFooter = () =>
    footerHeight ? (
      <Text
        fixed
        style={{
          position: 'absolute',
          bottom: margins.bottom,
          left: margins.left,
          right: margins.right,
          height: footerHeight,
          fontSize: 8,
          fontFamily: familyFor(model.labels.page),
          textAlign: options.footer.alignment,
        }}
        render={({ pageNumber, totalPages }) => {
          if (
            (options.footer.placement === 'first' && pageNumber !== 1) ||
            (options.footer.placement === 'last' && pageNumber !== totalPages)
          )
            return '';
          return [
            options.footer.schoolName ? branding.schoolName : '',
            options.footer.formTitle ? title : '',
            options.footer.registrationReference && model.registrationNumber
              ? `${model.labels.registrationNumber} ${model.registrationNumber}`
              : '',
            options.footer.pageNumbers
              ? `${model.labels.page} ${pageNumber} ${model.labels.of} ${totalPages}`
              : '',
          ]
            .filter(Boolean)
            .join(' | ');
        }}
      />
    ) : null;

  const photoBlock = () => (
    <View
      key="photos"
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: photoPosition,
        marginVertical: 5,
      }}
    >
      {photos.map((field) => renderPhoto(field))}
    </View>
  );

  const renderChoices = (field: AdmissionPrintField) => {
    const choices = field.options?.length
      ? field.options
      : [
          { value: 'true', label: model.labels.yes },
          { value: 'false', label: model.labels.no },
        ];
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {choices.map((choice) => {
          const selected =
            model.mode === 'filled' &&
            (field.kind === 'checkbox'
              ? field.value === (choice.value === 'true' ? model.labels.yes : model.labels.no)
              : field.selectedValues?.includes(choice.value));
          return (
            <View
              key={choice.value}
              wrap={false}
              style={{ flexDirection: 'row', marginRight: 12, marginBottom: 4 }}
            >
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderWidth: 0.6,
                  borderColor,
                  marginRight: 4,
                  marginTop: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected ? <Text style={{ fontSize: 7, fontFamily: baseFamily }}>X</Text> : null}
              </View>
              <Text>{runs(choice.label)}</Text>
            </View>
          );
        })}
      </View>
    );
  };
  const renderAnswer = (field: AdmissionPrintField, availableWidth: number, padding: number) => {
    const settings = options.fields[field.code.toUpperCase()] ?? {};
    const boxedAnswer =
      settings.answerStyle === 'boxes' ||
      (settings.answerStyle !== 'line' &&
        model.mode === 'blank' &&
        boxed &&
        field.writingFormat &&
        field.writingFormat !== 'line');
    if (field.kind === 'photo') return renderPhoto(field, availableWidth - padding * 2);
    if (field.kind === 'static') return null;
    if (
      (settings.answerStyle === 'checkboxes' ||
        (!['line', 'boxes'].includes(settings.answerStyle ?? '') &&
          (model.mode === 'blank' || options.copies.selectedChoices === 'mark'))) &&
      ((field.kind === 'choice' && field.options?.length) || field.kind === 'checkbox')
    )
      return renderChoices(field);
    if (
      boxedAnswer &&
      field.kind !== 'multiline' &&
      !/(RegistrationNumber|ApplicationNumber)$/i.test(field.bindingKey ?? '')
    ) {
      const capacity = Math.max(1, Math.floor((availableWidth - padding * 2) / 14));
      const wanted =
        field.writingFormat === 'date'
          ? 8
          : field.writingFormat === 'phone' || field.writingFormat === 'pan'
            ? 10
            : field.writingFormat === 'aadhaar'
              ? 12
              : capacity;
      const letters =
        model.mode === 'filled' && field.value
          ? Array.from(
              field.writingFormat === 'date'
                ? field.value.replace(/\D/g, '') || field.value
                : field.value
            )
          : Array.from({ length: wanted }, () => '');
      const count = Math.max(wanted, letters.length);
      const rows = Array.from({ length: Math.ceil(count / capacity) }, (_, row) =>
        letters.slice(row * capacity, (row + 1) * capacity)
      );
      return (
        <View>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: 'row', marginBottom: 3 }}>
              {row.map((letter, index) => (
                <View
                  key={index}
                  style={{
                    width:
                      Math.min(18, (availableWidth - padding * 2) / Math.min(capacity, wanted)) - 1,
                    height: fontSize + 12,
                    marginRight: 1,
                    borderWidth: 0.5,
                    borderColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize }}>{runs(letter || ' ')}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }
    const lineCount =
      settings.writingLines ??
      (field.kind === 'multiline' ? (model.settings.layout === 'spacious' ? 3 : 2) : 1);
    return (
      <View style={{ minHeight: fontSize + 10 }}>
        {model.mode === 'filled' && field.value ? (
          <Text
            orphans={2}
            widows={2}
            style={{
              borderBottomWidth: 0.5,
              borderBottomColor: borderColor,
              paddingBottom: 5,
            }}
          >
            {runs(displayValue(field))}
          </Text>
        ) : (
          Array.from({ length: lineCount }, (_, index) => (
            <View
              key={index}
              style={{
                height: fontSize + 10,
                borderBottomWidth: 0.5,
                borderBottomColor: borderColor,
              }}
            />
          ))
        )}
      </View>
    );
  };
  const renderField = (
    field: AdmissionPrintField,
    width: number,
    padding: number,
    destination?: string
  ) => {
    const settings = options.fields[field.code.toUpperCase()] ?? {};
    const label = `${field.label}${field.required && settings.showRequired !== false ? ' *' : ''}`;
    const inline =
      settings.labelPosition === 'inline' && field.kind !== 'photo' && field.kind !== 'static';
    return (
      <View
        key={field.key}
        style={{
          width: `${width * 100}%`,
          padding,
          borderWidth: options.border.fieldBorders && boxed ? 0.5 : 0,
          borderRightColor: borderColor,
        }}
      >
        <View style={{ flexDirection: inline ? 'row' : 'column' }}>
          <Text
            id={destination}
            minPresenceAhead={fontSize * 2}
            style={{
              width: inline ? '35%' : '100%',
              paddingRight: inline ? 7 : 0,
              fontSize: fontSize - 1,
              fontWeight: labelWeight,
              marginBottom: 4,
            }}
          >
            {runs(label)}
          </Text>
          <View style={{ width: inline ? '65%' : '100%' }}>
            {renderAnswer(field, contentWidth * width * (inline ? 0.65 : 1), padding)}
          </View>
        </View>
        {settings.showHelp && field.helpText ? (
          <Text style={{ fontSize: fontSize - 2, marginTop: 4 }}>{runs(field.helpText)}</Text>
        ) : null}
        {model.mode === 'blank' && settings.showConditional !== false && field.conditional ? (
          <Text style={{ fontSize: fontSize - 2, marginTop: 3 }}>
            {runs(model.labels.conditional)}
          </Text>
        ) : null}
      </View>
    );
  };
  const sectionHeading = (section: AdmissionPrintSection, link = true) => (
    <View
      wrap={false}
      minPresenceAhead={
        options.sections[section.code.toUpperCase()]?.keepHeading === false ? 0 : 50
      }
      style={{
        flexDirection: 'row',
        padding: 7,
        backgroundColor: options.style.sectionFill,
        borderWidth: options.border.sectionBorders ? 0.6 : 0,
        borderColor,
      }}
    >
      {options.flow.sectionNumbers ? (
        <Text style={{ width: 25, fontWeight: 700 }}>
          {String(sectionNumbers.get(section.key)).padStart(2, '0')}
        </Text>
      ) : null}
      <Text id={link ? `section:${section.key}` : undefined} style={{ flex: 1, fontWeight: 700 }}>
        {runs(section.title)}
      </Text>
    </View>
  );
  const renderRegularSection = (
    section: AdmissionPrintSection,
    stepHeading: ReactNode,
    startNewPage: boolean
  ) => {
    const config = options.sections[section.code.toUpperCase()] ?? {};
    const padding = config.spacing ? (config.spacing === 'spacious' ? 10 : 6) : defaultPadding;
    const entries = section.entries
      .map((entry) => ({
        entry,
        rows: advancedFieldRows(section, visibleFields(entry.fields), options, model),
      }))
      .filter(({ rows }) => rows.length > 0);
    const keepHeading = config.keepHeading !== false;
    const sectionSpacing = config.spacing === 'spacious' ? 15 : 10;
    const heading = (
      <>
        {stepHeading}
        {sectionHeading(section)}
      </>
    );
    const rowCanWrap = (row: AdvancedPrintCell[]) =>
      row.some(
        ({ field }) => field.value.length + field.label.length + (field.helpText?.length ?? 0) > 700
      );
    const renderRow = (row: AdvancedPrintCell[], key: string, link: boolean, marginBottom = 0) => (
      <View
        key={key}
        wrap={rowCanWrap(row)}
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          marginBottom,
          borderLeftWidth: options.border.sectionBorders ? 0.5 : 0,
          borderRightWidth: options.border.sectionBorders ? 0.5 : 0,
          borderBottomWidth: options.border.fieldBorders ? 0.5 : 0,
          borderColor,
        }}
      >
        {row.map(({ field, width }) =>
          renderField(field, width, padding, link ? `field:${section.key}:${field.key}` : undefined)
        )}
      </View>
    );
    const nodes: ReactNode[] = keepHeading
      ? []
      : [
          <View key={`${section.key}-heading`} wrap={false} break={startNewPage}>
            {heading}
          </View>,
        ];

    // Give the paginator rows as direct siblings so a split section cannot compress its rows.
    entries.forEach(({ entry, rows: [firstRow, ...remainingRows] }, index) => {
      const key = `${section.key}-${entry.key}`;
      const withHeading = keepHeading && index === 0;
      const lastEntry = index === entries.length - 1;
      nodes.push(
        <View
          key={`${key}-first`}
          wrap={rowCanWrap(firstRow)}
          break={withHeading && startNewPage}
          style={{ marginBottom: lastEntry && !remainingRows.length ? sectionSpacing : 0 }}
        >
          {withHeading && heading}
          {entry.label && (
            <Text
              minPresenceAhead={45}
              style={{ fontWeight: 700, paddingVertical: 5, paddingHorizontal: padding }}
            >
              {runs(entry.label)}
            </Text>
          )}
          {renderRow(firstRow, `${key}-0`, index === 0)}
        </View>
      );
      remainingRows.forEach((row, rowIndex) => {
        const lastRow = lastEntry && rowIndex === remainingRows.length - 1;
        nodes.push(
          renderRow(row, `${key}-${rowIndex + 1}`, index === 0, lastRow ? sectionSpacing : 0)
        );
      });
    });
    return nodes;
  };

  const tableFields = (section: AdmissionPrintSection) =>
    visibleFields(section.entries[0]?.fields ?? []);
  const tableFieldCaption = (field: AdmissionPrintField) => {
    const config = options.fields[field.code.toUpperCase()] ?? {};
    return [
      `${field.label}${field.required && config.showRequired !== false ? ' *' : ''}`,
      config.showHelp ? field.helpText : '',
      model.mode === 'blank' && config.showConditional !== false && field.conditional
        ? model.labels.conditional
        : '',
    ]
      .filter(Boolean)
      .join('\n');
  };
  const tableHeadingHeight = (section: AdmissionPrintSection) => {
    const fields = tableFields(section);
    return (
      33 +
      (tableStepTitle(section) ? fontSize + 14 : 0) +
      Math.max(
        ...fields.map(
          (field) =>
            estimatePrintTextLines(
              tableFieldCaption(field),
              contentWidth / Math.max(fields.length, 1) - 12,
              (fontSize - 1) * 0.6
            ) *
            (fontSize + 2)
        ),
        20
      )
    );
  };
  const renderTableHeading = (section: AdmissionPrintSection, link = true) => (
    <View wrap={false}>
      {tableStepTitle(section) ? (
        <Text style={{ fontSize: fontSize + 1, fontWeight: 700, paddingBottom: 7 }}>
          {runs(tableStepTitle(section)!)}
        </Text>
      ) : null}
      {sectionHeading(section, link)}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: options.style.sectionFill,
          borderBottomWidth: 0.5,
          borderColor,
        }}
      >
        {tableFields(section).map((field) => (
          <Text
            key={field.key}
            id={link ? `field:${section.key}:${field.key}` : undefined}
            style={{
              width: `${100 / Math.max(tableFields(section).length, 1)}%`,
              fontWeight: labelWeight,
              fontSize: fontSize - 1,
              padding: 6,
              borderWidth: options.border.fieldBorders ? 0.5 : 0,
              borderColor,
            }}
          >
            {runs(tableFieldCaption(field))}
          </Text>
        ))}
      </View>
    </View>
  );
  const renderTableRows = (section: AdmissionPrintSection) =>
    section.entries.map((entry) => {
      const fields = visibleFields(entry.fields);
      const widths = 1 / Math.max(fields.length, 1);
      const long = fields.some((field) => field.value.length > 1000);
      return (
        <View
          key={entry.key}
          wrap={long}
          style={{
            flexDirection: 'row',
            borderLeftWidth: options.border.sectionBorders ? 0.5 : 0,
            borderBottomWidth: options.border.fieldBorders ? 0.5 : 0,
            borderColor,
          }}
        >
          {fields.map((field) => (
            <View
              key={field.key}
              style={{
                width: `${100 * widths}%`,
                padding: 6,
                borderRightWidth: options.border.fieldBorders ? 0.5 : 0,
                borderRightColor: borderColor,
              }}
            >
              {renderAnswer(field, contentWidth * widths, 6)}
            </View>
          ))}
        </View>
      );
    });

  const contentHeading = (label: string) => (
    <Text
      minPresenceAhead={40}
      style={{ fontWeight: 700, fontSize: fontSize + 1, marginBottom: 7 }}
    >
      {runs(label)}
    </Text>
  );
  const instructions = () =>
    options.content.showInstructions && copy.instructions?.trim() ? (
      <View key="instructions" style={{ marginVertical: 10 }}>
        {contentHeading(model.labels.instructions)}
        {copy.instructions
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ width: 12 }}>{runs('•')}</Text>
              <Text style={{ flex: 1 }} orphans={2} widows={2}>
                {runs(item)}
              </Text>
            </View>
          ))}
      </View>
    ) : null;
  const checklist = () =>
    options.content.showChecklist && copy.checklist?.some((item) => item.trim()) ? (
      <View key="checklist" style={{ marginVertical: 10 }}>
        {contentHeading(model.labels.checklist)}
        {copy.checklist
          .filter((item) => item.trim())
          .map((item, index) => (
            <View key={index} wrap={false} style={{ flexDirection: 'row', marginBottom: 6 }}>
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderWidth: 0.5,
                  borderColor,
                  marginTop: 2,
                  marginRight: 6,
                }}
              />
              <Text style={{ flex: 1 }}>{runs(item)}</Text>
            </View>
          ))}
      </View>
    ) : null;
  const declaration = () =>
    options.content.showDeclaration && copy.declaration?.trim() ? (
      <View key="declaration" style={{ marginVertical: 10 }}>
        {contentHeading(model.labels.declaration)}
        <Text orphans={2} widows={2}>
          {runs(copy.declaration)}
        </Text>
      </View>
    ) : null;
  const signatures = () =>
    model.settings.showSignature &&
    (options.content.parentSignature ||
      options.content.officeSignature ||
      options.content.signatureDate) ? (
      <View key="signatures" wrap={false} style={{ marginTop: 18, marginBottom: 9 }}>
        {contentHeading(model.labels.signature)}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingTop: 4,
          }}
        >
          {[
            {
              key: 'parent',
              enabled: options.content.parentSignature,
              label: copy.parentLabel || model.labels.parentSignature,
              image: options.content.parentSignatureImage,
            },
            {
              key: 'office',
              enabled: options.content.officeSignature,
              label: copy.officeLabel || model.labels.officeSignature,
              image: options.content.officeSignatureImage,
            },
          ]
            .filter(({ enabled }) => enabled)
            .map(({ key, label, image }) => (
              <View
                key={key}
                style={{
                  width:
                    options.content.parentSignature && options.content.officeSignature
                      ? '43%'
                      : '100%',
                }}
              >
                {image ? (
                  <Image src={image} style={{ width: '100%', height: 28, objectFit: 'contain' }} />
                ) : (
                  <View
                    style={{
                      height: 28,
                      borderBottomWidth: 0.5,
                      borderBottomColor: borderColor,
                    }}
                  />
                )}
                <Text style={{ fontSize: fontSize - 1, paddingTop: 5 }}>{runs(label)}</Text>
              </View>
            ))}
        </View>
        {options.content.signatureDate ? writingLine(model.labels.date, '', 0.45) : null}
      </View>
    ) : null;
  const officeUse = () =>
    options.content.showOfficeUse ? (
      <View
        key="office"
        style={{
          marginTop: 14,
          padding: 9,
          borderWidth: options.border.sectionBorders ? 0.7 : 0,
          borderColor,
        }}
      >
        {contentHeading(model.labels.officeUse)}
        {options.content.documentChecks ? (
          <View style={{ marginBottom: 7 }}>
            <Text minPresenceAhead={fontSize + 6} style={{ marginBottom: 5 }}>
              {runs(model.labels.documentChecks)}
            </Text>
            {(copy.checklist?.filter((item) => item.trim()) ?? []).map((item, index) => (
              <View key={index} wrap={false} style={{ flexDirection: 'row', marginBottom: 4 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderWidth: 0.5,
                    borderColor,
                    marginRight: 5,
                    marginTop: 2,
                  }}
                />
                <Text style={{ flex: 1 }}>{runs(item)}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {options.content.remarks ? (
          <View wrap={false}>
            <Text>{runs(model.labels.remarks)}</Text>
            <View style={{ height: 25, borderBottomWidth: 0.5, borderBottomColor: borderColor }} />
          </View>
        ) : null}
        {options.content.verificationDate ? (
          <View wrap={false}>{writingLine(model.labels.verificationDate, '', 0.6)}</View>
        ) : null}
        {options.content.stamp ? (
          <View
            wrap={false}
            style={{
              alignSelf: 'flex-end',
              width: 105,
              height: 65,
              borderWidth: 0.5,
              borderColor,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: fontSize - 1 }}>{runs(model.labels.stamp)}</Text>
          </View>
        ) : null}
      </View>
    ) : null;

  const parts: Part[] = [];
  let regular: Part = { key: 'body-0', nodes: [] };
  const push = (node: ReactNode) => {
    if (node) regular.nodes.push(node);
  };
  const newPageBlock = (key: string, node: ReactNode) => {
    if (node)
      push(
        <View key={key} break={regular.nodes.length > 0 || parts.length > 0}>
          {node}
        </View>
      );
  };
  if (
    options.content.instructionsPlacement === 'first' ||
    (options.content.instructionsPlacement === 'section' &&
      !model.steps.some((step) =>
        step.sections.some(
          (section) =>
            section.code.toUpperCase() === options.content.instructionSection.toUpperCase()
        )
      ))
  )
    push(instructions());
  if (options.content.instructionsPlacement === 'separate-page' && instructions()) {
    push(instructions());
    push(<View key="after-instructions" break />);
  }
  if (options.content.checklistPlacement === 'first') push(checklist());
  if (movedPhotos && options.photo.placement === 'first') push(photoBlock());
  model.steps.forEach((step) => {
    step.sections
      .filter((section) => section.entries.some((entry) => visibleFields(entry.fields).length))
      .forEach((section, index) => {
        const config = options.sections[section.code.toUpperCase()] ?? {};
        const tableBodySpace = section.repeatable ? bodyCapacity - tableHeadingHeight(section) : 0;
        // Reserve a writing line (font size + 10), cell padding (12), and borders (2).
        // A fixed heading that consumes the body prevents the PDF paginator from advancing.
        const table = section.repeatable && tableBodySpace >= fontSize + 24;
        const tableIsLong =
          table && estimatedTableHeight(section, options, contentWidth) > tableBodySpace;
        const largeTable = tableIsLong && config.repeatTableHeadings !== false;
        const stepHeading =
          options.flow.stepTitles &&
          index === 0 &&
          !step.sections.every((part) => part.title === step.title) ? (
            <Text
              key={`step-${step.key}`}
              minPresenceAhead={60}
              style={{ fontSize: fontSize + 2, fontWeight: 700, marginTop: 10, marginBottom: 7 }}
            >
              {runs(step.title)}
            </Text>
          ) : null;
        if (
          options.content.instructionsPlacement === 'section' &&
          options.content.instructionSection.toUpperCase() === section.code.toUpperCase()
        )
          push(instructions());
        if (largeTable) {
          if (regular.nodes.length) parts.push(regular);
          parts.push({
            key: `table-${section.key}`,
            nodes: [],
            table: section,
          });
          regular = { key: `body-${parts.length}`, nodes: [] };
        } else {
          const startNewPage = Boolean(
            config.startNewPage && (regular.nodes.length || parts.length)
          );
          if (table) {
            push(
              <View key={section.key} break={startNewPage}>
                {stepHeading}
                <View wrap={Boolean(tableIsLong)} style={{ marginBottom: 10 }}>
                  {renderTableHeading(section)}
                  {renderTableRows(section)}
                </View>
              </View>
            );
          } else {
            regular.nodes.push(...renderRegularSection(section, stepHeading, startNewPage));
          }
        }
      });
  });
  if (movedPhotos && options.photo.placement === 'last') push(photoBlock());
  if (options.content.instructionsPlacement === 'before-declaration') push(instructions());
  if (options.content.checklistPlacement === 'last') push(checklist());
  if (options.content.checklistPlacement === 'separate-page')
    newPageBlock('checklist-page', checklist());
  push(declaration());
  if (options.content.signaturePlacement === 'separate-page')
    newPageBlock('signature-page', signatures());
  else push(signatures());
  if (options.content.officePlacement === 'separate-page') newPageBlock('office-page', officeUse());
  else push(officeUse());
  if (regular.nodes.length || !parts.length) parts.push(regular);

  return (
    <Document title={title} language={`${model.language}-IN`}>
      {parts.map((part, partIndex) => {
        const tableHeight = part.table ? tableHeadingHeight(part.table) : 0;
        const firstFlowHeader = partIndex === 0;
        const flowingPhotoHeader = firstFlowHeader && Boolean(headerPhoto);
        return (
          <Page
            key={part.key}
            size={model.settings.paperSize}
            orientation={options.paper.orientation}
            wrap
            style={{
              paddingTop: margins.top + compactHeaderHeight + tableHeight + 7,
              paddingBottom: margins.bottom + footerHeight + 7,
              paddingLeft: margins.left,
              paddingRight: margins.right,
              fontFamily: familyFor(model.language === 'hi' ? model.labels.page : ''),
              fontSize,
              color: textColor,
            }}
          >
            {renderBorder()}
            {renderPageHeader()}
            {firstFlowHeader ? (
              <View
                wrap={false}
                style={{
                  marginTop: -compactHeaderHeight - tableHeight - 7,
                  ...(flowingPhotoHeader
                    ? { paddingBottom: 7 }
                    : { height: fullHeaderHeight + tableHeight + 7 }),
                }}
              >
                {fullHeader(1)}
                {flowingPhotoHeader && part.table && (
                  <View style={{ marginTop: 3 }}>{renderTableHeading(part.table)}</View>
                )}
              </View>
            ) : null}
            {part.table ? (
              <>
                <View
                  fixed
                  style={{
                    position: 'absolute',
                    top: margins.top + compactHeaderHeight + 3,
                    left: margins.left,
                    right: margins.right,
                  }}
                  render={({ pageNumber, subPageNumber }) =>
                    flowingPhotoHeader && pageNumber === 1 ? null : (
                      <View
                        style={{
                          marginTop:
                            firstFlowHeader && pageNumber === 1
                              ? fullHeaderHeight - compactHeaderHeight
                              : 0,
                        }}
                      >
                        {renderTableHeading(part.table!, subPageNumber === 1)}
                      </View>
                    )
                  }
                />
                {renderTableRows(part.table)}
              </>
            ) : (
              part.nodes
            )}
            {renderFooter()}
          </Page>
        );
      })}
    </Document>
  );
}
