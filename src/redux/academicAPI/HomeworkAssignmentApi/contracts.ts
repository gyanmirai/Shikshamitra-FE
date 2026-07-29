import type {
  AssignmentStatus,
  AssignmentTypeStatus,
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
} from 'src/enums/assignment';

export interface AssignmentTypeDto {
  id: string;
  academicMediumId: string;
  assignmentTypeName: string;
  description?: string | null;
  defaultSubmissionType?: AssignmentSubmissionType | null;
  defaultMarks?: number | null;
  defaultDueDays?: number | null;
  evaluationRequired: boolean;
  defaultEvaluationMethod?: AssignmentEvaluationMethod | null;
  status: AssignmentTypeStatus;
  usageCount: number;
}

export interface AssignmentTypeUpsertDto {
  assignmentTypeName: string;
  description: string | null;
  defaultSubmissionType: AssignmentSubmissionType | null;
  defaultMarks: number | null;
  defaultDueDays: number | null;
  evaluationRequired: boolean;
  defaultEvaluationMethod: AssignmentEvaluationMethod | null;
  status: AssignmentTypeStatus;
}

export interface AssignmentTypeListResponse {
  data: AssignmentTypeDto[];
}

export interface AssignmentTypeResponse {
  data: AssignmentTypeDto;
}

export interface AssignmentTypeCreateResponse extends AssignmentTypeResponse {
  message: string;
}

export interface MessageResponse {
  message?: string;
}

export interface AssignmentDivisionScheduleDto {
  divisionId: string;
  divisionName: string;
  publishAt?: string | null;
  dueAt: string;
  isPublished: boolean;
}

export interface AssignmentV2Dto {
  id: string;
  academicMediumId: string;
  academicYearId?: string | null;
  standardId: string;
  standardName: string;
  subjectId: string;
  subjectName: string;
  title: string;
  assignmentTypeId: string;
  assignmentTypeName: string;
  defaultSubmissionType?: AssignmentSubmissionType | null;
  defaultMarks?: number | null;
  defaultDueDays?: number | null;
  evaluationRequired: boolean;
  evaluationMethod?: AssignmentEvaluationMethod | null;
  defaultEvaluationMethod?: AssignmentEvaluationMethod | null;
  assignmentTypeStatus?: AssignmentTypeStatus | null;
  totalMarks: number;
  description: string;
  attachment?: string | null;
  submissionType: AssignmentSubmissionType;
  status: AssignmentStatus;
  chapterIds?: string[];
  divisionSchedules: AssignmentDivisionScheduleDto[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AssignmentV2ListResponse {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  items: AssignmentV2Dto[];
}

export interface AssignmentV2Response {
  data: AssignmentV2Dto;
}

export interface AssignmentV2CreateResponse extends AssignmentV2Response {
  message: string;
}

export interface GetAssignmentsParams {
  academicMediumId: string;
  StandardId?: string;
  DivisionId?: string;
  SubjectId?: string;
  AssignmentDate?: string;
  Page?: number;
  PageSize?: number;
  Search?: string;
}

export interface AssignmentMutationArgs {
  academicMediumId: string;
  body: FormData;
}

export interface UpdateAssignmentMutationArgs extends AssignmentMutationArgs {
  assignmentId: string;
}

export interface AssignmentStatusUpdateResponse {
  id: string;
  previousStatus: AssignmentStatus;
  currentStatus: AssignmentStatus;
  updatedAt: string;
  updatedBy: string;
}
