import type {
  AdmissionNumbering,
  SaveAdmissionNumbering,
} from 'src/redux/student/admissions/admission-numbering-api';

import * as Yup from 'yup';

export type NumberingFormValues = Omit<SaveAdmissionNumbering, 'startingNumber'> & {
  startingNumber: string;
};
export const defaultNumbering: AdmissionNumbering = {
  expectedVersion: 0,
  prefix: 'APP',
  separator: '-',
  suffix: '',
  yearFormat: 1,
  resetPolicy: 1,
  digits: 6,
  startingNumber: 1,
  isConfigured: false,
  sequenceLocked: false,
};
export const numberingFormValues = (settings: AdmissionNumbering): NumberingFormValues => ({
  expectedVersion: settings.expectedVersion,
  prefix: settings.prefix,
  separator: settings.separator,
  suffix: settings.suffix,
  yearFormat: settings.yearFormat,
  resetPolicy: settings.resetPolicy,
  digits: settings.digits,
  startingNumber: String(settings.startingNumber),
});
export const numberingSchema = Yup.object({
  prefix: Yup.string()
    .trim()
    .matches(/^[A-Za-z0-9][A-Za-z0-9-]{0,19}$/, 'Use up to 20 letters, numbers or hyphens')
    .required('Prefix is required'),
  separator: Yup.string().ensure().oneOf(['/', '-', ''], 'Choose a supported separator'),
  suffix: Yup.string()
    .trim()
    .ensure()
    .matches(/^[A-Za-z0-9-]{0,20}$/, 'Use up to 20 letters, numbers or hyphens'),
  yearFormat: Yup.number().oneOf([0, 1, 2]).required('Year format is required'),
  resetPolicy: Yup.number()
    .oneOf([0, 1, 2])
    .required('Reset counter is required')
    .test('year-reset', 'Year format must match the reset policy', function validate(value) {
      return value === 0 || value === this.parent.yearFormat;
    }),
  digits: Yup.number().integer().min(1).max(12).required('Number of digits is required'),
  startingNumber: Yup.string()
    .required('Starting number is required')
    .matches(/^[1-9][0-9]{0,8}$/, 'Enter a whole number from 1 to 999999999'),
});
