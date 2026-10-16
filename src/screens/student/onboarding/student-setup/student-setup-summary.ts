import type { LabelColor } from 'src/components/label';

import {
  hasAssignedDivision,
  hasAssignedGrNumber,
  hasAssignedRollNumber,
  type StudentSetupView,
} from './student-setup-view';

import type {
  OnboardingItemStatus,
  StudentOnboardingItem,
  OnboardingChecklistItem,
} from './student-onboarding-model';

export type StudentPendingTask = {
  key: string;
  label: string;
  view: StudentSetupView;
  actionLabel: string;
};

export type StudentSetupSummary = {
  pendingText: string;
  status: { label: string; color: LabelColor };
  action: { label: string; view?: StudentSetupView; primary: boolean };
};

export const studentSetupStatusMeta: Record<OnboardingItemStatus, StudentSetupSummary['status']> = {
  'to-prepare': { label: 'Setup pending', color: 'warning' },
  'awaiting-approval': { label: 'In progress', color: 'info' },
  'ready-to-activate': { label: 'Ready to activate', color: 'success' },
  'action-required': { label: 'Needs attention', color: 'error' },
  provisioning: { label: 'Finishing setup', color: 'info' },
  completed: { label: 'Setup complete', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

// Keep existing task destinations, including the legacy combined finance/accounts check.
export const pendingTaskView = (key: string): StudentSetupView => {
  if (key.includes('document')) return 'readiness';
  if (key.includes('fee') || key.includes('finance')) return 'fees';
  if (key.includes('account') || key.includes('credential')) return 'credentials';
  if (key.includes('roll')) return 'roll-number';
  if (key.includes('gr')) return 'gr-number';
  if (key.includes('placement') || key.includes('division')) return 'division';
  return 'readiness';
};

const describePendingTask = (
  item: OnboardingChecklistItem,
  student: StudentOnboardingItem
): StudentPendingTask => {
  const view = pendingTaskView(item.key);
  const task = { key: item.key, label: item.label, view, actionLabel: 'Review setup' };

  switch (item.key) {
    case 'documents':
      return { ...task, label: 'Documents need checking', actionLabel: 'Review documents' };
    case 'gr_number':
    case 'gr-number':
      return {
        ...task,
        label: hasAssignedGrNumber(student) ? 'GR no. needs checking' : 'GR no. not assigned',
        actionLabel: hasAssignedGrNumber(student) ? 'Review GR no.' : 'Assign GR no.',
      };
    case 'roll_number':
    case 'roll-number':
      return {
        ...task,
        label: hasAssignedRollNumber(student) ? 'Roll no. needs checking' : 'Roll no. not assigned',
        actionLabel: hasAssignedRollNumber(student) ? 'Review roll no.' : 'Assign roll no.',
      };
    case 'placement':
    case 'placement_seat':
    case 'division':
      return {
        ...task,
        label: hasAssignedDivision(student)
          ? 'Class and division need checking'
          : 'Division not assigned',
        actionLabel: hasAssignedDivision(student) ? 'Review division' : 'Assign division',
      };
    case 'accounts':
    case 'student-account':
    case 'guardian-account':
    case 'credentials':
      return { ...task, label: 'App login needs setup', actionLabel: 'Open App Login' };
    case 'finance_accounts_services':
      return {
        ...task,
        label: 'Fees, app access and services need checking',
        actionLabel: 'Open Fees',
      };
    case 'fee_structure':
      return { ...task, label: 'Fee structure needs checking', actionLabel: 'Open Fees' };
    case 'identity':
      return { ...task, label: 'Student details need checking' };
    case 'family':
      return { ...task, label: 'Parent or guardian details need checking' };
    case 'communication':
      return { ...task, label: 'Contact details need checking' };
    case 'medical_previous_school':
      return { ...task, label: 'Medical or previous-school details need checking' };
    case 'approval_review':
      return { ...task, label: 'Approval needs checking' };
    case 'admission_confirmed':
    case 'admission':
      return { ...task, label: 'Admission needs checking' };
    default:
      return task;
  }
};

export const getStudentPendingTasks = (student: StudentOnboardingItem): StudentPendingTask[] => {
  const pending = student.readinessItems.filter(
    (item) =>
      ['pending', 'failed', 'not-connected'].includes(item.status) && item.key !== 'final_readiness'
  );
  const tasks = pending.flatMap((item) => {
    if (item.key === 'identifier' || item.key.includes('identifiers')) {
      const missingIdentifiers = [
        ...(!hasAssignedGrNumber(student) ? [{ ...item, key: 'gr_number' }] : []),
        ...(!hasAssignedRollNumber(student) ? [{ ...item, key: 'roll_number' }] : []),
      ];
      // An assigned identifier may still fail validation; keep that server check visible.
      if (missingIdentifiers.length) {
        return missingIdentifiers.map((check) => describePendingTask(check, student));
      }
    }
    return [describePendingTask(item, student)];
  });

  if (
    student.studentEnrollmentId &&
    student.credentialsPending &&
    !tasks.some((task) => task.view === 'credentials')
  ) {
    tasks.push({
      key: 'credentials',
      label: 'App login needs setup',
      view: 'credentials',
      actionLabel: 'Open App Login',
    });
  }

  return tasks;
};

export const getStudentSetupSummary = (student: StudentOnboardingItem): StudentSetupSummary => {
  const tasks = getStudentPendingTasks(student);
  const status = studentSetupStatusMeta[student.status];
  const pendingText = tasks.length
    ? tasks.map((task) => task.label).join('; ')
    : student.status === 'completed'
      ? 'No pending work'
      : student.status === 'ready-to-activate'
        ? 'Ready for activation review'
        : student.status === 'cancelled'
          ? 'Setup cancelled'
          : student.status === 'provisioning'
            ? 'Completion check pending'
            : 'Review student setup';
  const result = (action: StudentSetupSummary['action']): StudentSetupSummary => ({
    pendingText,
    status,
    action,
  });

  if (student.status === 'cancelled') {
    return result({ label: 'View details', primary: false });
  }

  if (student.status === 'completed') {
    const credentials = tasks.find((task) => task.view === 'credentials');
    return result(
      credentials
        ? { label: 'Open App Login', view: 'credentials', primary: false }
        : { label: 'View details', primary: false }
    );
  }

  if (
    student.status === 'ready-to-activate' &&
    student.source === 'onboarding-case' &&
    !student.studentEnrollmentId
  ) {
    return result({ label: 'Review & activate', primary: true });
  }

  if (tasks.length) {
    return result({ label: tasks[0].actionLabel, view: tasks[0].view, primary: false });
  }

  return result({
    label:
      student.studentEnrollmentId || student.status === 'provisioning'
        ? 'Check completion'
        : 'Review setup',
    primary: false,
  });
};
