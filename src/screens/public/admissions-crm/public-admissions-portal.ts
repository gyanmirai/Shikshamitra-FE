export type PublicAdmissionPortal = {
  schoolName: string;
  logoDataUrl?: string | null;
  admissionsPhone?: string | null;
  admissionsEmail?: string | null;
  officeHours?: string | null;
  helpText?: string | null;
  primaryColor?: string | null;
  defaultLanguage: string;
  supportedLanguages: string[];
};

export const getPublicAdmissionsPortalUrl = (apiBase: string, tenantId: string) =>
  `${apiBase}/public/student-enrollment/admissions-crm/${tenantId}/portal`;

export type PublicAdmissionsCoreLanguage = 'en' | 'gu' | 'hi';

const CORE_LANGUAGE_LABELS: Record<PublicAdmissionsCoreLanguage, string> = {
  en: 'English',
  gu: 'ગુજરાતી',
  hi: 'हिन्दी',
};

const isSafeLanguageTag = (value: string) => /^[a-z]{2,8}(?:-[a-z]{2,8})?$/i.test(value);

export const getPublicAdmissionsCoreLanguage = (
  language?: string | null
): PublicAdmissionsCoreLanguage => {
  const baseLanguage = language?.trim().toLowerCase().split('-')[0];
  return baseLanguage === 'gu' || baseLanguage === 'hi' ? baseLanguage : 'en';
};

export const getPublicAdmissionsLanguageOptions = (
  configured?: readonly string[] | null
): string[] => {
  const languages = (configured ?? ['en', 'gu', 'hi'])
    .map((language) => language.trim().toLowerCase())
    .filter(isSafeLanguageTag)
    .filter((language, index, items) => items.indexOf(language) === index)
    .slice(0, 10);
  if (!languages.includes('en')) languages.unshift('en');
  return languages.length ? languages : ['en', 'gu', 'hi'];
};

export const getPublicAdmissionsLanguageLabel = (language: string, displayLocale = 'en') => {
  const coreLanguage = getPublicAdmissionsCoreLanguage(language);
  if (language === coreLanguage && coreLanguage in CORE_LANGUAGE_LABELS) {
    return CORE_LANGUAGE_LABELS[coreLanguage];
  }
  try {
    return new Intl.DisplayNames([displayLocale], { type: 'language' }).of(language) ?? language;
  } catch {
    return language.toUpperCase();
  }
};
