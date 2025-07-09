export interface IFeeStructure {
  id: number;
  totalPayableFee: number;
  totaldiscountAmount: number;
  grossFee: number;
  applicableGrade: string;
  bookRecipt: string;
  feeSubCategoryList: IFeeSubCategory[];
  isActive: boolean;
}

export interface IFeeSubCategory {
  id?: number;
  receiptBook: string;
  feeHead: string;
  grossFee: number;
  payableFee: number;
  generalDiscount?: number;
  discountAmount: number;
  discountRemark: string;
  paymentMethod: string[];
  lateFeeChargesType: string; // changed from union to plain string
  lateFeeChargesAmount: string;
  isActive: boolean;
  paymentDueDate: string;
  applicableClass: string[];
}
