import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getAssignmentValidationSchema = (
  visibleFields: string[],
  requiredFields: string[],
  currentYear: any
) => {
  const shape: Record<string, any> = {};

  if (visibleFields.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  if (visibleFields.includes('class')) {
    shape.class = requiredFields.includes('class')
      ? Yup.string().required('Class is required')
      : Yup.string();
  }

  if (visibleFields.includes('divisions')) {
    shape.divisions = requiredFields.includes('divisions')
      ? Yup.array().min(1, 'At least one division is required')
      : Yup.array();
  }

  if (visibleFields.includes('subjects')) {
    shape.subjects = requiredFields.includes('subjects')
      ? Yup.array().min(1, 'At least one subject is required')
      : Yup.array();
  }

  if (visibleFields.includes('teachers')) {
    shape.teachers = requiredFields.includes('teachers')
      ? Yup.array().min(1, 'At least one teacher is required')
      : Yup.array();
  }

  if (visibleFields.includes('students')) {
    shape.students = requiredFields.includes('students')
      ? Yup.array().min(1, 'At least one student is required')
      : Yup.array();
  }

  if (visibleFields.includes('assignments')) {
    shape.assignments = requiredFields.includes('assignments')
      ? Yup.array().min(1, 'At least one assignment is required')
      : Yup.array();
  }

  if (visibleFields.includes('fromDate')) {
    shape.fromDate = Yup.mixed()
      .test('is-valid', 'From Date is required', (value) => {
        if (!requiredFields.includes('fromDate')) return true;
        return value != null && dayjs(value as Dayjs).isValid();
      })
      .test(
        'min-date',
        () => `From Date must be on or after ${dayjs(currentYear?.startDate).format('DD/MM/YYYY')}`,
        (value) =>
          !value || dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear?.startDate), 'day')
      )
      .test(
        'max-date',
        () => `From Date must be on or before ${dayjs(currentYear?.endDate).format('DD/MM/YYYY')}`,
        (value) =>
          !value || dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear?.endDate), 'day')
      )
      .nullable();
  }

  if (visibleFields.includes('toDate')) {
    shape.toDate = Yup.mixed()
      .test('is-valid', 'To Date is required', (value) => {
        if (!requiredFields.includes('toDate')) return true;
        return value != null && dayjs(value as Dayjs).isValid();
      })
      // eslint-disable-next-line func-names
      .test('is-after-start', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;
        if (!value || !fromDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate), 'day');
      })
      .test(
        'min-date',
        () => `To Date must be on or after ${dayjs(currentYear?.startDate).format('DD/MM/YYYY')}`,
        (value) =>
          !value || dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear?.startDate), 'day')
      )
      .test(
        'max-date',
        () => `To Date must be on or before ${dayjs(currentYear?.endDate).format('DD/MM/YYYY')}`,
        (value) =>
          !value || dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear?.endDate), 'day')
      )
      .nullable();
  }

  return Yup.object().shape(shape);
};
