import type { LabelColor } from 'src/components/label';
import type { StudentLookupItem } from 'src/redux/student';
import type {
  StudentOnboardingCase,
  StudentOnboardingStepStatus,
} from 'src/redux/student/onboarding/student-onboarding-types';

import type { AcademicPathContext, ReadinessAccessRules } from '../onboarding-settings-model';

export type OnboardingStage =
  | 'all'
  | 'to-prepare'
  | 'awaiting-approval'
  | 'ready-to-activate'
  | 'action-required'
  | 'provisioning'
  | 'completed'
  | 'cancelled';

export type OnboardingItemStatus = Exclude<OnboardingStage, 'all'>;

export type OnboardingCheckStatus =
  'passed' | 'pending' | 'failed' | 'not-required' | 'not-connected';

export type OnboardingChecklistItem = {
  key: string;
  label: string;
  detail: string;
  status: OnboardingCheckStatus;
  blocking: boolean;
  owner: string;
};

export type OnboardingActivityItem = {
  id: string;
  title: string;
  detail: string;
  occurredAt: string;
};

export type OnboardingAccountStatus = 'ready' | 'pending' | 'not-required' | 'not-connected';

export type DivisionPlacementOption = {
  divisionName: string;
  currentStudentCount: number;
  capacity: number | null;
};

export type StudentOnboardingItem = {
  id: string;
  studentId?: string | null;
  studentName: string;
  applicationNumber: string;
  admissionReference?: string | null;
  admissionRoute: string;
  admissionDate?: string | null;
  ownerName: string;
  assignedToUserId?: string | null;
  boardId?: string | null;
  campusId?: string | null;
  boardName: string;
  academicMediumId?: string | null;
  mediumName: string;
  academicMediumStageId?: string | null;
  standardId?: string | null;
  standardName: string;
  divisionId?: string | null;
  divisionName: string;
  grNo?: string | number | null;
  grPreview?: string | null;
  rollNo?: number | null;
  rollAssignmentMode?: 'manual' | 'automatic' | 'both';
  rollNumberLocked?: boolean;
  grNumberLocked?: boolean;
  grManualEntryAllowed?: boolean;
  rollChangeReasonRequired?: boolean;
  feeStructureConfirmed?: boolean;
  credentialsPending?: boolean;
  hasDocumentRequirementsSnapshot?: boolean;
  preferredDivisionName?: string | null;
  divisionPlacementOptions?: DivisionPlacementOption[];
  status: OnboardingItemStatus;
  documentsPassed: number;
  documentsRequired: number;
  studentAccountStatus: OnboardingAccountStatus;
  guardianAccountStatus: OnboardingAccountStatus;
  readinessItems: OnboardingChecklistItem[];
  activity: OnboardingActivityItem[];
  updatedAt: string;
  source: 'onboarding-case' | 'student-records';
  concurrencyStamp?: string | null;
  backendStatus?: StudentOnboardingCase['status'];
  primaryBlocker?: string | null;
  dueAt?: string | null;
  isOverdue?: boolean;
  documentUploadsEnabled?: boolean;
  studentEnrollmentId?: string | null;
};

export const getStudentAcademicPathContext = (
  student: StudentOnboardingItem
): AcademicPathContext => ({
  campusId: student.campusId,
  boardId: student.boardId,
  academicMediumId: student.academicMediumId,
  academicMediumStageId: student.academicMediumStageId,
  standardId: student.standardId,
  divisionId: student.divisionId,
});

export const onboardingStageMeta: Record<
  OnboardingStage,
  { label: string; icon: string; color: LabelColor }
> = {
  all: { label: 'All', icon: 'mdi:format-list-bulleted', color: 'default' },
  provisioning: { label: 'Provisioning', icon: 'mdi:progress-clock', color: 'info' },
  'to-prepare': { label: 'To Prepare', icon: 'mdi:clipboard-edit-outline', color: 'warning' },
  'awaiting-approval': {
    label: 'In Progress',
    icon: 'mdi:account-clock-outline',
    color: 'info',
  },
  'ready-to-activate': {
    label: 'Ready to Activate',
    icon: 'mdi:account-check-outline',
    color: 'success',
  },
  'action-required': {
    label: 'Action Required',
    icon: 'mdi:alert-circle-outline',
    color: 'error',
  },
  completed: { label: 'Completed', icon: 'mdi:check-decagram-outline', color: 'success' },
  cancelled: { label: 'Cancelled', icon: 'mdi:cancel', color: 'default' },
};

