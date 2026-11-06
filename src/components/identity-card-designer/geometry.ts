import { validateIdentityCardLayout } from './validation';

import type { IdentityCardLayout, IdentityCardPrintSettings } from './types';

export { validateIdentityCardLayout } from './validation';

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
  const nonNegative = [settings.margin, settings.gap, settings.bleedMm, settings.safeInsetMm];
  if (!nonNegative.every((value) => Number.isFinite(value) && value >= 0))
    errors.push('Margins, gap, bleed and safe inset must be finite, non-negative millimetres.');
  if (
    !Number.isInteger(settings.cardsPerPage) ||
    settings.cardsPerPage < 1 ||
    settings.cardsPerPage > 10
  )
    errors.push('Cards per page must be a whole number from 1 to 10.');
  if (![settings.backOffsetXmm, settings.backOffsetYmm].every(Number.isFinite))
    errors.push('Back offsets must be finite millimetres.');
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
          (210 - settings.margin * 2 + settings.gap) /
            (layout.widthMm + settings.bleedMm * 2 + settings.gap)
        )
      );
      rows = Math.max(
        0,
        Math.floor(
          (297 - settings.margin * 2 + settings.gap) /
            (layout.heightMm + settings.bleedMm * 2 + settings.gap)
        )
      );
    }
  }
  const capacity = columns * rows;
  if (!capacity && errors.length === 0)
    errors.push('No card fits on the sheet. Reduce margins, bleed or card dimensions.');
  if (capacity) {
    const gridWidth =
      columns * (layout.widthMm + 2 * settings.bleedMm) + (columns - 1) * settings.gap;
    const gridHeight = rows * (layout.heightMm + 2 * settings.bleedMm) + (rows - 1) * settings.gap;
    const availableX = settings.pageSize === 'Card' ? 0 : (210 - gridWidth) / 2;
    const availableY = settings.pageSize === 'Card' ? 0 : (297 - gridHeight) / 2;
    if (
      Math.abs(settings.backOffsetXmm) > availableX ||
      Math.abs(settings.backOffsetYmm) > availableY
    )
      errors.push('Back offsets would clip artwork outside the page.');
  }
  return {
    columns,
    rows,
    capacity,
    effectiveCardsPerPage: Number.isFinite(settings.cardsPerPage)
      ? Math.min(Math.max(0, settings.cardsPerPage), capacity)
      : 0,
    errors,
  };
}
