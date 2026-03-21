import * as Yup from 'yup';

export const getReceiptSummaryAdvancedValidationSchema = (
  currentFields: string[],
  currentYear: any
) => {
  const schemaFields: any = {
    report: Yup.string().required('Report is required'),
  };

  if (currentFields.includes('board')) {
    schemaFields.board = Yup.string().required('Board is required');
  }
  if (currentFields.includes('medium')) {
    schemaFields.medium = Yup.string().required('Medium is required');
  }
  if (currentFields.includes('organizations')) {
    schemaFields.organizations = Yup.array()
      .min(1, 'At least one Organization is required')
      .required('Organization is required');
  }
  if (currentFields.includes('standards')) {
    schemaFields.standards = Yup.array()
      .min(1, 'At least one Class is required')
      .required('Class is required');
  }
  if (currentFields.includes('standard_single')) {
    schemaFields.standard_single = Yup.string().required('Class is required');
  }
  if (currentFields.includes('divisions')) {
    schemaFields.divisions = Yup.array()
      .min(1, 'At least one Division is required')
      .required('Division is required');
  }
  if (currentFields.includes('receiptBooks')) {
    schemaFields.receiptBooks = Yup.array()
      .min(1, 'At least one Receipt Book is required')
      .required('Receipt Book is required');
  }
  if (currentFields.includes('payTypes')) {
    schemaFields.payTypes = Yup.array()
      .min(1, 'At least one Pay Type is required')
      .required('Pay Type is required');
  }
  if (currentFields.includes('feeHeads')) {
    schemaFields.feeHeads = Yup.array()
      .min(1, 'At least one Fee Head is required')
      .required('Fee Head is required');
  }
  if (currentFields.includes('students')) {
    schemaFields.students = Yup.array()
      .min(1, 'At least one Student is required')
      .required('Student is required');
  }
  if (currentFields.includes('fromDate')) {
    schemaFields.fromDate = Yup.date()
      .nullable()
      .required('From Date is required')
      .min(
        currentYear?.startDate ? new Date(currentYear.startDate) : new Date(0),
        `Date must be after ${currentYear?.startDate}`
      )
      .max(
        currentYear?.endDate ? new Date(currentYear.endDate) : new Date(),
        `Date must be before ${currentYear?.endDate}`
      );
  }
  if (currentFields.includes('toDate')) {
    schemaFields.toDate = Yup.date()
      .nullable()
      .required('To Date is required')
      .min(Yup.ref('fromDate'), 'To Date must be after From Date')
      .max(
        currentYear?.endDate ? new Date(currentYear.endDate) : new Date(),
        `Date must be before ${currentYear?.endDate}`
      );
  }

  return Yup.object().shape(schemaFields);
};
