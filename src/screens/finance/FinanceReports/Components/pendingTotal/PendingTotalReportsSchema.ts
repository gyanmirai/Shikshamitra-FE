import * as Yup from 'yup';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import dayjs, { Dayjs } from 'dayjs';

export const getPendingTotalReportsValidationSchema = (fields: string[], currentYear: any) => {
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
  if (fields.includes('divisions')) {
    schemaFields.divisions = Yup.array()
      .min(1, 'At least one division is required')
      .required('Division is required');
  }

  // TO DATE
  if (fields.includes('toDate')) {
    schemaFields.toDate = Yup.mixed()
      .required('To Date is required')
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
      );
  }

  return Yup.object().shape(schemaFields);
};
