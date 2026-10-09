export type StudentOnboardingStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type StudentOnboardingStepStatus = 0 | 1 | 2 | 3 | 4 | 5;
export type StudentIdentifierType = 0 | 1 | 2 | 3 | 4;
export type StudentOnboardingServiceHandoffStatus = 0 | 1 | 2 | 3 | 4;

export type StudentOnboardingListInput = {
  search?: string;
  status?: StudentOnboardingStatus;
  studentNameFilter?: string;
  studentNameOperator?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
  ownerNameFilter?: string;
  ownerNameOperator?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
  rollNumberFilter?: number;
  rollNumberMin?: number;
  rollNumberMax?: number;
  rollNumberOperator?: 'equals' | 'greaterThan' | 'lessThan' | 'between';
  pendingTask?: 'gr-number' | 'roll-number' | 'division' | 'fees' | 'credentials';
  enteredToday?: boolean;
  placementDivisionId?: string;
  academicYearId?: string;
  boardId?: string;
  mediumId?: string;
  divisionId?: string;
  standardId?: string;
  standardIds?: string[];
  divisionIds?: string[];
  assignedToUserId?: string;
  overdueOnly?: boolean;
  unassignedOnly?: boolean;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
};

export type StudentOnboardingFilterOption = {
  id: string;
  name: string;
  parentId?: string | null;
};

export type StudentOnboardingFilterOptions = {
  canUnlockIdentifiers?: boolean;
  academicYears: StudentOnboardingFilterOption[];
  boards: StudentOnboardingFilterOption[];
  mediums: StudentOnboardingFilterOption[];
  standards: StudentOnboardingFilterOption[];
  divisions: StudentOnboardingFilterOption[];
};

export type StudentOnboardingAnalytics = {
  activeCases: number;
  pending: number;
  inProgress: number;
  readyForActivation: number;
  needsAttention: number;
  overdue: number;
  completed: number;
  cancelled: number;
};

export type StudentOnboardingStep = {
  id: string;
  key: string;
  label: string;
  displayOrder: number;
  required: boolean;
  status: StudentOnboardingStepStatus;
  detail?: string | null;
  completedByUserId?: string | null;
  completedAt?: string | null;
  waiverReason?: string | null;
};

export type StudentOnboardingEvent = {
  id: string;
  eventType: string;
  description: string;
  metadataJson?: string | null;
  actorUserId?: string | null;
  occurredAt: string;
};

export type StudentOnboardingCase = {
  admissionRoute?: string;
  capturedStudentFields?: Array<{ key: string; label: string; value: string }>;

  feeAssignmentConfirmed?: boolean | null;
  feeStructureConfirmed?: boolean;
  selectedFeeStructureId?: string | null;
  grNumberLocked?: boolean;
  grManualEntryAllowed?: boolean;
  requirementsNeedReview?: boolean;
  hasDocumentRequirementsSnapshot?: boolean;
  admissionConfirmed?: boolean;
  credentialsPending?: boolean;
  rollNumberLocked?: boolean;
  rollChangeReasonRequired?: boolean;
  firstPaymentConfirmed?: boolean | null;
  financeReadinessDetail?: string | null;
  studentAccountRequired?: boolean;
  guardianAccountRequired?: boolean;
  studentAccountStatus?: StudentOnboardingServiceHandoffStatus | null;
  guardianAccountStatus?: StudentOnboardingServiceHandoffStatus | null;
  id: string;
  documentUploadsEnabled: boolean;
  concurrencyStamp: string;
  applicationId: string;
  applicationNumber: string;
  applicantId: string;
  studentId: string;
  studentName: string;
  offeringId: string;
  offeringCode: string;
  campusId?: string | null;
  academicYearId: string;
  academicYearName: string;
  intendedBoardId: string;
  intendedBoardName?: string;
  intendedMediumId: string;
  intendedMediumName?: string;
  intendedStageId: string;
  intendedStandardId: string;
  intendedStandardName: string;
  status: StudentOnboardingStatus;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  dueAt: string;
  isHistoricalBackfill: boolean;
  divisionId?: string | null;
  divisionName?: string | null;
  seatReservationId?: string | null;
  grNumber?: string | null;
  rollNumber?: number | null;
  rollAssignmentMode?: 'manual' | 'automatic' | 'both';
  studentEnrollmentId?: string | null;
  startedAt?: string | null;
  readyAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  lastError?: string | null;
  primaryBlocker?: string | null;
  progressPercent: number;
  isOverdue: boolean;
  steps: StudentOnboardingStep[];
  events: StudentOnboardingEvent[];
  creationTime?: string;
  lastModificationTime?: string | null;
};

