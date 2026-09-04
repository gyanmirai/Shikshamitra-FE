import type { FormikProps } from 'formik';
import type { FeeMonth } from 'src/enums/fee-collection-type';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';

// ---------------------------------------------------------------------------
// Per-Fee-Head Payment Term Schedule Override types
// ---------------------------------------------------------------------------
export interface IInstallmentOverride {
  id?: string;
  installmentName: string;
  sequence: number;
  startDate: string | null;
  endDate: string | null;
  demandDate?: string | null;
  dueDate: string | null;
  /** UI-only flag — true when user has edited this row vs the master */
  isModified?: boolean;
}

export interface IFeeHeadPaymentTermOverride {
  paymentTermId: string;
  paymentTermName: string;
  installmentCount: number;
  /** false = Inherited (master schedule intact), true = Customized */
  isCustomized: boolean;
  /** true when financial transactions already exist for this Fee Head */
  isLocked: boolean;
  installments: IInstallmentOverride[];
}

// ---------------------------------------------------------------------------
// Core fee-head item
// ---------------------------------------------------------------------------
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
  /** Payment term assigned to this fee head (id + display name from master) */
  paymentTermId?: string;
  paymentTermName?: string;
  paymentTermVersionId?: string;
  /** Inherited = master schedule; Customized = fee-head override applied */
  scheduleMode?: 'Inherited' | 'Customized';
  /** Override schedule; undefined = inherited from master payment term */
  paymentTermOverride?: IFeeHeadPaymentTermOverride;
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
  concessionPolicyId?: string;
	concessionFeeHeadScope?: 'EntireFeeStructure' | 'SelectedFeeHeads';
	concessionApplicableFeeHeadIds?: string[];
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

// ---------------------------------------------------------------------------
// Dummy Payment Terms data for Fee Head level configuration
// ---------------------------------------------------------------------------
export const DUMMY_PAYMENT_TERMS = [
  {
    id: 'term-annual',
    paymentTermName: 'Annual',
    status: 'Active',
    installments: [
      {
        id: 'inst-annual-1',
        installmentName: 'Full Term',
        sequence: 1,
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2027-03-31T00:00:00.000Z',
        dueDate: '2026-04-10T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'term-semiannual',
    paymentTermName: 'Semi-Annual',
    status: 'Active',
    installments: [
      {
        id: 'inst-semi-1',
        installmentName: 'Term 1',
        sequence: 1,
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-09-30T00:00:00.000Z',
        dueDate: '2026-04-10T00:00:00.000Z',
      },
      {
        id: 'inst-semi-2',
        installmentName: 'Term 2',
        sequence: 2,
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2027-03-31T00:00:00.000Z',
        dueDate: '2026-10-10T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'term-quarterly',
    paymentTermName: 'Quarterly',
    status: 'Active',
    installments: [
      {
        id: 'inst-q1',
        installmentName: 'Quarter 1',
        sequence: 1,
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-06-30T00:00:00.000Z',
        dueDate: '2026-04-10T00:00:00.000Z',
      },
      {
        id: 'inst-q2',
        installmentName: 'Quarter 2',
        sequence: 2,
        startDate: '2026-07-01T00:00:00.000Z',
        endDate: '2026-09-30T00:00:00.000Z',
        dueDate: '2026-07-10T00:00:00.000Z',
      },
      {
        id: 'inst-q3',
        installmentName: 'Quarter 3',
        sequence: 3,
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2026-12-31T00:00:00.000Z',
        dueDate: '2026-10-10T00:00:00.000Z',
      },
      {
        id: 'inst-q4',
        installmentName: 'Quarter 4',
        sequence: 4,
        startDate: '2027-01-01T00:00:00.000Z',
        endDate: '2027-03-31T00:00:00.000Z',
        dueDate: '2027-01-10T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'term-monthly',
    paymentTermName: 'Monthly',
    status: 'Active',
    installments: [
      {
        id: 'inst-m-1',
        installmentName: 'Apr Month',
        sequence: 1,
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-04-30T00:00:00.000Z',
        dueDate: '2026-04-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-2',
        installmentName: 'May Month',
        sequence: 2,
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-05-31T00:00:00.000Z',
        dueDate: '2026-05-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-3',
        installmentName: 'Jun Month',
        sequence: 3,
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-30T00:00:00.000Z',
        dueDate: '2026-06-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-4',
        installmentName: 'Jul Month',
        sequence: 4,
        startDate: '2026-07-01T00:00:00.000Z',
        endDate: '2026-07-31T00:00:00.000Z',
        dueDate: '2026-07-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-5',
        installmentName: 'Aug Month',
        sequence: 5,
        startDate: '2026-08-01T00:00:00.000Z',
        endDate: '2026-08-31T00:00:00.000Z',
        dueDate: '2026-08-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-6',
        installmentName: 'Sep Month',
        sequence: 6,
        startDate: '2026-09-01T00:00:00.000Z',
        endDate: '2026-09-30T00:00:00.000Z',
        dueDate: '2026-09-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-7',
        installmentName: 'Oct Month',
        sequence: 7,
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2026-10-31T00:00:00.000Z',
        dueDate: '2026-10-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-8',
        installmentName: 'Nov Month',
        sequence: 8,
        startDate: '2026-11-01T00:00:00.000Z',
        endDate: '2026-11-30T00:00:00.000Z',
        dueDate: '2026-11-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-9',
        installmentName: 'Dec Month',
        sequence: 9,
        startDate: '2026-12-01T00:00:00.000Z',
        endDate: '2026-12-31T00:00:00.000Z',
        dueDate: '2026-12-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-10',
        installmentName: 'Jan Month',
        sequence: 10,
        startDate: '2027-01-01T00:00:00.000Z',
        endDate: '2027-01-31T00:00:00.000Z',
        dueDate: '2027-01-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-11',
        installmentName: 'Feb Month',
        sequence: 11,
        startDate: '2027-02-01T00:00:00.000Z',
        endDate: '2027-02-28T00:00:00.000Z',
        dueDate: '2027-02-10T00:00:00.000Z',
      },
      {
        id: 'inst-m-12',
        installmentName: 'Mar Month',
        sequence: 12,
        startDate: '2027-03-01T00:00:00.000Z',
        endDate: '2027-03-31T00:00:00.000Z',
        dueDate: '2027-03-10T00:00:00.000Z',
      },
    ],
  },
];
