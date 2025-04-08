interface IFeeSubCategory {
  feeHead: string;
  grossFee: number;
  payableFee: number;
  generalDiscount: number;
  paymentMethod: string[];
  lateFeeChargesType: 'fixed' | 'perDay';
  lateFeeChargesAmount: string;
  isActive: boolean;
}

interface IFeeStructure {
  id: number;
  amount: number;
  discountAmount: number;
  grossFee: number;
  applicableGrade: string;
  bookRecipt: string;
  paymentDueDate: string;
  payableFees: number;
  feeSubCategoryList: IFeeSubCategory[];
  isActive: boolean;
}