export const onboardingStageOptions = (
  Object.entries(onboardingStageMeta) as Array<
    [OnboardingStage, (typeof onboardingStageMeta)[OnboardingStage]]
  >
).map(([value, meta]) => ({ value, ...meta }));

export const onboardingCheckMeta: Record<
  OnboardingCheckStatus,
  { label: string; color: LabelColor; icon: string }
> = {
  passed: { label: 'Passed', color: 'success', icon: 'mdi:check-circle-outline' },
  pending: { label: 'Pending', color: 'warning', icon: 'mdi:clock-outline' },
  failed: { label: 'Failed', color: 'error', icon: 'mdi:alert-circle-outline' },
  'not-required': { label: 'Not required', color: 'default', icon: 'mdi:minus-circle-outline' },
  'not-connected': {
    label: 'Not connected',
    color: 'default',
    icon: 'mdi:connection',
  },
};

export const accountStatusMeta: Record<
  OnboardingAccountStatus,
  { label: string; color: LabelColor }
> = {
  ready: { label: 'Ready', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  'not-required': { label: 'Not required', color: 'default' },
  'not-connected': { label: 'Not connected', color: 'default' },
};

export const getReadinessSummary = (item: StudentOnboardingItem) => {
  const requiredItems = item.readinessItems.filter((check) => check.status !== 'not-required');
  const passedCount = requiredItems.filter((check) => check.status === 'passed').length;
  const blockingCount = requiredItems.filter(
    (check) => check.blocking && ['failed', 'pending', 'not-connected'].includes(check.status)
  ).length;
  const connectedCount = requiredItems.filter((check) => check.status !== 'not-connected').length;

  return {
    passedCount,
    requiredCount: requiredItems.length,
    blockingCount,
    connectedCount,
    progress: requiredItems.length ? Math.round((passedCount / requiredItems.length) * 100) : 0,
  };
};

export const applyReadinessAccessRules = (
  item: StudentOnboardingItem,
  rules: ReadinessAccessRules
): StudentOnboardingItem => {
  const accountsRequired = rules.studentAccount || rules.guardianAccount;
  const readinessItems = item.readinessItems.map((check) => {
    const isIdentifierCheck = ['identifier', 'gr-number', 'roll-number'].includes(check.key);
    const matrixKey = isIdentifierCheck ? 'identifier' : check.key;
    const matrixRule = rules.checks.find((rule) => rule.key === matrixKey);
    const allowedByLegacyRule =
      (!isIdentifierCheck || rules.requireIdentifiers) &&
      (check.key !== 'documents' || rules.requireDocuments) &&
      (check.key !== 'accounts' || accountsRequired);
    const isRequired = allowedByLegacyRule && (matrixRule?.required ?? true);

    if (!isRequired) {
      return {
        ...check,
        detail: `${matrixRule?.label ?? check.label} is optional for the applied onboarding profile.`,
        status: 'not-required' as const,
        blocking: false,
        owner: matrixRule?.owner ?? check.owner,
      };
    }

    return {
      ...check,
      blocking: matrixRule?.blocking ?? check.blocking,
      owner: matrixRule?.owner ?? check.owner,
    };
  });

  return {
    ...item,
    documentsPassed: rules.requireDocuments ? item.documentsPassed : 0,
    documentsRequired: rules.requireDocuments ? item.documentsRequired : 0,
    studentAccountStatus: rules.studentAccount ? item.studentAccountStatus : 'not-required',
    guardianAccountStatus: rules.guardianAccount ? item.guardianAccountStatus : 'not-required',
    readinessItems,
  };
};

const buildCompatibilityChecks = (student: StudentLookupItem): OnboardingChecklistItem[] => [
  {
    key: 'gr-number',
    label: 'GR number',
    detail:
      student.grNo !== undefined && student.grNo !== null
        ? 'A GR number is available in Student Records.'
        : 'GR number is pending.',
    status: student.grNo !== undefined && student.grNo !== null ? 'passed' : 'pending',
    blocking: true,
    owner: 'Onboarding',
  },
  {
    key: 'roll-number',
    label: 'Roll number',
    detail:
      student.rollNo !== undefined && student.rollNo !== null
        ? 'A roll number is available in Student Records.'
        : 'Roll number is pending.',
    status: student.rollNo !== undefined && student.rollNo !== null ? 'passed' : 'pending',
    blocking: true,
    owner: 'Onboarding',
  },
  {
    key: 'documents',
    label: 'Documents',
    detail: 'Document readiness requires the Onboarding worklist contract.',
    status: 'not-connected',
    blocking: true,
    owner: 'Enrollment Documents',
  },
  {
    key: 'accounts',
    label: 'Accounts & access',
    detail: 'Account provisioning requires the identity and portal contract.',
    status: 'not-connected',
    blocking: true,
    owner: 'Identity & Portal',
  },
];

export const mapStudentLookupToOnboardingItem = (
  student: StudentLookupItem,
  context?: {
    boardId?: string | null;
    boardName?: string | null;
    academicMediumId?: string | null;
    mediumName?: string | null;
    academicMediumStageId?: string | null;
  }
): StudentOnboardingItem => ({
  id: student.studentId,
  studentId: student.studentId,
  studentName: student.studentName,
  applicationNumber: 'Not available',
  admissionReference: null,
  admissionRoute: 'Existing student record',
  admissionDate: null,
  ownerName: 'Not assigned',
  boardId: context?.boardId ?? null,
  boardName: context?.boardName || 'Selected board',
  academicMediumId: context?.academicMediumId ?? null,
  mediumName: context?.mediumName || 'Selected medium',
  academicMediumStageId: context?.academicMediumStageId ?? null,
  standardId: student.standardId ?? null,
  standardName: student.standardName || '—',
  divisionId: student.divisionId ?? null,
  divisionName: student.divisionName || '—',
  grNo: student.grNo,
  grPreview: null,
  rollNo: student.rollNo,
  status: 'to-prepare',
  documentsPassed: 0,
  documentsRequired: 0,
  studentAccountStatus: 'not-connected',
  guardianAccountStatus: 'not-connected',
  readinessItems: buildCompatibilityChecks(student),
  activity: [
    {
      id: `${student.studentId}-compatibility`,
      title: 'Loaded from Student Records',
      detail: 'Onboarding lifecycle information is not available from the current lookup API.',
      occurredAt: 'Current session',
    },
  ],
  updatedAt: 'Current session',
  source: 'student-records',
});

export const onboardingCaseStage: Record<StudentOnboardingCase['status'], OnboardingItemStatus> = {
  0: 'to-prepare',
  1: 'awaiting-approval',
  2: 'ready-to-activate',
  3: 'action-required',
  4: 'completed',
  5: 'cancelled',
  6: 'provisioning',
};

const onboardingStepStatus: Record<StudentOnboardingStepStatus, OnboardingCheckStatus> = {
  0: 'pending',
  1: 'pending',
  2: 'passed',
  3: 'failed',
  4: 'not-required',
  5: 'not-required',
};

const systemStepFallbackDetails: Record<string, string> = {
  approval_review: 'Review the current requirements and record an approval note.',
  final_readiness:
    'This is completed automatically when activation validates every required check.',
};

export const mapOnboardingCaseToItem = (
  onboardingCase: StudentOnboardingCase
): StudentOnboardingItem => {
  const documentStep = onboardingCase.steps.find((step) => step.key === 'documents');
  const documentPassed = documentStep?.status === 2 || documentStep?.status === 4;
  const accountStatus = (
    required: boolean | undefined,
    status: number | null | undefined
  ): OnboardingAccountStatus => {
    if (required === undefined) return 'not-connected';
    if (!required) return 'not-required';
    return status === 2 ? 'ready' : 'pending';
  };

  return {
    id: onboardingCase.id,
    studentId: onboardingCase.studentId,
    studentName: onboardingCase.studentName,
    applicationNumber: onboardingCase.applicationNumber,
    admissionReference: onboardingCase.offeringCode,
    admissionRoute: onboardingCase.isHistoricalBackfill
      ? 'Historical admission backfill'
      : (onboardingCase.admissionRoute ?? 'Fresh admission'),
    admissionDate: onboardingCase.creationTime ?? null,
    ownerName: onboardingCase.assignedToUserName || 'Not assigned',
    assignedToUserId: onboardingCase.assignedToUserId ?? null,
    boardId: onboardingCase.intendedBoardId,
    campusId: onboardingCase.campusId ?? null,
    boardName: onboardingCase.intendedBoardName || 'Not available',
    academicMediumId: onboardingCase.intendedMediumId,
    mediumName: onboardingCase.intendedMediumName || 'Not available',
    academicMediumStageId: onboardingCase.intendedStageId,
    standardId: onboardingCase.intendedStandardId,
    standardName: onboardingCase.intendedStandardName,
    divisionId: onboardingCase.divisionId ?? null,
    divisionName: onboardingCase.divisionName || 'Pending',
    grNo: onboardingCase.grNumber ?? null,
    grPreview: null,
    rollNo: onboardingCase.rollNumber ?? null,
    rollAssignmentMode: onboardingCase.rollAssignmentMode,
    rollNumberLocked: onboardingCase.rollNumberLocked ?? false,
    grNumberLocked: onboardingCase.grNumberLocked ?? false,
    grManualEntryAllowed: onboardingCase.grManualEntryAllowed ?? false,
    rollChangeReasonRequired: onboardingCase.rollChangeReasonRequired ?? false,
    feeStructureConfirmed: onboardingCase.feeStructureConfirmed ?? false,
    credentialsPending: onboardingCase.credentialsPending,
    hasDocumentRequirementsSnapshot: onboardingCase.hasDocumentRequirementsSnapshot,
    status: onboardingCaseStage[onboardingCase.status],
    documentsPassed: documentPassed ? 1 : 0,
    documentsRequired: documentStep?.required ? 1 : 0,
    studentAccountStatus: accountStatus(
      onboardingCase.studentAccountRequired,
      onboardingCase.studentAccountStatus
    ),
    guardianAccountStatus: accountStatus(
      onboardingCase.guardianAccountRequired,
      onboardingCase.guardianAccountStatus
    ),
    readinessItems: [
      ...(onboardingCase.hasDocumentRequirementsSnapshot &&
      onboardingCase.admissionConfirmed !== undefined
        ? [
            {
              key: 'admission_confirmed',
              label: 'Admission confirmed',
              detail: onboardingCase.admissionConfirmed
                ? 'Admission finalization is confirmed.'
                : 'Admission must be finalized before activation.',
              status: onboardingCase.admissionConfirmed ? ('passed' as const) : ('failed' as const),
              blocking: !onboardingCase.admissionConfirmed,
              owner: 'Admission team',
            },
          ]
        : []),
      ...onboardingCase.steps.flatMap((step) => {
        // Final readiness summarizes these tasks and is completed by activation, not by staff.
        if (step.key === 'final_readiness') return [];
        const check = {
          key: step.key,
          label: step.label,
          detail:
            step.detail ||
            (step.waiverReason
              ? `Waived: ${step.waiverReason}`
              : systemStepFallbackDetails[step.key] || 'No additional detail available.'),
          status: onboardingStepStatus[step.status],
          blocking:
            step.key !== 'final_readiness' && step.required && ![2, 4, 5].includes(step.status),
          owner: onboardingCase.assignedToUserName || 'Onboarding',
        };
        if (!step.key.includes('identifiers')) return [check];
        return [
          { key: 'gr_number', label: 'GR number', assigned: Boolean(onboardingCase.grNumber) },
          {
            key: 'roll_number',
            label: 'Roll number',
            assigned: Boolean(onboardingCase.rollNumber),
          },
        ].map((identifier) => ({
          ...check,
          key: identifier.key,
          label: identifier.label,
          status:
            identifier.assigned && step.status !== 3
              ? ('passed' as const)
              : identifier.assigned
                ? ('failed' as const)
                : ('pending' as const),
          blocking: step.required && (!identifier.assigned || step.status === 3),
        }));
      }),
    ],
    activity: onboardingCase.events.map((event) => ({
      id: event.id,
      title: event.eventType,
      detail: event.description,
      occurredAt: event.occurredAt,
    })),
    updatedAt:
      onboardingCase.lastModificationTime ||
      onboardingCase.creationTime ||
      onboardingCase.startedAt ||
      'Not available',
    source: 'onboarding-case',
    concurrencyStamp: onboardingCase.concurrencyStamp,
    backendStatus: onboardingCase.status,
    primaryBlocker: onboardingCase.primaryBlocker,
    dueAt: onboardingCase.dueAt,
    isOverdue: onboardingCase.isOverdue,
    documentUploadsEnabled: onboardingCase.documentUploadsEnabled,
    studentEnrollmentId: onboardingCase.studentEnrollmentId,
  };
};
