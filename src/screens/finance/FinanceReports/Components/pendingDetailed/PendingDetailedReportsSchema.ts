import * as Yup from 'yup';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import dayjs, { Dayjs } from 'dayjs';

export const getPendingDetailedReportsValidationSchema = (fields: string[], currentYear: any) => {
  const schemaFields: Record<string, any> = {};

  if (fields.includes('board')) {
    schemaFields.board = Yup.string().required('Board is required');
  }
  if (fields.includes('medium')) {
    schemaFields.medium = Yup.string().required('Medium is required');
  }
  if (fields.includes('organizations')) {
    schemaFields.organizations = Yup.array()
      .min(1, 'At least one organization is required')
      .required('Organization is required');
  }
  if (fields.includes('standard_single')) {
    schemaFields.standard_single = Yup.string().required('Standard is required');
  }
  if (fields.includes('standards')) {
    schemaFields.standards = Yup.array()
      .min(1, 'At least one standard is required')
      .required('Standard is required');
  }
  if (fields.includes('divisions')) {
    schemaFields.divisions = Yup.array()
      .min(1, 'At least one division is required')
      .required('Division is required');
  }

  // TO DATE
  if (fields.includes('toDate')) {
    schemaFields.toDate = Yup.mixed()
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
  if (fields.includes('receiptBooks')) {
    schemaFields.receiptBooks = Yup.array()
      .min(1, 'At least one receipt book is required')
      .required('Receipt Book is required');
  }

  // Optional fields:
  // category, students, collectionGroup, receiptBooksOptional

  return Yup.object().shape(schemaFields);
};
