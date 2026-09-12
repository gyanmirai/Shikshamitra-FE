import type { LabelColor } from 'src/components/label';
import type { StudentLookupItem } from 'src/redux/student';

import type { ReadinessAccessRules } from '../onboarding-settings-model';

export type OnboardingStage =
  | 'all'
  | 'to-prepare'
  | 'awaiting-approval'
  | 'ready-to-activate'
  | 'action-required'
  | 'completed';

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
  boardId?: string | null;
  boardName: string;
  mediumName: string;
  standardId?: string | null;
  standardName: string;
  divisionName: string;
  grNo?: string | number | null;
  grPreview?: string | null;
  rollNo?: number | null;
  rollNumberLocked?: boolean;
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
  source: 'student-records' | 'preview';
};

export const onboardingStageMeta: Record<
  OnboardingStage,
  { label: string; icon: string; color: LabelColor }
> = {
  all: { label: 'All', icon: 'mdi:format-list-bulleted', color: 'default' },
  'to-prepare': { label: 'To Prepare', icon: 'mdi:clipboard-edit-outline', color: 'warning' },
  'awaiting-approval': {
    label: 'Awaiting Approval',
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
    owner: 'Student Onboarding',
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
    owner: 'Student Onboarding',
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
    mediumName?: string | null;
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
  mediumName: context?.mediumName || 'Selected medium',
  standardId: student.standardId ?? null,
  standardName: student.standardName || '—',
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
