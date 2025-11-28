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
  if (showField.includes('class')) {
    shape.class = Yup.string().required('Classes is required');
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

  // To Date
  if (showField.includes('toDate')) {
    shape.toDate = Yup.mixed()
      // To Date must be >= From Date
      // eslint-disable-next-line func-names
      .test('is-after-start', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;

        // allow empty value or empty fromDate
        if (value === null || value === undefined) return true;
        if (!fromDate) return true;

        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate), 'day');
      })
      // Academic year MIN date check
      .test(
        'min-date',
        (value) =>
          `To Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      // Academic year MAX date check
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