export type StudentOnboardingCasePage = {
  totalCount: number;
  items: StudentOnboardingCase[];
};

export type StudentOnboardingPlacementOption = {
  id: string;
  name: string;
  capacity: number;
  activeEnrollments: number;
  liveReservations: number;
  availableSeats: number;
  isFull: boolean;
};

export type StudentIdentifierSeries = {
  id: string;
  concurrencyStamp: string;
  academicYearId: string;
  standardId?: string | null;
  identifierType: StudentIdentifierType;
  code: string;
  name: string;
  prefix: string;
  suffix: string;
  padding: number;
  nextSequence: number;
  maximumSequence?: number | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  isActive: boolean;
  nextPreview: string;
};

export type StudentOnboardingServiceHandoff = {
  id: string;
  onboardingCaseId: string;
  serviceKey: string;
  required: boolean;
  status: StudentOnboardingServiceHandoffStatus;
  attemptCount: number;
  lastAttemptAt?: string | null;
  acknowledgedAt?: string | null;
  lastError?: string | null;
};

export type StudentOnboardingPolicy = {
  id: string;
  concurrencyStamp: string;
  academicYearId: string;
  offeringId?: string | null;
  standardId?: string | null;
  name: string;
  requireDocuments: boolean;
  requireFamilyDetails: boolean;
  requireCommunicationDetails: boolean;
  requireMedicalDetails: boolean;
  requireFeeClearance: boolean;
  requireStudentAccount: boolean;
  requireGuardianAccount: boolean;
  requireServiceConsent: boolean;
  seatReservationMinutes: number;
  slaHours: number;
  isActive: boolean;
};

export type UpsertStudentOnboardingPolicy = Omit<
  StudentOnboardingPolicy,
  'id' | 'concurrencyStamp'
> & {
  concurrencyStamp?: string | null;
};

export type StudentOnboardingSettingsRecord = {
  id: string;
  concurrencyStamp: string;
  academicYearId?: string | null;
  schemaVersion: number;
  configurationJson: string;
};

export type SaveStudentOnboardingSettings = Omit<
  StudentOnboardingSettingsRecord,
  'id' | 'concurrencyStamp'
> & {
  concurrencyStamp?: string | null;
};

export type CreateStudentIdentifierSeries = {
  academicYearId: string;
  standardId?: string | null;
  identifierType: StudentIdentifierType;
  code: string;
  name: string;
  prefix: string;
  suffix: string;
  padding: number;
  startingSequence: number;
  maximumSequence?: number | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
};

export type HistoricalAdmissionReconciliation = {
  totalHistoricalApplications: number;
  alreadyLinked: number;
  readyToBackfill: number;
  backfilled: number;
  invalid: number;
  issues: {
    applicationId: string;
    applicationNumber: string;
    reason: string;
  }[];
};

export type StudentOnboardingDocuments = {
  caseId: string;
  studentId: string;
  concurrencyStamp: string;
  canUpload: boolean;
  canOverride?: boolean;
  documents: {
    documentTypeId: string;
    name: string;
    isRequired: boolean;
    maxSizeMb: number;
    allowedExtensions: string[];
    studentDocumentId?: string | null;
    fileName?: string | null;
    hasStudentUpload: boolean;
    isValidated?: boolean;
    isOverridden?: boolean;
    overrideReason?: string | null;
    hasAcceptedAdmissionEvidence: boolean;
  }[];
};

export type StudentCredentialEmail = {
  id: string;
  accountType: 'student' | 'guardian';
  email: string;
  status: 'NotRequested' | 'Pending' | 'Sent' | 'Failed' | 'Cancelled' | 'Blocked';
  message?: string | null;
  sentAt?: string | null;
  attemptCount: number;
  emailEnabled?: boolean;
  canSend?: boolean;
};
