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

export interface IConcessionRequestItem {
  studentConcessionTypeRequestId: string;
  concessionTypeId: string;
  concessionTypeName: string;
  status: number; // 0 = Pending, 1 = Approved, 2 = Rejected
  totalAmount: number;
  feeHeads: IConcessionFeeHead[];
  submittedDocuments: IConcessionSubmittedDocument[];
  createdAt: string;
  updatedAt: string;
  message: string;
  approvedAt: string;
  isDocumentUploaded?: boolean;
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
  onApprove?: () => void;
  onReject?: () => void;
  onClose: () => void;
}

// ---- Fee-Head Wise Approval Types ----

export interface IConcessionMonthItem {
  month: string;
  total: number;
  paid: number;
  due: number;
  concessionAmount: number;
  status: FeeCollectionStatusType;
}

export interface IConcessionFeeHeadWiseGroup {
  feeHeadId: string;
  feeHeadName: string;
  months: number;
  totalDue: number;
  concessionAmount: number;
  isConcessionApply: boolean;
  items: IConcessionMonthItem[];
}

export interface IConcessionFeeHeadWiseResponse {
  feeHeadWise: IConcessionFeeHeadWiseGroup[];
}

export interface IFeeHeadApprovalViewProps {
  selectedItem: IConcessionRequestItem;
  mode: 'Approve' | 'Cancel';
  onBack: () => void;
}
