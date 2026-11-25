import type {
  AdmissionPrintHeaderElement,
  AdmissionPrintAssetPlacement,
} from 'src/redux/student/admissions/admission-form-print-settings';

import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { estimatePrintTextLines } from './form-print-text-layout';
import { advancedPrintGeometry, advancedHeaderGeometry } from './form-print-advanced-layout';

import type {
  AdmissionPrintField,
  AdmissionPrintBranding,
  AdmissionPrintDocument,
} from './form-print-model';

export type AdmissionPrintHeaderItem = {
  key: AdmissionPrintHeaderElement;
  placement: AdmissionPrintAssetPlacement;
  text?: string;
  value?: string;
  src?: string;
  field?: AdmissionPrintField;
};

export function getAdmissionPrintHeaderElements(
  model: AdmissionPrintDocument,
  branding: AdmissionPrintBranding,
  page = 1
) {
  const options = resolveAdmissionPrintAdvancedSettings(model.settings.advanced);
  const geometry = advancedPrintGeometry(model, options);
  const header = advancedHeaderGeometry(model, branding, options, geometry);
  const width = geometry.contentWidth;
  const full = page === 1 || options.header.continuation === 'full';
  const bandHeight = page === 1 ? header.firstBandHeight : header.laterBandHeight;
  const frameHeight = page === 1 ? header.fullHeaderHeight : header.compactHeaderHeight;
  const height = Math.max(0, full ? frameHeight - 8 : bandHeight);
  const elements: AdmissionPrintHeaderItem[] = [];

  const append = (
    item: Omit<AdmissionPrintHeaderItem, 'placement'>,
    box: AdmissionPrintAssetPlacement
  ) => {
    const saved = options.header.layout?.[item.key];
    const boxWidth = Math.min(100, Math.max(1, item.src && saved ? saved.width : box.width));
    const boxHeight = Math.min(100, Math.max(1, item.src && saved ? saved.height : box.height));
    elements.push({
      ...item,
      placement: {
        x: Math.min(100 - boxWidth, Math.max(0, saved?.x ?? box.x)),
        y: Math.min(100 - boxHeight, Math.max(0, saved?.y ?? box.y)),
        width: boxWidth,
        height: boxHeight,
        ...(item.src && { lockAspectRatio: saved?.lockAspectRatio ?? box.lockAspectRatio }),
      },
    });
  };
  const rect = (x: number, y: number, w: number, h: number) => ({
    x: (x / width) * 100,
    y: (y / height) * 100,
    width: (w / width) * 100,
    height: (h / height) * 100,
  });

  if (width <= 0 || height <= 0) return { width, height, elements };

  header.assets.forEach(({ key, src, placement }) => {
    if (key === 'logo' && !full) return;
    if (key === 'banner' && !header.showBannerOnPage(page)) return;
    append(
      { key: key as 'logo' | 'banner', src },
      {
        ...placement,
        y: (placement.y * bandHeight) / height,
        height: (placement.height * bandHeight) / height,
      }
    );
  });
  if (!full) return { width, height, elements };

  const photo = page === 1 ? header.headerPhoto : undefined;
  const availableWidth = width - (photo ? photo.width + photo.gap : 0);
  const font = options.style.baseSize;
  const titleFont = options.style.titleSize;
  let cursor = bandHeight ? bandHeight + 5 : 0;
  const startOfText = cursor;
  const addText = (key: AdmissionPrintHeaderElement, text: string, size: number) => {
    if (!text.trim()) return;
    const lines = text.split('\n');
    const longest = Math.max(...lines.map((line) => Array.from(line).length));
    const w = Math.min(availableWidth, Math.max(size * 4, (longest + 2) * size * 0.61));
    const lineCount = lines.reduce(
      (count, line) => count + estimatePrintTextLines(line, w, size * 0.6),
      0
    );
    const h = lineCount * (size + 3);
    const horizontalSpace = availableWidth - w;
    const x =
      options.header.alignment === 'left'
        ? 0
        : options.header.alignment === 'center'
          ? horizontalSpace / 2
          : horizontalSpace;
    append({ key, text }, rect(x, cursor, w, h));
    cursor += h;
  };

  addText('schoolName', header.schoolName, titleFont);
  addText('address', header.address.join('\n'), font - 1);
  if (model.settings.showSchoolHeader) {
    if (options.header.phone) addText('phone', branding.schoolPhone ?? '', font - 1);
    if (options.header.email) addText('email', branding.schoolEmail ?? '', font - 1);
    if (options.header.website) addText('website', branding.schoolWebsite ?? '', font - 1);
  }
  addText('title', options.header.title.trim() || model.title, titleFont);
  addText('subtitle', options.header.subtitle, font);

  if (photo) {
    const caption = options.photo.caption || photo.field.label || model.labels.photo;
    const captionLines = estimatePrintTextLines(caption, photo.width, (font - 2) * 0.6);
    const photoHeight = (options.photo.height * photo.width) / options.photo.width;
    const h = photoHeight + captionLines * (font + 1) + 3;
    append(
      { key: 'photo', field: photo.field, text: caption },
      rect(width - photo.width, startOfText, photo.width, h)
    );
    cursor = Math.max(cursor, startOfText + h);
  }

  const addLine = (
    key: AdmissionPrintHeaderElement,
    label: string,
    value: string,
    x: number,
    w: number
  ) => {
    // Leave room beside the label for a saved value or handwriting.
    append({ key, text: label, value }, rect(x, cursor + 5, w, font + 6));
  };
  const dateStart = options.header.registrationNumber ? width * 0.65 : 0;
  if (options.header.registrationNumber) {
    addLine(
      'registrationNumber',
      model.labels.registrationNumber,
      model.registrationNumber,
      0,
      options.header.date ? dateStart - 8 : width * 0.65
    );
  }
  if (options.header.date) addLine('date', model.labels.date, '', dateStart, width * 0.34);
  if (options.header.registrationNumber || options.header.date) cursor += font + 19;
  header.academicKeys.forEach((key, index) => {
    addLine(
      key,
      model.labels[key],
      model.academicDetails[key] ?? '',
      (index % 2) * width * 0.5,
      width * 0.48
    );
    if (index % 2 === 1) cursor += font + 16;
  });

  return { width, height, elements };
}
