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
      .test(
        'is-valid-dayjs',
        'From Date is required',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test(
        'min-date',
        'From Date must be on or after the start date',
        (value) =>
          value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate as Dayjs), 'day')
      )
      .test(
        'max-date',
        'From Date must be on or before the end date',
        (value) =>
          value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate as Dayjs), 'day')
      )
      .required('From Date is required');
  }

  // To Date
  if (showField.includes('toDate')) {
    shape.toDate = Yup.mixed()
      .test(
        'is-valid-dayjs',
        'To Date is required',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test('is-after-start', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;
        if (!value || !fromDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate as Dayjs), 'day');
      })
      .test(
        'min-date',
        'To Date must be on or after the start date',
        (value) =>
          value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate as Dayjs), 'day')
      )
      .test(
        'max-date',
        'To Date must be on or before the end date',
        (value) =>
          value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate as Dayjs), 'day')
      )
      .required('To Date is required');
  }

  return Yup.object().shape(shape);
};
