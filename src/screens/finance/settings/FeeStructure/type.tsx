import type { FormikProps } from 'formik';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { FeeStructureClassStatusType } from 'src/enums/fee-structure-statusType';

export interface IClassWiseFeeItem {
  feeCategory: string;
  feeHead: string;
  amount: number;
  required: boolean;
}

export interface IClassWiseFeeData {
  status: FeeStructureClassStatusType;
  feeItems: IClassWiseFeeItem[];
}

export interface IFeeStructure {
  feeStructureName: string;
  academicYear?: string;
  board?: string;
  medium?: string;
  status: number;
  receiptBook: string;
  paymentTerm: string;
  totalFeeHead?: number;
  totalClass?: number;
  paymentMethod: string[];
  feeStructureClasses: {
    [className: string]: IClassWiseFeeData;
  };
}

export interface IFeeStructureTableProps {
  data: IFeeStructure[];
  addFeeStructure: UseBooleanReturn;
  editData: IFeeStructure | null;
  setEditData: (data: IFeeStructure | null) => void;
  onDelete?: (data: IFeeStructure) => void;
  onEdit?: (data: IFeeStructure) => void;
  onToggle?: (data: IFeeStructure) => void;
}

export interface IFeeStructureFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IFeeStructure | null;
}

export interface FeeStructureCardProps {
  className: string;
  feeItems: IClassWiseFeeItem[];
  formik: FormikProps<IFeeStructure>;
}
