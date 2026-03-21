import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getReceiptListAdvanceReportsValidationSchema = (
  fields: string[],
  currentYear: any
) => {
  const schemaFields: Record<string, any> = {
    report: Yup.string().required('Report is required'),
  };

  if (fields.includes('board')) {
    schemaFields.board = Yup.string().required('Board is required');
  }
  if (fields.includes('medium')) {
    schemaFields.medium = Yup.string().required('Medium is required');
  }

  // Multi Select Organization
  if (fields.includes('organizations')) {
    schemaFields.organizations = Yup.array().min(1, 'At least one organization is required');
  }
  // Single Select Organization
  if (fields.includes('organizationSingle')) {
    schemaFields.organizationSingle = Yup.string().required('Organization is required');
  }

  // Multi Select Receipt Book
  if (fields.includes('receiptBooks')) {
    schemaFields.receiptBooks = Yup.array().min(1, 'At least one Receipt Book is required');
  }
  // Single Select Receipt Book
  if (fields.includes('receiptBookSingle')) {
    schemaFields.receiptBookSingle = Yup.string().required('Receipt Book is required');
  }

  if (fields.includes('feeHeads')) {
    schemaFields.feeHeads = Yup.array().min(1, 'At least one Fee Head is required');
  }

  if (fields.includes('payTypes')) {
    schemaFields.payTypes = Yup.array().min(1, 'At least one Pay Type is required');
  }

  if (fields.includes('classes')) {
    schemaFields.classes = Yup.array().min(1, 'At least one Class is required');
  }

  if (fields.includes('divisions')) {
    schemaFields.divisions = Yup.array().min(1, 'At least one Division is required');
  }

  if (fields.includes('students')) {
    schemaFields.students = Yup.array().min(1, 'At least one Student is required');
  }

  // FROM DATE
  if (fields.includes('fromDate')) {
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
    schemaFields.fromDate = fromDateSchema;
  }

  // TO DATE
  if (fields.includes('toDate')) {
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
    schemaFields.toDate = toDateSchema;
  }

  return Yup.object().shape(schemaFields);
};
