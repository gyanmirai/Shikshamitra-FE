export enum BookLanguage {
  Gujarati = 0,
  Hindi = 1,
  English = 2,
  Marathi = 3,
  Sanskrit = 4,
}

export const BOOK_LANGUAGE_OPTIONS = [
  { label: 'Gujarati (ગુજરાતી)', value: BookLanguage.Gujarati },
  { label: 'Hindi (हिंदी)', value: BookLanguage.Hindi },
  { label: 'English', value: BookLanguage.English },
  { label: 'Marathi (मराठी)', value: BookLanguage.Marathi },
  { label: 'Sanskrit (संस्कृत)', value: BookLanguage.Sanskrit },
];
