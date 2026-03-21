import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const getCertificateRegisterValidationSchema = (
  currentFields: string[],
  currentYear: any
) => {
  const shape: Record<string, any> = {};

  if (currentFields.includes('board')) {
    shape.board = Yup.string().required('Board is required');
  }
  if (currentFields.includes('medium')) {
    shape.medium = Yup.string().required('Medium is required');
  }
  if (currentFields.includes('organizations')) {
    shape.organizations = Yup.array()
      .min(1, 'At least one Organization is required')
      .required('Organization is required');
  }
  if (currentFields.includes('standards')) {
    shape.standards = Yup.array()
      .min(1, 'At least one Class is required')
      .required('Class is required');
  }
  if (currentFields.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'At least one Division is required')
      .required('Division is required');
  }
  if (currentFields.includes('students')) {
    shape.students = Yup.array()
      .min(1, 'At least one Student is required')
      .required('Student is required');
  }

  // FROM DATE
  if (currentFields.includes('fromDate')) {
    let fromDateSchema = Yup.mixed().nullable().required('From Date is required');

    if (currentYear) {
      fromDateSchema = fromDateSchema
        .test(
          'min-date',
          `From Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
          }
        )
        .test(
          'max-date',
          `From Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
          }
        );
    }
    shape.fromDate = fromDateSchema;
  }

  // TO DATE
  if (currentFields.includes('toDate')) {
    let toDateSchema = Yup.mixed()
      .nullable()
      .required('To Date is required')
      // eslint-disable-next-line func-names
      .test('min-date', 'To Date must be after From Date', function (value) {
        const { fromDate } = this.parent;
        if (!fromDate || !value) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate as Dayjs), 'day');
      });

    if (currentYear) {
      toDateSchema = toDateSchema
        .test(
          'min-date-year',
          `To Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
          }
        )
        .test(
          'max-date-year',
          `To Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
          }
        );
    }
    shape.toDate = toDateSchema;
  }

  return Yup.object().shape(shape);
};
