export interface IHostelFinanceAddFeeCategorySettingDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

export interface IHostelFormikValue {
  id: number;
  bookRecipt: string;
  applicableGrade: string;
  hostelFeeHead: string;
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
  hostelFeeHead: string;
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

export interface IHostelFeeItem {
  hostelFeeHead: string;
  grossFee: number;
  payableFee: number;
  generalDiscount: number;
  paymentMethod: string[];
  lateFeeChargesType: 'fixed' | 'perDay';
  lateFeeChargesAmount: string;
  isActive: boolean;
}

export interface IHostelEditableFeeStructureTableProps {
  data: IHostelFeeItem[];
}

export interface IHostelReadOnlyFeeStructureTableProps {
  data: IHostelFeeItem[];
}

export interface IHostelFinanceAddedFeeHeadForFeeStructureProps {
  data: any;
  onDelete: (data: any) => void;
  onEdit: (data: any) => void;
}

export interface IHostelFeeHeadForFeeStructureProps {
  data: any;
  onDelete: (data: any) => void;
  onEdit: (data: any) => void;
}

export interface IHostelReceiptBook {
  id: number;
  receiptBookName: string;
  receiptBookCode: string;
  toggle?: boolean;
  action?: string;
}

export interface IHostelFeeReceiptBookProps {
  data: IHostelReceiptBook;
  onSave: (values: IHostelReceiptBook) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: IHostelReceiptBook[];
}

export interface IFeeSubCategoryList {
  id: number;
  name: string;
  amount: string;
  isCounted: boolean;
  value: string;
  paymentMethod?: string[];
  discountAmount: number;
  discountCategory: string;
}

export interface IFeeStrctureData {
  id: number;
  // feeCategoryName: string;

  applicableGrade: string;
  statusToggle: boolean;
  action: string;
  bookRecipt: string;
  feeSubCategoryList: IFeeSubCategoryList[];
  paymentDueDate?: any;
  totalAmount: string;
  totaldiscountAmount: number;
  grossFee: number;
}
