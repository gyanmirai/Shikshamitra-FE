import {
  ADMISSION_PRINT_BRANDING_ASPECT,
  resolveAdmissionPrintAdvancedSettings,
} from 'src/redux/student/admissions/admission-form-print-settings';

import { estimatePrintTextLines } from './form-print-text-layout';

import type {
  AdmissionPrintField,
  AdmissionPrintSection,
  AdmissionPrintDocument,
  AdmissionPrintBranding,
} from './form-print-model';

export const PRINT_MM = 72 / 25.4;
export const formatAdmissionPrintPhotoSize = (width: number, height: number) => {
  const toMillimeters = (points: number) => Math.round((points * 10) / PRINT_MM) / 10;
  return `${toMillimeters(width)} × ${toMillimeters(height)} mm`;
};

export const PRINT_PAPER_POINTS = {
  A4: [595.28, 841.89],
  A5: [419.53, 595.28],
  LETTER: [612, 792],
  LEGAL: [612, 1008],
} as const;
export type AdvancedPrintOptions = ReturnType<typeof resolveAdmissionPrintAdvancedSettings>;
export type AdvancedPrintCell = { field: AdmissionPrintField; width: number };

/** Gallery identity includes the repeat entry; field IDs alone repeat for siblings/children. */
export function collectAdvancedPrintPhotos(model: AdmissionPrintDocument) {
  return model.steps.flatMap((step) => step.sections.flatMap((section) => section.entries.flatMap((entry) => entry.fields.filter((field) => field.kind === 'photo').map((field) => ({
    ...field, key: `${entry.key}:${field.key}`, label: entry.label ? `${entry.label}: ${field.label}` : field.label,
  })))));
}

export function advancedPrintGeometry(
  model: AdmissionPrintDocument,
  options: AdvancedPrintOptions
) {
  const size = PRINT_PAPER_POINTS[model.settings.paperSize] ?? PRINT_PAPER_POINTS.A4;
  const [width, height] = options.paper.orientation === 'landscape' ? [...size].reverse() : size;
  const edge = options.border.enabled ? (options.border.inset + 2) * PRINT_MM : 0;
  const margins = Object.fromEntries(
    Object.entries(options.paper.margins).map(([side, mm]) => [side, Math.max(mm * PRINT_MM, edge)])
  ) as Record<'top' | 'right' | 'bottom' | 'left', number>;
  return { width, height, margins, contentWidth: width - margins.left - margins.right };
}

