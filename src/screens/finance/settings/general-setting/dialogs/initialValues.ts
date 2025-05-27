import type {
  IFinanceFeeSetHeadInterface,
  IFinanceAddLateFeeTypeInterface,
  IFinanceAddPaymentTermInterface,
  IFinanceAddPaymentMethodInterface,
  IFinanceAddPaymentStatusInterface,
  IFinanceAddBudgetCategoryInterface,
  IFinanceAddBudgetSubcategoryInterface,
} from './finance-general-settings-interface';

export function getInitialSetFeeHeadValues(
  data: Partial<IFinanceFeeSetHeadInterface> | null = null
): IFinanceFeeSetHeadInterface {
  return {
    feeHeadName: data?.feeHeadName || '',
  };
}

export function getInitialPaymentMethodValues(
  data: Partial<IFinanceAddPaymentMethodInterface> | null = null
): IFinanceAddPaymentMethodInterface {
  return {
    paymentMethodName: data?.paymentMethodName || '',
  };
}

export function getInitialLateFeeTypeValues(
  data: Partial<IFinanceAddLateFeeTypeInterface> | null = null
): IFinanceAddLateFeeTypeInterface {
  return {
    lateFeeTypeName: data?.lateFeeTypeName || '',
  };
}

export function getInitialPaymentTermValues(
  data: Partial<IFinanceAddPaymentTermInterface> | null = null
): IFinanceAddPaymentTermInterface {
  return {
    paymentTermName: data?.paymentTermName || '',
  };
}

export function getInitialPaymentStatusValues(
  data: Partial<IFinanceAddPaymentStatusInterface> | null = null
): IFinanceAddPaymentStatusInterface {
  return {
    paymentStatusName: data?.paymentStatusName || '',
  };
}

export function getInitialBudgetCategoryValues(
  data: Partial<IFinanceAddBudgetCategoryInterface> | null = null
): IFinanceAddBudgetCategoryInterface {
  return {
    budgetCategoryName: data?.budgetCategoryName || '',
  };
}

export function getInitialBudgetSubcategoryValues(
  data: Partial<IFinanceAddBudgetSubcategoryInterface> | null = null
): IFinanceAddBudgetSubcategoryInterface {
  return {
    budgetCategoryId: data?.budgetCategoryId || '',
    budgetSubcategoryName: data?.budgetSubcategoryName || '',
  };
}
