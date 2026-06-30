import type { FormikProps } from 'formik';
import type { FeeMonth } from 'src/enums/fee-collection-type';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';

export interface IClassWiseFeeItem {
  id?: string;
  feeHeadId: string;
  feeHeadName?: string; // for UI display
  feeCategoryName?: string; // for UI display only
  amount: number;
  isOneTime: boolean;
  paybleMonth?: FeeMonth; // for monthly fee heads
  payableYear?: number;
  isOptional: boolean;
}

export interface IClassWiseFeeData {
  _id?: string; // stable client-side key for AnimatePresence / list rendering
  name: string; // class-level fee structure name
  feeHeads: IClassWiseFeeItem[];
  status?: FeeStructureLockStatusType;
}

/**
 * Independent card model used by the new per-structure architecture.
 * Each card owns its _id, classId, feeStructureId, and lock status.
 */
export interface IClassWiseFeeStructureCard {
  _id?: string; // undefined = unsaved (new draft)
  name: string;
  feeHeads: IClassWiseFeeItem[];
  status: FeeStructureLockStatusType;
  classId: string;
  feeStructureMetaDataId: string;
  // Finance Policies
  paymentPolicyId?: string;
  collectionPolicyId?: string;
  refundPolicyId?: string;
  prorationPolicyId?: string;
}

export interface IFeeStructure {
  id: any;
  name: string;
  status?: number;
  academicYearId?: string;
  academicYearName?: string;

  boardId?: string;
  boardName?: string;
  mediumId?: string;
  mediumName?: string;
  receiptBookId?: string;
  receiptBookName?: string;
  // paymentTerm: string;
  totalFeeHeads?: number;
  totalClasses?: number;
  configuredClasses?: number;
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

export interface IFeeStructureEditFormProps {
  editData: IFeeStructure;
  onClose: (e: any, isSubmit?: boolean) => void;
}

export interface FeeStructureCardProps {
  className: string;
  feeItems: IClassWiseFeeItem[];
  structureIndex: number;
  formik: FormikProps<IFeeStructure>;
  onAddFeeHead: () => void;
}
