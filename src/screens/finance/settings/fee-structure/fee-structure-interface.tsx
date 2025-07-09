import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IFinanceAddFeeCategorySettingDialogProps {
  dialogValue: UseBooleanReturn;
  data: any;
  onSave: (values: any) => void;
  onClose: (e: any, isSubmit: false) => void;
  isEdit: boolean;
  allData: any;
  setSelectedEntry: (data: any) => void;
}

export interface IFormikValue {
  id: number;
  bookRecipt: string;
  applicableGrade: string;
  feeHead: string;
  grossFee: string;
  discountAmount: string;
  discountRemark: string;
  payableFee: string;
  paymentMethod: string[];
  paymentDueDate: any;
  multipleApplicableGrade: string[];
  chargesType: string;

  lateFeeChargesType: string;
  lateFeeChargesAmount: string;
}

export interface IFeeStructure {
  feeHead: string;
  grossFee: string;
  discountAmount: string;
  discountRemark: string;
  payableFee: string;
  paymentMethod: string[];
  lateFeeChargesAmount: string;
  lateFeeChargesType: string;
  applicableGrade: string;
  bookRecipt: string;
}

export interface IFeeItem {
  feeHead: string;
  grossFee: number;
  payableFee: number;
  generalDiscount: number;
  paymentMethod: string[];
  lateFeeChargesType: 'fixed' | 'perDay';
  lateFeeChargesAmount: string;
  isActive: boolean;
  discountReason: string;
}

export interface IEditableFeeStructureTableProps {
  data: IFeeItem[];
  onClose: (e: null, isSubmit: boolean) => void;
}

export interface IReadOnlyFeeStructureTableProps {
  data: IFeeItem[];
}

export interface IFinanceAddedFeeHeadForFeeStructureProps {
  data: any;
  onDelete: (data: any) => void;
  onEdit: (data: any) => void;
}
