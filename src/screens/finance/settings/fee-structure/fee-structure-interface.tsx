export interface IFinanceAddFeeCategorySettingDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
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
}

export interface IEditableFeeStructureTableProps {
  data: IFeeItem[];
}
