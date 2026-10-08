export interface FeeHead {
  feeHeadId: string;
  feeHeadName: string;
  amount: number;
  netAmount: number;
  description?: string | null;
}

export interface Document {
  documentId: string;
  documentName: string;
  documentUrl: string;
  uploadedAt: string;
}

export enum RecordStatusEnum {
  DRAFT = 0,
  SUBMITTED = 1,
  CANCELLED = 2,
}

export interface FeeHeadObject {
  feeHeadId: string;
  feeHeadName: string;
  amount: number;
}

export interface StudentFeeStructureRequest {
  boardId: string;
  educationMediumId: string;
  standardId: string;
  divisionId: string;
  studentId: string;
}

export interface StudentFeeStructureCreatedResponse {
  success: boolean;
  data: {
    concessionRequestId: string;
    boardId: string;
    educationMediumId: string;
    standardId: string;
    divisionId: string;
    studentId: string;
    academicYear: string;
    status: RecordStatusEnum;
    currentStep: number;
    completedSteps: number[];
    createdAt: string;
  };
}

export interface StudentFeeStructureResponse {
  success: boolean;
  data: {
    concessionRequestId: string;
    academicYear: string;
    boardId: string;
    boardName: string;
    educationMediumId: string;
    educationMediumName: string;
    standardId: string;
    standardName: string;
    divisionId: string;
    divisionName: string;
    studentId: string;
    studentName: string;
    feeStructureId: string;
    feeStructureName: string;
    feeHeads: FeeHeadObject[];
    totalamount: number;
    status: number;
    currentStep: number;
    completedSteps: number[];
    createdAt: string;
    updatedAt: string;
  };
}

export enum ConcessionTypeEnum {
  MERIT_SCHOLARSHIP = 0,
  SPORTS_QUOTA = 1,
  STAFF_WARD = 2,
  NEED_BASED = 3,
  MANAGEMENT_QUOTA = 4,
}

export enum ConcessionRequestStatusEnum {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  CANCELLED = 3,
  PARTIALLY_REVERSED = 4,
  REVERSED = 5,
  DRAFT = 6,
}

export enum DiscountBasedOnEnum {
  AMOUNT_BASED = 0,
  PERCENTAGE = 1,
}

export interface FeeHeadValueEntry {
  feeHeadId: string;
  basedOn: DiscountBasedOnEnum;
  amount: number;
  netAmount: number;
}

export interface ConcessionTypeValueBlock {
  concessionTypeId: string;
  feeHeadValues: FeeHeadValueEntry[];
}

export interface FeeHeadValueResult {
  feeHeadId: string;
  feeHeadName: string;
  annualBaseAmount: number;
  basedOn: DiscountBasedOnEnum;
  amount: number;
  discountAmount: number;
  netAmount: number;
}

export interface ConcessionTypeValueResult {
  concessionTypeId: string;
  concessionTypeName: string;
  concessionType: ConcessionTypeEnum;
  feeHeadValues: FeeHeadValueResult[];
  totalDiscountAmount: number;
  totalNetAmount: number;
}

export interface StudentBasicDetails {
  studentId: string;
  name: string;
  rollNo: string;
  grNumber: string;
  standardName: string;
  divisionName: string;
}

