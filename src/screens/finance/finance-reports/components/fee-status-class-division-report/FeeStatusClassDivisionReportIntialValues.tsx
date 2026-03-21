/* eslint-disable func-names */
import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getFeeStatusClassDivValidationSchema = (showField: string[], currentYear: any) => {
  const shape: Record<string, any> = {};

  // BOARD
  if (showField.includes('board')) {
    shape.board = Yup.string().required('Board is required');
  }

  // MEDIUM
  if (showField.includes('medium')) {
    shape.medium = Yup.string().required('Medium is required');
  }
  if (showField.includes('standard_single')) {
    shape.standard_single = Yup.string().required('Class is required');
  }

  // ORGANIZATIONS
  if (showField.includes('organizations')) {
    shape.organizations = Yup.array()
      .min(1, 'At least one Organization is required')
      .required('Organization is required');
  }

  // STANDARDS (Class)
  if (showField.includes('standards')) {
    shape.standards = Yup.array().min(1, 'Class is required').required('Class is required');
  }

  // DIVISIONS
  if (showField.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'At least one Division is required')
      .required('Division is required');
  }

  // RECEIPT BOOKS
  if (showField.includes('receiptBooks')) {
    shape.receiptBooks = Yup.array().min(1, 'Receipt Book is required');
  }

  // STUDENTS
  if (showField.includes('students')) {
    shape.students = Yup.array().optional();
  }

  // FROM DATE
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

  // TO DATE
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
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        (value) =>
          `To Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      )
      .nullable()
      .optional();
  }

  return Yup.object().shape(shape);
};
