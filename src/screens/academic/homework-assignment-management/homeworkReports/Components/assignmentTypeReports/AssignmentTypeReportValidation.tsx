import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getAssignmentValidationSchema = (showField: string[], currentYear: any) => {
  const shape: Record<string, any> = {};

  // Report
  if (showField.includes('report')) {
    shape.report = Yup.string().required('Report is required');
  }

  // Organization
  if (showField.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  // Class
  if (showField.includes('class')) {
    shape.class = Yup.string().required('Class is required');
  }

  // Divisions
  if (showField.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'At least one division is required')
      .required('Division is required');
  }

  // Subjects
  if (showField.includes('subjects')) {
    shape.subjects = Yup.array()
      .min(1, 'At least one subject is required')
      .required('Subject is required');
  }

  // Teachers
  if (showField.includes('teachers')) {
    shape.teachers = Yup.array()
      .min(1, 'At least one teacher is required')
      .required('Teacher is required');
  }

  // Students
  if (showField.includes('students')) {
    shape.students = Yup.array()
      .min(1, 'At least one student is required')
      .required('Student is required');
  }

  // From Date
  if (showField.includes('fromDate')) {
    shape.fromDate = Yup.mixed()
      .test('min-date', 'From Date must be on or after the start date', (value) => {
        if (value === null || value === undefined) return true; // allow empty
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate as Dayjs), 'day');
      })
      .test('max-date', 'From Date must be on or before the end date', (value) => {
        if (value === null || value === undefined) return true; // allow empty
        return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate as Dayjs), 'day');
      })
      .nullable()
      .optional();
  }

  // To Date
  if (showField.includes('toDate')) {
    shape.toDate = Yup.mixed()
      // ToDate >= FromDate
      // eslint-disable-next-line func-names
      .test('is-after-start', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;

        if (value === null || value === undefined) return true; // allow empty
        if (!fromDate) return true; // don't validate if fromDate not selected

        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate as Dayjs), 'day');
      })

      // Academic year min date
      .test('min-date', 'To Date must be on or after the start date', (value) => {
        if (value === null || value === undefined) return true; // allow empty
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate as Dayjs), 'day');
      })

      // Academic year max date
      .test('max-date', 'To Date must be on or before the end date', (value) => {
        if (value === null || value === undefined) return true; // allow empty
        return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate as Dayjs), 'day');
      })
      .nullable()
      .optional();
  }
  return Yup.object().shape(shape);
};
