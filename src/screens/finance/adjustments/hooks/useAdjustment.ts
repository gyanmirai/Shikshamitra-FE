import { useState, useCallback } from 'react';

import { AdjustmentStatusEnum } from '../enums/adjustment.enum';

import type { ApplyAdjustmentDialogSubmitResult } from '../types/adjustmentApply.types';
import type { AdjustmentRequest, AdjustmentFormValues } from '../types/adjustment.types';

// ---------------------------------------------------------------------------
// Mock data â€” replace with RTK Query / API calls when backend is ready
// ---------------------------------------------------------------------------
const MOCK_ADJUSTMENTS: AdjustmentRequest[] = [
  {
    id: '1',
    studentId: 'STU001',
    studentName: 'Aarav Shah',
    studentGrNo: 'GR001',
    className: '10th',
    divisionName: 'A',
    rollNumber: '01',
    contactNo: '9876543210',
    adjustmentType: 'Fee Correction',
    adjustmentAmount: 500,
    reason: 'Wrong amount collected during April instalment.',
    remarks: 'Verified by accountant.',
    status: AdjustmentStatusEnum.Pending,
    requestedBy: 'Suresh Joshi',
    createdAt: new Date().toISOString(),
    totalPaidFees: 12000,
    paidFeeDetails: [
      {
        receiptNo: 'REC-2024-001',
        paymentDate: '2024-04-10',
        paidAmount: 6000,
        feeType: 'Tuition Fee',
        installment: 'Term 1',
      },
      {
        receiptNo: 'REC-2024-002',
        paymentDate: '2024-10-05',
        paidAmount: 6000,
        feeType: 'Tuition Fee',
        installment: 'Term 2',
      },
    ],
  },
  {
    id: '2',
    studentId: 'STU002',
    studentName: 'Priya Mehta',
    studentGrNo: 'GR002',
    className: '9th',
    divisionName: 'B',
    rollNumber: '12',
    contactNo: '9876543211',
    adjustmentType: 'Overpayment Adjustment',
    adjustmentAmount: 1000,
    reason: 'Student paid â‚¹1,000 excess in March.',
    status: AdjustmentStatusEnum.Approved,
    requestedBy: 'Admin User',
    approvedBy: 'Principal',
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
    approvedAt: new Date(Date.now() - 43200_000).toISOString(),
    totalPaidFees: 15000,
    paidFeeDetails: [
      {
        receiptNo: 'REC-2024-010',
        paymentDate: '2024-03-15',
        paidAmount: 8000,
        feeType: 'Tuition Fee',
        installment: 'Term 1',
      },
    ],
  },
  {
    id: '3',
    studentId: 'STU003',
    studentName: 'Karan Desai',
    studentGrNo: 'GR003',
    className: '8th',
    divisionName: 'A',
    rollNumber: '05',
    adjustmentType: 'Discount Adjustment',
    adjustmentAmount: 300,
    reason: 'Sibling discount not applied correctly.',
    status: AdjustmentStatusEnum.Rejected,
    requestedBy: 'Suresh Joshi',
    rejectedBy: 'Finance Head',
    rejectionReason: 'Discount already applied in previous term.',
    createdAt: new Date(Date.now() - 172800_000).toISOString(),
    totalPaidFees: 9000,
    paidFeeDetails: [
      {
        receiptNo: 'REC-2024-020',
        paymentDate: '2024-02-20',
        paidAmount: 9000,
        feeType: 'Annual Fee',
        installment: 'Annual',
      },
    ],
  },
];

export function useAdjustment() {
  const [adjustments, setAdjustments] = useState<AdjustmentRequest[]>(MOCK_ADJUSTMENTS);

  const createAdjustment = useCallback(
    (
      student: Pick<
        AdjustmentRequest,
        | 'studentId'
        | 'studentName'
        | 'studentGrNo'
        | 'className'
        | 'divisionName'
        | 'rollNumber'
        | 'contactNo'
        | 'totalPaidFees'
        | 'paidFeeDetails'
      >,
      values: AdjustmentFormValues,
      requestedBy: string
    ) => {
      const newAdj: AdjustmentRequest = {
        id: String(Date.now()),
        ...student,
        adjustmentType: values.adjustmentType,
        adjustmentAmount: Number(values.adjustmentAmount),
        reason: values.reason,
        remarks: values.remarks,
        status: AdjustmentStatusEnum.Pending,
        requestedBy,
        createdAt: new Date().toISOString(),
      };
      setAdjustments((prev) => [newAdj, ...prev]);
      return newAdj;
    },
    []
  );

  const approveAdjustment = useCallback((id: string, approvedBy: string) => {
    setAdjustments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: AdjustmentStatusEnum.Approved,
              approvedBy,
              approvedAt: new Date().toISOString(),
            }
          : a
      )
    );
  }, []);

  const applyApprovedAdjustment = useCallback(
    (id: string, approvedBy: string, result: ApplyAdjustmentDialogSubmitResult) => {
      setAdjustments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;

          return {
            ...a,
            status: AdjustmentStatusEnum.Approved,
            approvedBy,
            approvedAt: new Date().toISOString(),
            appliedAmount: result.totalAppliedAmount,
            remainingAdjustmentBalance: result.remainingAdjustmentBalance,
            selectedInstallmentsCount: result.selectedInstallmentsCount,
            applicationLines: result.lines,
            auditTrail: [
              {
                action: 'AdjustmentApproved',
                message: `Adjustment approved by ${approvedBy}.`,
                actor: approvedBy,
                createdAt: new Date().toISOString(),
              },
              {
                action: 'AdjustmentApplied',
                message: `Applied ${result.totalAppliedAmount} across ${result.selectedInstallmentsCount} installment(s).`,
                actor: approvedBy,
                createdAt: new Date().toISOString(),
              },
              {
                action: 'PendingFeesUpdated',
                message: 'Pending fee balances updated after adjustment application.',
                actor: approvedBy,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        })
      );
    },
    []
  );

  const rejectAdjustment = useCallback(
    (id: string, rejectedBy: string, rejectionReason: string) => {
      setAdjustments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: AdjustmentStatusEnum.Rejected, rejectedBy, rejectionReason }
            : a
        )
      );
    },
    []
  );

  return {
    adjustments,
    createAdjustment,
    approveAdjustment,
    applyApprovedAdjustment,
    rejectAdjustment,
  };
}
