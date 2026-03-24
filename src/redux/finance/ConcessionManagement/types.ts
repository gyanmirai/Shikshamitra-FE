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
  DRAFT = 0,
  IN_PROGRESS = 1,
  SUBMITTED = 2,
  APPROVED = 3,
  REJECTED = 4,
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
  concessionRequestId: string;
  studentName: string;
  rollNo: string;
  grNumber: string;
  standardName: string;
  divisionName: string;
  email: string;
  contactNo: string;
  totalConcessionApplication: number;
}

export interface ConcessionApplicationsResponse {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
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
