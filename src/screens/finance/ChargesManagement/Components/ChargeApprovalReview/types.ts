import type { IChargeDetailData } from '../ChargesManage/Component/type';

/**
 * Props for ChargeApprovalReview component
 */
export interface IChargeApprovalReviewProps {
  chargeId: string;
  mode: 'approve' | 'reject';
  open: boolean;
  onClose: () => void;
}

/**
 * Student info in the approval review
 */
export interface IApprovalReviewStudent {
  studentId: string;
  studentName: string;
  grNumber?: string;
  rollNumber?: number;
  standardName?: string;
  divisionName?: string;
}

/**
 * Charge details with students for approval review
 */
export interface IChargeApprovalData extends IChargeDetailData {
  students?: IApprovalReviewStudent[];
  totalStudents?: number;
  createdOn?: string;
  createdBy?: string;
}

/**
 * Props for StudentChargeReviewTable
 */
export interface IStudentChargeReviewTableProps {
  students: IApprovalReviewStudent[];
  selectedStudentIds: string[];
  onStudentSelect?: (studentId: string, isChecked: boolean) => void;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
}

/**
 * Props for ChargeApprovalConfirmationDialog
 */
export interface IChargeApprovalConfirmationDialogProps {
  open: boolean;
  mode: 'approve' | 'reject';
  chargeId: string;
  chargeName: string;
  totalStudents: number;
  selectedStudents: number;
  onConfirm: (notes: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
