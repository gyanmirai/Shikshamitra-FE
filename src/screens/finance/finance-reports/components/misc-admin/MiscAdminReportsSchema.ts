import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getMiscAdminReportsValidationSchema = (fields: string[], currentYear: any) => {
  const schemaFields: Record<string, any> = {
    report: Yup.string().required('Report is required'),
  };

  if (fields.includes('board')) {
    schemaFields.board = Yup.string().required('Board is required');
  }
  if (fields.includes('medium')) {
    schemaFields.medium = Yup.string().required('Medium is required');
  }
  if (fields.includes('organizations')) {
    schemaFields.organizations = Yup.array().min(1, 'At least one organization is required');
  }
  if (fields.includes('standards')) {
    schemaFields.standards = Yup.array().min(1, 'At least one class is required');
  }
  if (fields.includes('divisions')) {
    schemaFields.divisions = Yup.array().min(1, 'At least one division is required');
  }
  // FROM DATE OPTIONAL
  if (fields.includes('fromDateOptional')) {
    let dateSchema = Yup.mixed().nullable().typeError('Invalid Date');

    if (currentYear) {
      dateSchema = dateSchema
        .test(
          'min-date',
          `Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
          }
        )
        .test(
          'max-date',
          `Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
          }
        );
    }
    schemaFields.fromDate = dateSchema;
  }

  // TO DATE OPTIONAL
  if (fields.includes('toDateOptional')) {
    let dateSchema = Yup.mixed().nullable().typeError('Invalid Date');

    if (currentYear) {
      dateSchema = dateSchema
        .test(
          'min-date',
          `Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
          }
        )
        .test(
          'max-date',
          `Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
          (value) => {
            if (!value) return true;
            return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
          }
        );
    }

    schemaFields.toDate = dateSchema;
  }

  // FROM DATE (required or optional)
  if (fields.includes('fromDate')) {
    let fromDateSchema = Yup.mixed()
      .nullable()
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

    if (fields.includes('fromDateRequired')) {
      fromDateSchema = fromDateSchema.required('From Date is required');
    }
    schemaFields.fromDate = fromDateSchema;
  }

  // TO DATE (required or optional)
  if (fields.includes('toDate')) {
    let toDateSchema = Yup.mixed()
      .nullable()
      // eslint-disable-next-line func-names
      .test('is-after-start', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;
        if (!value || !fromDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate), 'day');
      })
      .test(
        'min-date',
        `To Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        `To Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (!value) return true;
          return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      );

    if (fields.includes('toDateRequired')) {
      toDateSchema = toDateSchema.required('To Date is required');
    }

    schemaFields.toDate = toDateSchema;
  }

  return Yup.object().shape(schemaFields);
};
