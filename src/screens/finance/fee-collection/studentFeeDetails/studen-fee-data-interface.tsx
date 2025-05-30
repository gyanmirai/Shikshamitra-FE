export interface IStudentDetails {
  name: string;
  rollNumber: number | string;
  standard: string;
  division: string;
  grNumber: number | string;
}

export interface IStudentFeeDetails {
  grossFee: number;
  payableFee: number;
  totalPaidFee: number;
  totalPendingFee: number;
  totalGeneralDiscount: number;
  totalAdditionalDiscount: number;
  totalDiscount: number;
}

export interface IStudentFeeHeadDetails {
  feeHead: string;
  grossFee: number;
  generalDiscount: number;
  payableFee: number;
  additionalDiscount?: number | null;
  remark?: string;
}

export interface IAdditionalDiscount {
  studentFeeData: IStudentFeeDetails;
  studentDetails: IStudentDetails;
  data: IStudentFeeHeadDetails[];
}
