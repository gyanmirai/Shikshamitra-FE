import type { FormikProps } from 'formik';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { FeeStructureClassStatusType } from 'src/enums/fee-structure-statusType';

export interface IClassWiseFeeItem {
  id?: string;
  feeHeadId: string;
  feeHeadName?: string; // for UI display
  amount: number;
  isOneTime: boolean;
  isOptional: boolean;
}

export interface IClassWiseFeeData {
  _id?: string; // stable client-side key for AnimatePresence / list rendering
  name: string; // class-level fee structure name
  status: FeeStructureClassStatusType;
  feeHeads: IClassWiseFeeItem[];
}

export interface IFeeStructure {
  id: any;
  name: string;
  academicYearId?: string;
  academicYearName?: string;

  boardId?: string;
  boardName?: string;
  mediumId?: string;
  mediumName?: string;
  status: number;
  receiptBookId?: string;
  receiptBookName?: string;
  // paymentTerm: string;
  totalFeeHead?: number;
  totalClass?: number;
  // paymentMethod: string[];
  feeStructureClasses: {
    [className: string]: IClassWiseFeeData[];
  };
}

export interface IFeeStructureTableProps {
  addFeeStructure: UseBooleanReturn;
  editData: IFeeStructure | null;
  setEditData: (data: IFeeStructure | null) => void;
  onDelete?: (data: IFeeStructure) => void;
  onEdit?: (data: IFeeStructure) => void;
  onView?: (data: IFeeStructure) => void;
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
  structureIndex: number;
  formik: FormikProps<IFeeStructure>;
  onAddFeeHead: () => void;
}
