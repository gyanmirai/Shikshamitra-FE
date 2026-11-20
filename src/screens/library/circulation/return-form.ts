import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export type ReturnValues = {
  accessionNo: string;
  returnDate: Dayjs | null;
  chargeCategory: string;
  amount: string;
  fineDueDate: Dayjs | null;
  copyStatus: number;
  remarks: string;
  unknownOriginalDatesReason?: string;
  assessmentAcademicYearId?: string;
  assessmentAcademicYearReason?: string;
  assessmentReason?: string;
  chargeDate?: Dayjs | null;
};
export const hasReturnCharge = (value: string) =>
  Boolean(value && value !== 'none' && value !== 'None');
const date = (label: string) =>
  Yup.mixed<Dayjs>()
    .nullable()
    .required(`${label} is required`)
    .test('valid', `${label} must be a valid date`, (value) =>
      Boolean(value && dayjs(value).isValid())
    );
export const returnSchema = Yup.object({
  accessionNo: Yup.string().trim().required('Accession or scan token is required'),
  returnDate: date('Return date'),
  copyStatus: Yup.number()
    .oneOf(
      [0, 4, 5],
      'Copy status must be Available, Damaged or Under repair after a physical return'
    )
    .required('Copy status is required'),
  amount: Yup.string().when('chargeCategory', {
    is: hasReturnCharge,
    then: (schema) =>
      schema
        .required('Amount is required')
        .matches(/^\d+(\.\d{1,2})?$/, 'Use a non-negative amount with up to two decimal places'),
  }),
  fineDueDate: Yup.mixed<Dayjs>()
    .nullable()
    .when('chargeCategory', {
      is: hasReturnCharge,
      then: () =>
        date('Assessment due date').test(
          'assessment-order',
          'Assessment due date must be on or after the assessment date',
          function ordered(value) {
            return (
              !value ||
              !this.parent.chargeDate ||
              value.startOf('day').valueOf() >=
                dayjs(this.parent.chargeDate).startOf('day').valueOf()
            );
          }
        ),
    }),
  remarks: Yup.string().max(500, 'Use at most 500 characters'),
  unknownOriginalDatesReason: Yup.string().max(500, 'Use at most 500 characters'),
  assessmentAcademicYearId: Yup.string().when('chargeCategory', {
    is: hasReturnCharge,
    then: (schema) => schema.required('Choose the assessment academic year'),
  }),
  assessmentAcademicYearReason: Yup.string().max(500, 'Use at most 500 characters'),
  assessmentReason: Yup.string()
    .max(500, 'Use at most 500 characters')
    .when('chargeCategory', {
      is: hasReturnCharge,
      then: (schema) => schema.trim().required('Assessment reason is required'),
    }),
  chargeDate: Yup.mixed<Dayjs>()
    .nullable()
    .when('chargeCategory', {
      is: hasReturnCharge,
      then: () => date('Assessment date'),
    }),
});
