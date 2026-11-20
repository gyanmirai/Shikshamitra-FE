import { BOOK_LANGUAGE_OPTIONS } from 'src/enums/book-language';

import type { CatalogueBookMetadata } from './catalogue-configuration-types';

const legacyCodes = ['gu', 'hi', 'en', 'mr', 'sa'] as const;

export function legacyLanguageCode(value: unknown): string | null {
  return typeof value === 'number' && Number.isInteger(value) ? (legacyCodes[value] ?? null) : null;
}

export function legacyLanguageValue(code: string | null): number | null {
  const index = legacyCodes.findIndex((value) => value === code);
  return index < 0 ? null : index;
}

export function catalogueLanguageCode(source: CatalogueBookMetadata & { language?: unknown }) {
  return source.languageCode === undefined
    ? legacyLanguageCode(source.language)
    : source.languageCode;
}

export function catalogueLanguageLabel(source: CatalogueBookMetadata & { language?: unknown }) {
  if (source.languageLabel) return source.languageLabel;
  const code = catalogueLanguageCode(source);
  const legacy = legacyLanguageValue(code ?? null);
  return (
    (legacy === null ? code : BOOK_LANGUAGE_OPTIONS.find((item) => item.value === legacy)?.label) ||
    (typeof source.language === 'string' ? source.language : '') ||
    '—'
  );
}

export const catalogueMaterialLabel = (source: CatalogueBookMetadata) =>
  source.materialLabel || source.materialCode || 'Unspecified';
