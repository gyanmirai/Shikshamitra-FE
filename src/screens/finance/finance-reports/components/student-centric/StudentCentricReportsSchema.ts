import * as Yup from 'yup';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import dayjs, { Dayjs } from 'dayjs';

export const getStudentCentricReportsValidationSchema = (fields: string[], currentYear: any) => {
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

  // STUDENTS - Required
  if (fields.includes('students')) {
    schemaFields.students = Yup.array()
      .min(1, 'At least one student is required')
      .required('Student is required');
  }
  // STUDENTS - Optional (No validation needed, but field exists)

  // FROM DATE
  if (fields.includes('fromDate')) {
    schemaFields.fromDate = Yup.mixed()
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
  if (fields.includes('toDate')) {
    schemaFields.toDate = Yup.mixed()
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

  return Yup.object().shape(schemaFields);
};
