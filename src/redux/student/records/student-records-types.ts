export type RecordsChangeAction =
  | 'Identity'
  | 'Contact'
  | 'Guardian'
  | 'Medical'
  | 'Bank'
  | 'Additional'
  | 'PreviousSchool'
  | 'Placement'
  | 'Status'
  | 'Correction'
  | 'LegacyOverride'
  | 'Photo';
export type RecordsOutcome =
  'Promote' | 'Repeat' | 'Hold' | 'Graduate' | 'Withdraw' | 'Transfer' | 'Return';
export type RecordsFieldGroup = 'Identity' | 'Contact' | 'Medical' | 'Bank' | 'Guardian';
export type RecordsCertificateType = 'Bonafide' | 'Character' | 'Leaving' | 'FirstTrial';
export type RecordsReturnRoute = 'ReuseProfile' | 'FreshApplication' | 'ResumeStage';
export type RecordsChangeRule = {
  mode: 'Direct' | 'Approval';
  requireReason: boolean;
  stages: { roleNames: string[] }[];
  condition?: {
    isPastDated?: boolean | null;
    isFutureDated?: boolean | null;
    isFormerStudent?: boolean | null;
  } | null;
};
export type RecordsOutcomeChecks = {
  requireAcademicResult: boolean;
  requireFinanceClearance: boolean;
  requireLibraryClearance: boolean;
  requireTransportClearance: boolean;
};
export type StudentRecordsPolicy = {
  schemaVersion: number;
  changes: Record<RecordsChangeAction, RecordsChangeRule>;
  provisioning: { mode: 'OnboardingOnly' | 'Summary' | 'Full'; allowPlacementEdits: boolean };
  access: { masks: { fieldGroup: RecordsFieldGroup; allowedRoleNames: string[] }[] };
  guardianAccess: { onApprovedChange: 'SuspendUntilReview' | 'KeepUntilReview' };
  documents: {
    enabledCertificateTypes: RecordsCertificateType[];
    certificateNumberPrefix: string;
    idNumberPrefix: string;
    leavingCertificateStage: 'ApprovedExit' | 'EffectiveExit';
  };
  transitions: {
    outcomeChecks: Record<RecordsOutcome, RecordsOutcomeChecks>;
    allowPastDates: boolean;
    maxPastDays: number;
    allowFutureDates: boolean;
    maxFutureDays: number;
    rosterRemovalTiming: 'Approval' | 'EffectiveDate';
    allowedReturnRoutes: RecordsReturnRoute[];
    defaultReturnRoute: RecordsReturnRoute;
    annualRenewalMode: 'DirectEnrollment' | 'ShortChecklist';
    batchExceptionMode: 'ReadyOnly' | 'HoldAll';
  };
};
export type StudentRecordsSettings = {
  id?: string | null;
  academicYearId?: string | null;
  concurrencyStamp?: string | null;
  draftPolicy: StudentRecordsPolicy;
  effectivePolicy: StudentRecordsPolicy;
  publishedVersionId?: string | null;
  publishedVersionNumber: number;
  isStarter: boolean;
  effectiveScopeAcademicYearId?: string | null;
};
export type SaveRecordsDraft = {
  academicYearId?: string | null;
  concurrencyStamp?: string | null;
  policy: StudentRecordsPolicy;
};
export type RecordsPolicyPreview = { policy: StudentRecordsPolicy; summary: string[] };
export type StudentDirectoryInput = {
  skipCount?: number;
  maxResultCount?: number;
  search?: string;
  sorting?: string;
  population?: 'All' | 'Active' | 'Former';
  academicYearId?: string;
  studentId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  divisionId?: string;
  boardIds?: string[];
  mediumIds?: string[];
  standardIds?: string[];
  divisionIds?: string[];
};
export type StudentDirectoryOption = { id: string; name: string; parentId?: string | null };
export type StudentDirectoryOptions = {
  academicYears: StudentDirectoryOption[];
  boards: StudentDirectoryOption[];
  mediums: StudentDirectoryOption[];
  standards: StudentDirectoryOption[];
  divisions: StudentDirectoryOption[];
};
export type StudentDirectoryItem = {
  id: string;
  studentId: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  grNumber?: string | null;
  grNo?: number | null;
  rollNo?: number | null;
  status: number | string;
  academicYearId?: string | null;
  standardId?: string | null;
  standardName?: string | null;
  divisionId?: string | null;
  divisionName?: string | null;
  academicMediumId?: string | null;
  academicMediumName?: string | null;
  entrySource:
    'ActivatedOnboarding' | 'CompletedOnboarding' | 'LegacyOverride' | 'LegacyNeedsApproval';
  hasPhoto: boolean;
  maskedFields: string[];
};
export type RecordsPage<T> = { items: T[]; totalCount: number };
export type RecordsLegacyOverride = {
  id: string;
  studentId: string;
  requestedByUserId: string;
  decidedByUserId?: string | null;
  reason: string;
  evidenceReference?: string | null;
  status: string;
  creationTime: string;
  concurrencyStamp?: string | null;
};