/** Fixed header/footer reservations and the preview guard deliberately use one measurement source. */
export function advancedHeaderGeometry(
  model: AdmissionPrintDocument,
  branding: AdmissionPrintBranding,
  options: AdvancedPrintOptions,
  geometry = advancedPrintGeometry(model, options)
) {
  const { contentWidth, height, margins } = geometry;
  const fontSize = options.style.baseSize;
  const title = options.header.title.trim() || model.title;
  const schoolHeader = model.settings.showSchoolHeader;
  const assets = [
    ...(schoolHeader && options.branding.showLogo && branding.logoUrl
      ? [{ key: 'logo', src: branding.logoUrl, placement: options.branding.logo }]
      : []),
    ...(schoolHeader && options.branding.showBanner && branding.bannerUrl
      ? [{ key: 'banner', src: branding.bannerUrl, placement: options.branding.banner }]
      : []),
  ];
  const logo = assets.find((asset) => asset.key === 'logo');
  const banner = assets.find((asset) => asset.key === 'banner');
  const { bannerPlacement, bannerPages } = options.branding;
  const showBannerOnPage = (page: number) =>
    bannerPlacement === 'every' ||
    (bannerPlacement === 'first' ? page === 1 : bannerPages.includes(page));
  const bandHeight = contentWidth / ADMISSION_PRINT_BRANDING_ASPECT;
  const firstBandHeight = logo || (banner && showBannerOnPage(1)) ? bandHeight : 0;
  // Use one continuation height so adding the banner cannot move its selected page.
  const laterHasBanner =
    banner &&
    (bannerPlacement === 'every' ||
      (bannerPlacement === 'selected' && bannerPages.some((page) => page > 1)));
  const laterBandHeight =
    laterHasBanner || (logo && options.header.continuation === 'full') ? bandHeight : 0;
  const address =
    schoolHeader && options.header.address
      ? (branding.addressLines?.filter((line) => line.trim()) ?? [])
      : [];
  const contacts = schoolHeader
    ? ([
        options.header.phone ? branding.schoolPhone : '',
        options.header.email ? branding.schoolEmail : '',
        options.header.website ? branding.schoolWebsite : '',
      ].filter(Boolean) as string[])
    : [];
  const schoolName = schoolHeader && options.header.schoolName ? (branding.schoolName ?? '') : '';
  const academicKeys = (['board', 'medium', 'class', 'academicYear'] as const).filter(
    (key) => options.header[key]
  );
  const showHeaderPhoto = model.settings.showPhoto && options.photo.placement === 'header-top-right';
  const photoFields = showHeaderPhoto
    ? model.steps
        .flatMap((step) => step.sections)
        .flatMap((section) => section.entries)
        .flatMap((entry) => entry.fields)
        .filter((field) => field.kind === 'photo')
    : [];
  const selectedPhoto =
    photoFields.find((field) => /^Applicant\.ProfilePhoto$/i.test(field.bindingKey ?? '')) ??
    photoFields[0];
  const headerPhoto = selectedPhoto
    ? {
        width: Math.min(options.photo.width * PRINT_MM, contentWidth * 0.38),
        gap: 12,
        field: selectedPhoto,
      }
    : undefined;
  const textHeight = (width: number) =>
    (schoolName
      ? estimatePrintTextLines(schoolName, width, options.style.titleSize * 0.6) *
        (options.style.titleSize + 4)
      : 0) +
    [...address, ...contacts].reduce(
      (total, line) =>
        total + estimatePrintTextLines(line, width, fontSize * 0.55) * (fontSize + 3),
      0
    ) +
    estimatePrintTextLines(title, width, options.style.titleSize * 0.6) *
      (options.style.titleSize + 4) +
    (options.header.subtitle
      ? estimatePrintTextLines(options.header.subtitle, width, fontSize * 0.55) *
        (fontSize + 3)
      : 0);
  const metadataHeight =
    (options.header.registrationNumber || options.header.date ? fontSize + 19 : 0) +
    Math.ceil(academicKeys.length / 2) * (fontSize + 16);
  const headerHeight = textHeight(contentWidth) + metadataHeight + 17;
  const fullHeaderHeight =
    firstBandHeight +
    (headerPhoto
      ? Math.max(
          textHeight(contentWidth - headerPhoto.width - headerPhoto.gap),
          (options.photo.height * headerPhoto.width) / options.photo.width +
            estimatePrintTextLines(
              options.photo.caption || headerPhoto.field.label || model.labels.photo,
              headerPhoto.width,
              (fontSize - 2) * 0.6
            ) *
              (fontSize + 1) +
            3
        ) + metadataHeight + 17
      : headerHeight);
  const compactLogo = logo;
  const compactLogoSize = 22;
  const compactRegistrationWidth =
    options.header.registrationNumber && contentWidth >= 260 ? 125 : 0;
  const compactTextWidth =
    contentWidth - (compactLogo ? compactLogoSize + 7 : 0) - compactRegistrationWidth;
  const compactTextHeight = [schoolName, title]
    .filter(Boolean)
    .reduce(
      (total, line) =>
        total + estimatePrintTextLines(line, compactTextWidth, fontSize * 0.6) * (fontSize + 3),
      0
    );
  const continuationTextHeight =
    options.header.continuation === 'none'
      ? 0
      : options.header.continuation === 'full'
        ? headerHeight
        : Math.max(compactTextHeight, compactLogo ? compactLogoSize : 0) +
          (options.header.registrationNumber && !compactRegistrationWidth ? fontSize + 16 : 0) +
          7;
  const compactHeaderHeight = laterBandHeight + continuationTextHeight;
  const footerPreview = [
    options.footer.schoolName ? branding.schoolName : '',
    options.footer.formTitle ? title : '',
    options.footer.registrationReference ? model.registrationNumber : '',
    options.footer.pageNumbers ? `${model.labels.page} 999 ${model.labels.of} 999` : '',
  ]
    .filter(Boolean)
    .join(' | ');
  const footerHeight =
    options.footer.placement === 'none' || !footerPreview
      ? 0
      : estimatePrintTextLines(footerPreview, contentWidth, 4.8) * 11 + 8;
  const bodyCapacity =
    height -
    margins.top -
    margins.bottom -
    Math.max(fullHeaderHeight, compactHeaderHeight) -
    footerHeight -
    20;
  return {
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
  };
}

