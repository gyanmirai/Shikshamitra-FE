import type { PublicAdmissionsLanguage } from './public-admissions-copy';

type LocalizedText = Record<string, string> | undefined;
type LocalizedOptions = Record<string, string[]> | undefined;

const resolveLocalizedValue = <T>(
  localizations: Record<string, T> | undefined,
  language: PublicAdmissionsLanguage
) => localizations?.[language];

export const resolveRegistrationText = (
  fallback: string | null | undefined,
  localizations: LocalizedText,
  language: PublicAdmissionsLanguage
) => resolveLocalizedValue(localizations, language)?.trim() || fallback?.trim() || '';

export const resolveRegistrationOptions = (
  fallback: string[],
  localizations: LocalizedOptions,
  language: PublicAdmissionsLanguage
) => {
  const translated = resolveLocalizedValue(localizations, language);
  return translated?.length === fallback.length ? translated : fallback;
};
