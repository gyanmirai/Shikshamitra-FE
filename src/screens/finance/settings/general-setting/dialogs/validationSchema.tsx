import * as Yup from 'yup';

export const setFeeHeadValidationSchema = Yup.object().shape({
  feeHeadName: Yup.string().required('Fee Head is required'),
});

export const addPaymentMethodValidationSchema = Yup.object().shape({
  paymentMethodName: Yup.string().required('Payment Method is required'),
});

export const addLateFeeTypeValidationSchema = Yup.object().shape({
  lateFeeTypeName: Yup.string().required('Late Fee Type Name is required'),
});

export const addPaymentTermValidationSchema = Yup.object({
  paymentTermName: Yup.string().required('Payment Term Name is required'),
});

export const addPaymentStatusValidationSchema = Yup.object({
  paymentStatusName: Yup.string().required('Payment Status Name is required'),
});

export const addBudgetCategoryValidationSchema = Yup.object({
  budgetCategoryName: Yup.string().required('Budget Category Name is required'),
});

export const addBudgetSubcategoryValidationSchema = Yup.object({
  budgetCategoryId: Yup.string().required('Budget Category is required'),
  budgetSubcategoryName: Yup.string().required('Budget Subcategory Name is required'),
});
