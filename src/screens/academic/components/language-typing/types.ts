export type AcademicTypingLanguage = {
  code: string;
  label: string;
  nativeLabel: string;
};

export const ACADEMIC_TYPING_LANGUAGES: AcademicTypingLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
];

export const ACADEMIC_TYPING_SETUP_COOKIE = 'academic_language_typing_setup_v1';
