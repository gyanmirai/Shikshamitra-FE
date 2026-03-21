import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getFeeCollectionReportsValidationSchema = (fields: string[], currentYear: any) => {
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
  if (fields.includes('months')) {
    schemaFields.months = Yup.array().min(1, 'At least one month is required');
  }
  if (fields.includes('feeHeads')) {
    schemaFields.feeHeads = Yup.array().min(1, 'At least one fee head is required');
  }
  if (fields.includes('receiptBooks')) {
    schemaFields.receiptBooks = Yup.array().min(1, 'At least one receipt book is required');
  }
  if (fields.includes('batch')) {
    schemaFields.batch = Yup.string().required('Batch is required');
  }

  // Date Validations
  if (fields.includes('fromDate')) {
    schemaFields.fromDate = Yup.date()
      .nullable()
      .required('From Date is required')
      .typeError('Invalid Date');

    if (currentYear) {
      schemaFields.fromDate = schemaFields.fromDate
        .min(
          dayjs(currentYear.startDate),
          `Date must be after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`
        )
        .max(
          dayjs(currentYear.endDate),
          `Date must be before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`
        );
    }
  }

  if (fields.includes('toDate')) {
    schemaFields.toDate = Yup.date()
      .nullable()
      .required('To Date is required')
      .typeError('Invalid Date');

    if (currentYear) {
      schemaFields.toDate = schemaFields.toDate
        .min(
          dayjs(currentYear.startDate),
          `Date must be after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`
        )
        .max(
          dayjs(currentYear.endDate),
          `Date must be before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`
        );
    }
  }

  return Yup.object().shape(schemaFields);
};
