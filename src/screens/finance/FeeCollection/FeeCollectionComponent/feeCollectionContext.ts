import type {
  CollectFeeInput,
  CollectFeeOutput,
  FeeCollectFormDto,
} from 'src/redux/feeCollection/feeCollection';

import { createContext } from 'react';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import type { IStudentFee } from '../Components/type';

export interface FeeCollectionAcademicYear {
  id: string;
  name?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
}

/** The owning workflow supplies Finance data and commands without inventing a Student ID. */
export interface FeeCollectionAdapter {
  contextKey: string;
  data?: FeeCollectFormDto;
  isLoading: boolean;
  isFetching?: boolean;
  error?: unknown;
  refetch: () => unknown;
  collect: (input: Omit<CollectFeeInput, 'studentId'>) => Promise<CollectFeeOutput>;
  isCollecting: boolean;
  canViewReceipts: boolean;
  downloadReceiptPdf: (receiptId: string, receiptType: 'fee' | 'charge') => Promise<Blob>;
}

// Finance retains its existing waiver controls. Other collection contexts opt out explicitly.
export const FeeCollectionWaiverContext = createContext(true);

/** A lost response cannot establish whether Finance committed the payment. */
export const isCollectionOutcomeUncertain = (error: unknown): boolean => {
  const status =
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
  return typeof status !== 'number' || status >= 500 || status === 408;
};

/** Presentation only: a missing Student ID remains missing in every financial command. */
export const collectionDisplayStudent = (form?: FeeCollectFormDto): IStudentFee | null => {
  if (!form) return null;
  const { student, summary } = form;
  return {
    id: student.studentId ?? '',
    studentId: student.studentId ?? '',
    name: student.studentName,
    rollNumber: student.rollNo,
    board: student.boardName,
    medium: student.educationMediumName,
    className: student.standardName,
    division: student.divisionName,
    grNumber: student.grNo,
    contactNumber: student.contactNo,
    email: student.email,
    totalFees: summary.totalFee,
    paidFees: summary.paidFee,
    pendingFees: summary.pendingFee,
    overdueFees: 0,
    status:
      summary.pendingFee <= 0
        ? FeeCollectionStatusType.Paid
        : summary.paidFee > 0
          ? FeeCollectionStatusType.Partial
          : FeeCollectionStatusType.Pending,
    terms: [],
  };
};
