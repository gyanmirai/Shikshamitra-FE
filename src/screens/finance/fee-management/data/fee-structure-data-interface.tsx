interface IFeeStructure {
  id: number;
  totalPayableFee: number;
  totaldiscountAmount: number;
  grossFee: number;
  applicableGrade: string;
  bookRecipt: string;
  isActive: boolean;
  feeSubCategoryList: IFeeSubCategory[];
}

interface IFeeSubCategory {
  id?: number;
  receiptBook: string;
  feeHead: string;
  grossFee: number;
  payableFee: number;
  generalDiscount?: number;
  discountAmount: number;
  discountRemark: string;
  paymentMethod: string[];
  lateFeeChargesType: string;
  lateFeeChargesAmount: string;
  isActive: boolean;
  paymentDueDate: string;
  applicableClass: string[];
}
