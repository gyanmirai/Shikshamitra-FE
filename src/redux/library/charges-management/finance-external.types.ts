export type FinanceExternalSource = {
  kind: 1;
  sourceId: string;
  sourceVersion: string;
};

export type FinanceExternalReceivable = {
  source: FinanceExternalSource;
  financeChargeRequestId: string;
  financeChargeId: string;
  academicYearId: string;
  academicYearName?: string | null;
  payer: {
    kind: 1 | 2;
    studentId: string | null;
    employeeId: string | null;
    displayName: string;
  };
  currency: string;
  assessmentDate: string;
  dueDate: string;
  originalAmount: number;
  acceptedPaymentAmount: number;
  settledPaymentAmount: number;
  pendingVerificationAmount: number;
  waivedAmount: number;
  refundedAmount: number;
  outstandingAmount: number;
  financialOutstandingAmount?: number;
  approvalStatus: number;
  settlementAvailable: boolean;
  settlementBlockedReason: string | null;
};

export type FinanceExternalCollectionForm = {
  receivable: FinanceExternalReceivable;
  revision: string;
  settlementPolicyBindingId: string | null;
  collectionPolicyVersionId: string | null;
  refundPolicyVersionId: string | null;
  paymentMethods: number[];
  canCollect: boolean;
  setupIssues: string[];
};

export type FinanceExternalCollection = {
  collectionId: string;
  receiptId: string;
  receiptNumber: string;
  receiptKind: number;
  verificationStatus: number;
  schoolReceiptDate: string;
  acceptedAmount: number;
  receivable: FinanceExternalReceivable;
};

export type FinanceExternalWaiver = {
  requestId: string;
  applicationId: string | null;
  state: number;
  requestedAmount: number;
  appliedAmount: number;
  reversedAmount: number;
  receivable: FinanceExternalReceivable;
};
