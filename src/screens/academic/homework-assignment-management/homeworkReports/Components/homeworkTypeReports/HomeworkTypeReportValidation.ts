import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getHomeworkValidationSchema = (showField: string[], currentYear: any) => {
  const shape: Record<string, any> = {};

  // Report
  if (showField.includes('report')) {
    shape.report = Yup.string().required('Report is required');
  }

  // Organization
  if (showField.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  // Classes
  if (showField.includes('classes')) {
    shape.classes = Yup.array()
      .min(1, 'At least one class is required')
      .required('Class is required');
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
        (value) =>
          `From Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `From Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
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
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate), 'day');
      })
      .test(
        'min-date',
        (value) =>
          `To Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `To Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      )
      .required('To Date is required');
  }
  return Yup.object().shape(shape);
};