export interface ApplicationconcessionBasicDetail {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

export interface ConcessionRequest {
  studentConcessionTypeRequestId: string;
  concessionType: number;
  concessionTypeName: string;
  status: number;
  totalAmount: number;
  feeHeads: FeeHead[];
  submittedDocuments: Document[];
  createdAt: string;
  updatedAt: string;
  message?: string | null;
  approvedAt?: string | null;
}

export interface ConcessionListResponse {
  studentDetails: StudentBasicDetails;
  concessionBasicDetail: ApplicationconcessionBasicDetail;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  items: ConcessionRequest[];
}

export interface ApprovalRequest {
  message?: string | null;
}

export interface RejectionRequest {
  message: string;
}

export interface ApprovalResponse {
  studentConcessionTypeRequestId: string;
  status: number;
  statusName: string;
  approvedAt: string;
  approverId: string;
  approverMessage?: string | null;
  message: string;
}

export interface RejectionResponse {
  studentConcessionTypeRequestId: string;
  status: number;
  statusName: string;
  rejectedAt: string;
  rejectorId: string;
  rejectionReason: string;
  message: string;
}

export interface ConcessionApplication {
  id: string;
  requesterId?: string | null;
  submittedById?: string | null;
  studentId: string;
  concessionRequestId: string;
  concessionTypeId: string;
  studentName: string;
  rollNo: string;
  grNumber: string;
  standardName: string;
  divisionName: string;
  email: string;
  contactNo: string;
  totalConcessionApplication: number;
  concessionTypeName: string;
  concessionPolicyCode: string;
  concessionPolicyVersion: number;
  documentSubmissionState: string;
  concessionAmount: number;
  requestedConcessionAmount: number;
  approvedConcessionAmount: number;
  status: ConcessionRequestStatusEnum;
  statusName: string;
  createdAt: string;
  concurrencyStamp: string;
  availableActions: string[];
}

export interface ConcessionApplicationsResponse {
  draftCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  partiallyReversedCount: number;
  reversedCount: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  items: ConcessionApplication[];
}

export interface ConcessionTypesResponse {
  success: boolean;
  data: {
    concessionRequestId: string;
    selectedConcessionTypes: {
      concessionTypeId: string;
      name: string;
    }[];
  };
}

export interface FeeHeadsDataResponse {
  success: boolean;
}

export interface ValueEntryResponse {
  success: boolean;
  data: {
    concessionRequestId: string;
    requestStatus: ConcessionRequestStatusEnum;
    concessionTypeValues: ConcessionTypeValueResult[];
    grandTotalDiscountAmount: number;
    grandTotalNetAmount: number;
  };
}

export type ApiDataResponse<T> = { success: boolean; data: T };

export interface ConcessionDocumentRequirement {
  documentId: string;
  documentName: string;
  isRequired: boolean;
  maxFileSizeBytes: number;
  acceptedFormats: number[];
  url?: string | null;
  isUploaded: boolean;
}

export interface ConcessionEligibleDueFee {
  dueFeeId: string;
  feeHeadId: string;
  feeHeadName: string;
  month: number;
  year: number;
  installmentLabel: string;
  originalAmount: number;
  paidAmount: number;
  concessionAmount: number;
  adjustmentCreditAmount: number;
  outstandingAmount: number;
  eligibleConcessionAmount: number;
  status: string;
  concurrencyStamp: string;
}

export interface ConcessionEligibleFeeHead {
  feeHeadId: string;
  feeHeadName: string;
  eligibleOutstanding: number;
}

export interface ConcessionTypeOption {
  concessionTypeId: string;
  name: string;
  description?: string | null;
  documents: ConcessionDocumentRequirement[];
}

export interface ConcessionPolicyOption {
  autoCreateRefund?: boolean;
  concessionPolicyId: string;
  concessionPolicyVersionId: string;
  policyName: string;
  policyCode: string;
  version: number;
  isDefault: boolean;
  valueSource: 'PolicyFixed' | 'RequestEnteredWithinLimits';
  calculationMethod: 'Percentage' | 'FixedAmount' | 'FullWaiver';
  percentageValue?: number | null;
  fixedAmount?: number | null;
  maximumPercentage?: number | null;
  maximumFixedAmount?: number | null;
  applyOn: 'CurrentInstallment' | 'FutureInstallments' | 'AllOutstanding' | 'AllFees';
  roundingMethod: string;
}

export interface ConcessionRequestContext {
  academicYearId: string;
  studentId: string;
  studentName: string;
  studentFeeStructureId: string;
  feeStructureName: string;
  currency: string;
  assignmentSelectionRequired: boolean;
  assignments: {
    studentFeeStructureId: string;
    feeStructureId: string;
    feeStructureName: string;
    chargeStartDate: string;
    chargeEndDate: string;
  }[];
  blockers: string[];
  feeHeads: ConcessionEligibleFeeHead[];
  eligibleDueFees: ConcessionEligibleDueFee[];
  concessionPolicies: ConcessionPolicyOption[];
  concessionTypes: ConcessionTypeOption[];
}

export interface FeeHeadConcessionInput {
  feeHeadId: string;
  basedOn: 0 | 1;
  amount: number;
}

export interface DueFeeConcessionInput {
  dueFeeId: string;
  feeHeadId: string;
  amount: number;
}

export interface ConcessionDocumentInput {
  documentId: string;
  url: string;
  status: 1;
}

export interface ConcessionDraftCommand {
  academicYearId: string;
  studentId: string;
  studentFeeStructureId?: string;
  concessionPolicyId: string;
  concessionPolicyVersionId: string;
  concessionTypeId: string;
  sourceRequestId?: string;
  idempotencyKey?: string;
  previewFingerprint?: string;
  remarks?: string;
  feeHeadConcessions: FeeHeadConcessionInput[];
  dueFeeConcessions?: DueFeeConcessionInput[];
  documents: ConcessionDocumentInput[];
}

export interface ConcessionRequestDetail {
  autoCreateRefund: boolean;
  paidConcessionAmount: number;
  canCreateRefundRequests: boolean;
  concessionRequestId: string;
  academicYearId: string;
  studentId: string;
  studentName: string;
  concessionTypeId: string;
  studentFeeStructureId: string;
  concessionPolicyId: string;
  concessionPolicyVersionId: string;
  concessionPolicyName: string;
  concessionPolicyCode: string;
  concessionPolicyVersion: number;
  concessionTypeName: string;
  status: ConcessionRequestStatusEnum;
  statusName: string;
  concurrencyStamp: string;
  requesterId?: string | null;
  submittedById?: string | null;
  decidedById?: string | null;
  sourceRequestId?: string | null;
  submittedAt?: string | null;
  cancellationReason?: string | null;
  totalRequestedConcessionAmount: number;
  totalApprovedConcessionAmount: number;
  totalReversedConcessionAmount: number;
  netApprovedConcessionAmount: number;
  refundRequests?: Array<{
    refundRequestId: string;
    voucherNumber: string;
    originalReceiptId: string;
    amount: number;
    status: string;
  }>;
  remarks?: string | null;
  boardId: string;
  educationMediumId: string;
  standardId: string;
  divisionId: string;
  feeHeadConcessions: FeeHeadValueResult[];
  dueFeeConcessions?: DueFeeConcessionInput[];
  requiredDocuments: ConcessionDocumentRequirement[];
  submittedDocuments: Array<{
    documentId: string;
    documentName: string;
    url: string;
    status: number;
  }>;
  documentSubmissionState: string;
  missingDocumentIds: string[];
  createdAt: string;
  availableActions: string[];
  timeline: ConcessionTimelineEvent[];
}

export interface ConcessionTimelineEvent {
  action: string;
  status: ConcessionRequestStatusEnum;
  actorId?: string | null;
  occurredAt: string;
  reason?: string | null;
  amount?: number | null;
}

export interface ConcessionRequestPreview {
  studentFeeStructureId: string;
  concessionPolicyId: string;
  concessionPolicyVersionId: string;
  concessionPolicyName: string;
  concessionPolicyCode: string;
  concessionPolicyVersion: number;
  applyOn: string;
  valueSource: string;
  calculationMethod: string;
  maximumPercentage?: number | null;
  maximumFixedAmount?: number | null;
  totalEligibleBase: number;
  totalConcessionAmount: number;
  netPayable: number;
  feeHeadConcessions: FeeHeadValueResult[];
  eligibleDueFees: ConcessionEligibleDueFee[];
  previewFingerprint: string;
  generatedAt: string;
}

export interface DueFeeApprovalLine extends ConcessionEligibleDueFee {
  concessionDueFeeAllocationId?: string | null;
  monthLabel: string;
  isSelectable: boolean;
  maxConcessionAmount: number;
  suggestedConcessionAmount: number;
  appliedConcessionAmount: number;
  reversedConcessionAmount: number;
  reversibleConcessionAmount: number;
}

export interface FeeHeadApprovalGroup {
  feeHeadId: string;
  feeHeadName: string;
  requestedConcessionAmount: number;
  liveMaximumConcessionAmount: number;
  suggestedConcessionAmount: number;
  hasChangedSinceSubmission: boolean;
  dueFeeLines: DueFeeApprovalLine[];
}

export interface ConcessionApprovalContext {
  concessionRequestId: string;
  studentId: string;
  concessionPolicyName: string;
  concessionPolicyCode: string;
  concessionPolicyVersion: number;
  requestConcurrencyStamp: string;
  totalRequestedConcessionAmount: number;
  totalLiveMaximumConcessionAmount: number;
  hasChangedSinceSubmission: boolean;
  previewFingerprint: string;
  feeHeadGroups: FeeHeadApprovalGroup[];
}

export interface ApproveConcessionCommand {
  message?: string;
  requestConcurrencyStamp: string;
  previewFingerprint: string;
  idempotencyKey: string;
  feeHeadApprovals?: Array<{
    feeHeadId: string;
    approvedConcessionAmount: number;
    dueFeeAllocations: Array<{
      dueFeeId: string;
      concessionAmount: number;
      concurrencyStamp: string;
    }>;
  }>;
}

export type PreviewConcessionApprovalCommand = Pick<
  ApproveConcessionCommand,
  'requestConcurrencyStamp' | 'previewFingerprint' | 'feeHeadApprovals'
>;

export interface ConcessionApprovalPreview {
  autoCreateRefund: boolean;
  concessionRequestId: string;
  requestConcurrencyStamp: string;
  previewFingerprint: string;
  totalApprovedAmount: number;
  refundRequestAmount: number;
  dueFeeAllocations: Array<{
    dueFeeId: string;
    feeHeadId: string;
    month: number;
    year: number;
    concessionAmount: number;
  }>;
}

export interface ConcessionApprovalResponse {
  concessionRequestId: string;
  totalApprovedAmount: number;
  refundRequests: Array<{
    refundRequestId: string;
    voucherNumber: string;
    originalReceiptId: string;
    amount: number;
    status: string;
  }>;
}

export interface RejectConcessionCommand {
  message: string;
  requestConcurrencyStamp: string;
  idempotencyKey: string;
}

export interface ReverseConcessionCommand {
  reason: string;
  requestConcurrencyStamp: string;
  idempotencyKey: string;
  lines: Array<{
    concessionDueFeeAllocationId: string;
    amount: number;
    concurrencyStamp: string;
  }>;
}

export interface ConcessionReversalPreview {
  concessionRequestId: string;
  requestConcurrencyStamp: string;
  totalApprovedAmount: number;
  totalPreviouslyReversedAmount: number;
  totalReversalAmount: number;
  netApprovedAfterReversal: number;
  lines: Array<{
    concessionDueFeeAllocationId: string;
    dueFeeId: string;
    feeHeadId: string;
    reversalAmount: number;
    outstandingBefore: number;
    outstandingAfter: number;
  }>;
}
