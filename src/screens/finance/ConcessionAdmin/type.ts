import type { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import type { IStudentInfo } from '../Concession/type';

// ---- Types for the "view concession by student" API response ----

export interface IConcessionFeeHead {
  feeHeadId: string;
  feeHeadName: string;
  amount: number;
  netAmount: number;
  description: string;
}

export interface IConcessionSubmittedDocument {
  documentId: string;
  documentName: string;
  url: string;
  uploadedAt: string;
  status?: number;
}

export interface IRequiredDocument {
  documentId: string;
  documentName: string;
  url: string | null;
  isUploaded: boolean;
  isRequired: boolean;
  maxFileSizeBytes: number;
  acceptedFormats: number[];
}

export interface IConcessionRequestItem {
  requesterId?: string | null;
  submittedById?: string | null;
  autoCreateRefund?: boolean;
  paidConcessionAmount?: number;
  canCreateRefundRequests?: boolean;
  id?: string;
  studentConcessionTypeRequestId: string;
  concessionTypeId: string;
  concessionTypeName: string;
  status: number; // Pending, approved, rejected, cancelled, partially reversed, or reversed
  totalAmount: number;
  totalRequestedAmount: number;
  totalApprovedAmount: number;
  totalReversedAmount: number;
  netApprovedAmount: number;
  refundRequests?: Array<{
    refundRequestId: string;
    voucherNumber: string;
    originalReceiptId: string;
    amount: number;
    status: string;
  }>;
  feeHeads: IConcessionFeeHead[];
  submittedDocuments: IConcessionSubmittedDocument[];
  requiredDocuments?: IRequiredDocument[];
  createdAt: string;
  updatedAt: string;
  message: string;
  approvedAt: string;
  concurrencyStamp: string;
  isDocumentUploaded?: boolean;
  availableActions?: string[];
  timeline?: Array<{
    action: string;
    status: number;
    actorId?: string | null;
    occurredAt: string;
    reason?: string | null;
    amount?: number | null;
  }>;
}

export interface IConcessionBasicDetail {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

export interface IStudentConcessionDetailsResponse {
  studentDetails: {
    studentId: string;
    name: string;
    rollNo: string;
    grNumber: string;
    standardName: string;
    divisionName: string;
    boardName?: string;
    educationMediumName?: string;
  };
  concessionBasicDetail: IConcessionBasicDetail;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  items: IConcessionRequestItem[];
}

// ---- Props for the view form ----

export interface IViewConcessionRequestProps {
  student: IStudentInfo | null;
  onEdit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onClose: () => void;
}

// ---- Fee-Head Wise Approval Types ----

export interface IConcessionMonthItem {
  dueFeeId: string;
  concessionDueFeeAllocationId?: string;
  month: string;
  total: number;
  paid: number;
  due: number;
  concessionAmount: number;
  suggestedConcessionAmount: number;
  appliedConcessionAmount?: number;
  reversedConcessionAmount?: number;
  reversibleConcessionAmount?: number;
  status: FeeCollectionStatusType | string;
  isSelectable?: boolean;
  year: number;
  concurrencyStamp: string;
}

export interface IConcessionFeeHeadWiseGroup {
  feeHeadId: string;
  feeHeadName: string;
  months: number;
  totalDue: number;
  concessionAmount: number;
  requestedConcessionAmount: number;
  liveMaximumConcessionAmount: number;
  hasChangedSinceSubmission: boolean;
  isConcessionApply: boolean;
  items: IConcessionMonthItem[];
}

export interface IConcessionFeeHeadWiseResponse {
  feeHeadWise: IConcessionFeeHeadWiseGroup[];
}

export interface IFeeHeadApprovalViewProps {
  selectedItem: IConcessionRequestItem;
  mode: 'Approve' | 'Reverse';
  onBack: () => void;
}