export class AdmissionPrintLayoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdmissionPrintLayoutError';
  }
}

/** Lightweight preflight for impossible physical combinations; callers may show this safe message. */
export function getAdmissionPrintLayoutError(
  model: AdmissionPrintDocument,
  branding: AdmissionPrintBranding = {}
) {
  if (!model.settings.advanced) return undefined;
  const options = resolveAdmissionPrintAdvancedSettings(model.settings.advanced);
  const geometry = advancedPrintGeometry(model, options);
  const header = advancedHeaderGeometry(model, branding, options, geometry);
  const firstPhotoSpace =
    model.settings.showPhoto &&
    options.photo.placement === 'first' &&
    model.steps.some((step) =>
      step.sections.some((section) =>
        section.entries.some((entry) => entry.fields.some((field) => field.kind === 'photo'))
      )
    )
      ? options.photo.height * PRINT_MM + 25
      : 0;
  if (geometry.contentWidth < 100 || header.bodyCapacity < Math.max(60, firstPhotoSpace)) {
    return 'The header does not fit this paper layout. Choose a larger paper size or portrait orientation, reduce header details, photo size, or margins.';
  }
  return undefined;
}

/** Print overrides change paper presentation, never the order or identity of authored questions. */
export function advancedFieldRows(
  section: AdmissionPrintSection,
  fields: AdmissionPrintField[],
  options: AdvancedPrintOptions,
  model: AdmissionPrintDocument
): AdvancedPrintCell[][] {
  const sectionSettings = options.sections[section.code.toUpperCase()] ?? {};
  const columns = sectionSettings.fullWidth ? 1 : (sectionSettings.columns ?? section.columns);
  const rows: AdvancedPrintCell[][] = [];
  let row: AdvancedPrintCell[] = [];
  let used = 0;
  fields.forEach((field) => {
    const overrides = options.fields[field.code.toUpperCase()] ?? {};
    const handwriting =
      model.mode === 'blank' &&
      (overrides.answerStyle === 'boxes' ||
        (model.settings.template === 'boxed-grid' &&
          overrides.answerStyle !== 'line' &&
          field.writingFormat &&
          field.writingFormat !== 'line'));
    const width =
      overrides.width === 'full'
        ? 1
        : overrides.width === 'half'
          ? 0.5
          : field.kind === 'multiline' || field.kind === 'static' || field.value.length > 200
            ? 1
            : handwriting
              ? 1 / Math.min(2, columns)
              : 1 / columns;
    if (used + width > 1.001 && row.length) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push({ field, width });
    used += width;
    if (used >= 0.999) {
      rows.push(row);
      row = [];
      used = 0;
    }
  });
  if (row.length) rows.push(row);
  return rows;
}

export function estimatedTableHeight(
  section: AdmissionPrintSection,
  options: AdvancedPrintOptions,
  width: number
) {
  const size = options.style.baseSize;
  return section.entries.reduce(
    (total, entry) =>
      total +
      Math.max(
        ...entry.fields.map(
          (field) =>
            Math.max(
              1,
              Math.ceil(
                (field.value.length || 12) / Math.max(8, width / entry.fields.length / (size * 0.6))
              )
            ) *
              size *
              1.5 +
            14
        ),
        30
      ),
    40
  );
}
