/* eslint-disable func-names */
import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

/**
 * Dynamic validation schema generator for FEE STATUS REPORTS
 * Works similar to getHomeworkValidationSchema
 */

export const getFeeStatusValidationSchema = (showField: string[], currentYear: any) => {
  const shape: Record<string, any> = {};

  // --------------------------
  // BOARD
  // --------------------------
  if (showField.includes('board')) {
    shape.board = Yup.string().required('Board is required');
  }

  // --------------------------
  // MEDIUM
  // --------------------------
  if (showField.includes('medium')) {
    shape.medium = Yup.string().required('Medium is required');
  }

  // --------------------------
  // ORGANIZATIONS (Multi Select)
  // --------------------------
  if (showField.includes('organizations')) {
    shape.organizations = Yup.array()
      .min(1, 'At least one Organization is required')
      .required('Organization is required');
  }

  // --------------------------
  // STANDARD (Class)
  // --------------------------
  if (showField.includes('standards')) {
    shape.standards = Yup.array()
      .min(1, 'At least one Class is required')
      .required('Class is required');
  }

  // --------------------------
  // DIVISIONS
  // --------------------------
  if (showField.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'At least one Division is required')
      .required('Division is required');
  }

  // --------------------------
  // RECEIPT BOOKS
  // --------------------------
  if (showField.includes('receiptBooks')) {
    shape.receiptBooks = Yup.array().optional(); // REQUIRED only in some reports
  }

  // --------------------------
  // COLLECTION GROUP
  // --------------------------
  if (showField.includes('collectionGroup')) {
    shape.collectionGroup = Yup.array().optional();
  }

  // -------------------------
  // STUDENTS (Optional unless explicitly required)
  // --------------------------
  if (showField.includes('students')) {
    const isRequired = showField.includes('studentsRequired');

    shape.students = Yup.array().when([], {
      is: () => isRequired,
      then: (s) => s.min(1, 'At least one Student is required'),
      otherwise: (s) => s.optional(),
    });
  }

  // --------------------------
  // CATEGORY (Optional)
  // --------------------------
  if (showField.includes('category')) {
    shape.category = Yup.array().optional();
  }

  // --------------------------
  // ROLL NUMBERS
  // --------------------------
  if (showField.includes('fromRollNo')) {
    shape.fromRollNo = Yup.string().required('From Roll No is required');
  }

  if (showField.includes('toRollNo')) {
    shape.toRollNo = Yup.string().required('To Roll No is required');
  }

  // --------------------------
  // FROM DATE
  // --------------------------
  if (showField.includes('fromDate')) {
    shape.fromDate = Yup.mixed()
      .test(
        'min-date',
        (value) =>
          `From Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        (value) =>
          `From Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      )
      .nullable()
      .optional();
  }

  // --------------------------
  // TO DATE
  // --------------------------
  if (showField.includes('toDate')) {
    shape.toDate = Yup.mixed()
      .test('is-after-start', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;
        if (!value || !fromDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate), 'day');
      })
      .test(
        'min-date',
        (value) =>
          `To Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true;
          return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        (value) =>
          `To Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true;
          return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      )
      .nullable()
      .optional();
  }

  return Yup.object().shape(shape);
};
