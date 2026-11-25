import { validateIdentityCardLayout } from './validation';

import type { IdentityCardLayout, IdentityCardPrintSettings } from './types';

export { validateIdentityCardLayout } from './validation';

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
const EXACT_FIT_TOLERANCE = 0.000001;

export const DEFAULT_IDENTITY_CARD_PRINT_SETTINGS: IdentityCardPrintSettings = {
  pageSize: 'A4',
  units: 'mm',
  cardsPerPage: 8,
  margin: 10,
  gap: 3,
  showCutMarks: true,
  bleedMm: 0,
  safeInsetMm: 3,
  duplexFlip: 'long-edge',
  backRotation: 0,
  backOffsetXmm: 0,
  backOffsetYmm: 0,
  sideMode: 'both',
};

export function getIdentityCardSheetLayout(
  layout: IdentityCardLayout,
  settings: IdentityCardPrintSettings
) {
  const errors = validateIdentityCardLayout(layout);
  if (!['A4', 'Card'].includes(settings.pageSize) || settings.units !== 'mm')
    errors.push('Paper size must be A4 or Card, with millimetre units.');
  if (
    !['long-edge', 'short-edge'].includes(settings.duplexFlip) ||
    ![0, 180].includes(settings.backRotation) ||
    !['both', 'front', 'back'].includes(settings.sideMode)
  )
    errors.push('Duplex flip, back rotation or output sides are invalid.');
  const bounds = [
    [settings.margin, 60],
    [settings.gap, 40],
    [settings.bleedMm, 10],
    [settings.safeInsetMm, 20],
  ];
  if (!bounds.every(([value, maximum]) => Number.isFinite(value) && value >= 0 && value <= maximum))
    errors.push('Enter a margin of 0–60 mm, gap of 0–40 mm, bleed of 0–10 mm and safe inset of 0–20 mm.');
  if (
    !Number.isInteger(settings.cardsPerPage) ||
    settings.cardsPerPage < 1 ||
    settings.cardsPerPage > 10
  )
    errors.push('Cards per page must be a whole number from 1 to 10.');
  if (![settings.backOffsetXmm, settings.backOffsetYmm].every((value) => Number.isFinite(value) && Math.abs(value) <= 30))
    errors.push('Enter back offsets between −30 and 30 mm.');
  if (settings.safeInsetMm * 2 >= Math.min(layout.widthMm, layout.heightMm))
    errors.push('Safe inset must leave a printable area inside the card.');
  let columns = 0;
  let rows = 0;
  if (errors.length === 0) {
    if (settings.pageSize === 'Card') {
      columns = 1;
      rows = 1;
    } else {
      columns = Math.max(
        0,
        Math.floor(
          (A4_WIDTH_MM - settings.margin * 2 + settings.gap) /
            (layout.widthMm + settings.bleedMm * 2 + settings.gap) + EXACT_FIT_TOLERANCE
        )
      );
      rows = Math.max(
        0,
        Math.floor(
          (A4_HEIGHT_MM - settings.margin * 2 + settings.gap) /
            (layout.heightMm + settings.bleedMm * 2 + settings.gap) + EXACT_FIT_TOLERANCE
        )
      );
    }
  }
  const capacity = columns * rows;
  if (!capacity && errors.length === 0)
    errors.push('No card fits on the sheet. Reduce margins, bleed or card dimensions.');
  const cardOutput = settings.pageSize === 'Card';
  const slotWidth = layout.widthMm + 2 * settings.bleedMm;
  const slotHeight = layout.heightMm + 2 * settings.bleedMm;
  const width = cardOutput ? slotWidth : A4_WIDTH_MM;
  const height = cardOutput ? slotHeight : A4_HEIGHT_MM;
  const startX = cardOutput ? 0 : Math.max(0, (width - columns * slotWidth - (columns - 1) * settings.gap) / 2);
  const startY = cardOutput ? 0 : Math.max(0, (height - rows * slotHeight - (rows - 1) * settings.gap) / 2);
  if (capacity) {
    if (
      Math.abs(settings.backOffsetXmm) > startX ||
      Math.abs(settings.backOffsetYmm) > startY
    )
      errors.push('Back offsets would clip artwork outside the page.');
  }
  return {
    columns,
    rows,
    capacity,
    width,
    height,
    slotWidth,
    slotHeight,
    position(index: number, back: boolean) {
      if (cardOutput) return { x: settings.bleedMm, y: settings.bleedMm };
      let column = index % columns;
      let row = Math.floor(index / columns);
      if (back && settings.duplexFlip === 'long-edge') column = columns - 1 - column;
      if (back && settings.duplexFlip === 'short-edge') row = rows - 1 - row;
      return {
        x: startX + column * (slotWidth + settings.gap) + settings.bleedMm + (back ? settings.backOffsetXmm : 0),
        y: startY + row * (slotHeight + settings.gap) + settings.bleedMm + (back ? settings.backOffsetYmm : 0),
      };
    },
    effectiveCardsPerPage: Number.isFinite(settings.cardsPerPage)
      ? Math.min(Math.max(0, settings.cardsPerPage), capacity)
      : 0,
    errors,
  };
}
