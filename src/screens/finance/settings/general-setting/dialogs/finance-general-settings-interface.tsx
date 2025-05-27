export interface IFinanceFeeSetHeadInterface {
  feeHeadName: string;
  feeHeadCode?: string;
}

export interface ISetFeeHeadDialogProps {
  data: IFinanceFeeSetHeadInterface | null;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (formValues: IFinanceFeeSetHeadInterface) => void;
}

export interface IFinanceAddPaymentMethodInterface {
  paymentMethodName: string;
}

export interface IFinanceAddPaymentMethodDialogProps {
  data: IFinanceAddPaymentMethodInterface | null;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (formValues: IFinanceAddPaymentMethodInterface) => void;
}

export interface IFinanceAddLateFeeTypeInterface {
  lateFeeTypeName: string;
}

export interface IFinanceAddLateFeeTypeDialogProps {
  data: IFinanceAddLateFeeTypeInterface | null;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (formValues: IFinanceAddLateFeeTypeInterface) => void;
}

export interface IFinanceAddPaymentTermInterface {
  paymentTermName: string;
}

export interface IFinanceAddPaymentTermDialogProps {
  data: IFinanceAddPaymentTermInterface | null;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (formValues: IFinanceAddPaymentTermInterface) => void;
}

export interface IFinanceAddPaymentStatusInterface {
  paymentStatusName: string;
}

export interface IFinanceAddPaymentStatusDialogProps {
  data: IFinanceAddPaymentStatusInterface | null;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (formValues: IFinanceAddPaymentStatusInterface) => void;
}

export interface IFinanceAddBudgetCategoryInterface {
  budgetCategoryName: string;
}

export interface IFinanceAddBudgetCategoryDialogProps {
  data: IFinanceAddBudgetCategoryInterface | null;
  isEditMode: boolean;
  onClose: () => void;
  onSave: (formValues: IFinanceAddBudgetCategoryInterface) => void;
}

export interface IFinanceAddBudgetSubcategoryInterface {
  budgetCategoryId: string; // Assuming category is identified by an ID (string)
  budgetSubcategoryName: string;
}

export interface IFinanceAddBudgetSubcategoryDialogProps {
  data: IFinanceAddBudgetSubcategoryInterface | null;
  categories: { id: string; name: string }[]; // List of categories for dropdown
  isEditMode: boolean;
  onClose: () => void;
  onSave: (formValues: IFinanceAddBudgetSubcategoryInterface) => void;
}
