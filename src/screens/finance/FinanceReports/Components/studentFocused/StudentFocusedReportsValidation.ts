import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getStudentFocusedReportsValidationSchema = (fields: string[], currentYear: any) => {
  const schemaFields: Record<string, any> = {
    report: Yup.string().required('Report is required'),
  };

  if (fields.includes('board')) {
    schemaFields.board = Yup.string().required('Board is required');
  }
  if (fields.includes('medium')) {
    schemaFields.medium = Yup.string().required('Medium is required');
  }
  if (fields.includes('organizations')) {
    schemaFields.organizations = Yup.array().min(1, 'At least one organization is required');
  }
  if (fields.includes('standards')) {
    schemaFields.standards = Yup.array().min(1, 'At least one class is required');
  }
  if (fields.includes('divisions')) {
    schemaFields.divisions = Yup.array().min(1, 'At least one division is required');
  }
  if (fields.includes('students')) {
    schemaFields.students = Yup.array().min(1, 'At least one student is required');
  }
  if (fields.includes('receiptBooks')) {
    schemaFields.receiptBooks = Yup.array().min(1, 'At least one receipt book is required');
  }
  if (fields.includes('feeHeads')) {
    schemaFields.feeHeads = Yup.array().min(1, 'At least one fee head is required');
  }

  // FROM DATE
  if (fields.includes('fromDate')) {
    let dateSchema = Yup.mixed().required('From Date is required').typeError('Invalid Date');

    if (currentYear) {
      dateSchema = dateSchema
        .test(
          'min-date',
          `Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
          }
        )
        .test(
          'max-date',
          `Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
          }
        );
    }
    schemaFields.fromDate = dateSchema;
  }

  // TO DATE
  if (fields.includes('toDate')) {
    let dateSchema = Yup.mixed().required('To Date is required').typeError('Invalid Date');

    if (currentYear) {
      dateSchema = dateSchema
        .test(
          'min-date',
          `Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
          }
        )
        .test(
          'max-date',
          `Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
          }
        );
    }
    schemaFields.toDate = dateSchema;
  }

  return Yup.object().shape(schemaFields);
};
