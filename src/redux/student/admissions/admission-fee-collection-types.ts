import type { CollectFeeInput } from 'src/redux/feeCollection/feeCollection';
import type { AssignmentHead } from 'src/redux/finance/studentFeeAssignment';

export type AdmissionCollectionAcademicYear = {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
};

export type AdmissionCollectionReceipt = {
  id: string;
  receiptNumber: string;
  amount: number;
  status: 'confirmed' | 'pendingVerification' | 'reversed';
  collectedAt: string;
  paymentMethods: string[];
  scope?: 'fee' | 'charge';
};

export type AdmissionFeeCollectionSummary = {
  applicationId: string;
  accountId: string | null;
  studentId: string | null;
  applicantName: string;
  applicationNumber: string;
  academicYear: AdmissionCollectionAcademicYear;
  currency: string;
  structureName: string;
  structureRevision: number;
  totalAmount: number | null;
  confirmedPaidAmount: number;
  pendingVerificationAmount: number;
  outstandingAmount: number | null;
  canCollect: boolean;
  blocker: string | null;
  hasPaymentEvidence: boolean;
  feeHeads: {
    feeHeadId: string;
    feeHeadName: string;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    status: 'paid' | 'partial' | 'pending' | 'pendingVerification';
  }[];
  receipts: AdmissionCollectionReceipt[];
  variableFeeHeads?: AssignmentHead[];
};

export type AdmissionVariableFeeHead = {
  feeHeadId: string;
  amount: number;
  zeroAmountReason?: string;
};

export type CollectAdmissionFeeInput = Omit<CollectFeeInput, 'studentId'>;

export const admissionFeeCollectionUrl = (applicationId: string) =>
  `/fee-collections/admission-applications/${applicationId}`;
