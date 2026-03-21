import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getReceiptSummaryReportsValidationSchema = (
  currentFields: string[],
  currentYear: any
) => {
  const baseSchema: any = {
    report: Yup.string().required('Report is required'),
  };

  if (currentFields.includes('board')) {
    baseSchema.board = Yup.string().required('Board is required');
  }
  if (currentFields.includes('medium')) {
    baseSchema.medium = Yup.string().required('Medium is required');
  }
  if (currentFields.includes('organizations')) {
    baseSchema.organizations = Yup.array()
      .min(1, 'At least one organization is required')
      .required('Organization is required');
  }
  // FROM DATE
  if (currentFields.includes('fromDate')) {
    baseSchema.fromDate = Yup.mixed()
      .required('From Date is required')
      .test(
        'min-date',
        (value) =>
          `From Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true;
          return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        (value) =>
          `From Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true;
          return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      );
  }

  // TO DATE
  if (currentFields.includes('toDate')) {
    baseSchema.toDate = Yup.mixed()
      .required('To Date is required')
      // eslint-disable-next-line func-names
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
      );
  }
  if (currentFields.includes('payTypes')) {
    baseSchema.payTypes = Yup.array()
      .min(1, 'At least one Pay Type is required')
      .required('Pay Type is required');
  }
  if (currentFields.includes('receiptBooks')) {
    baseSchema.receiptBooks = Yup.array()
      .min(1, 'At least one Receipt Book is required')
      .required('Receipt Book is required');
  }
  if (currentFields.includes('feeHeads')) {
    baseSchema.feeHeads = Yup.array()
      .min(1, 'At least one Fee Head is required')
      .required('Fee Head is required');
  }
  if (currentFields.includes('standards')) {
    baseSchema.standards = Yup.array()
      .min(1, 'At least one Class is required')
      .required('Class is required');
  }

  return Yup.object().shape(baseSchema);
};
