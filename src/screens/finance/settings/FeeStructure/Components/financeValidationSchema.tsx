import * as Yup from 'yup';

export const getFeeStructureValidationSchema = () =>
  Yup.object({
    feeStructureName: Yup.string().required('Fee Structure Name is required'),
    academicYear: Yup.string().required('Academic Year is required'),
    board: Yup.string().required('Board is required'),
    medium: Yup.string().required('Medium is required'),
    receiptBook: Yup.string().required('Receipt Book is required'),
    paymentTerm: Yup.string().required('Payment Term is required'),
    paymentMethod: Yup.array().min(1, 'Payment Method is required'),
    totalFeeHead: Yup.number().required('Total Fee Head is required'),
    totalClass: Yup.number().required('Total Class is required'),
  });
