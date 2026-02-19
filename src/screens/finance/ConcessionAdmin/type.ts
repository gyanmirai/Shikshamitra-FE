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
  documentUrl: string;
  uploadedAt: string;
}

export interface IConcessionRequestItem {
  studentConcessionTypeRequestId: string;
  concessionTypeName: string;
  status: number; // 0 = Pending, 1 = Approved, 2 = Rejected
  totalAmount: number;
  feeHeads: IConcessionFeeHead[];
  submittedDocuments: IConcessionSubmittedDocument[];
  createdAt: string;
  updatedAt: string;
  message: string;
  approvedAt: string;
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
