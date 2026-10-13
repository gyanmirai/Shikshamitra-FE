import type {
  StudentOnboardingCase,
  StudentIdentifierSeries,
} from 'src/redux/student/onboarding/student-onboarding-types';
import type {
  studentOnboardingApi,
  StudentOnboardingRollPreview,
} from 'src/redux/student/onboarding/student-onboarding-api';

import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { mapOnboardingCaseToItem, type StudentOnboardingItem } from './student-onboarding-model';

import type { AssignmentModePolicy } from '../onboarding-settings-model';

export type StudentSetupAssignmentType = 'gr-number' | 'roll-number' | 'division';
export type StudentSetupAssignmentMode = 'automatic' | 'manual';
export type StudentSetupAssignmentValue = string | number | null;

export type StudentSetupAssignmentItem = {
  student: StudentOnboardingItem;
  value?: StudentSetupAssignmentValue;
  baselineValue: StudentSetupAssignmentValue;
  reason?: string;
};

type AssignmentEndpoint =
  | 'assignStudentOnboardingGr'
  | 'previewStudentOnboardingRoll'
  | 'assignStudentOnboardingRoll'
  | 'setStudentOnboardingPlacement';

type EndpointInput<K extends AssignmentEndpoint> = Parameters<
  (typeof studentOnboardingApi.endpoints)[K]['initiate']
>[0];

export type StudentSetupAssignmentServices = {
  /** Must request current server data, rather than a previously cached case. */
  getCase: (id: string) => Promise<StudentOnboardingCase>;
  getSeries: (id: string) => Promise<StudentIdentifierSeries[]>;
  assignGr: (input: EndpointInput<'assignStudentOnboardingGr'>) => Promise<StudentOnboardingCase>;
  previewRoll: (
    input: EndpointInput<'previewStudentOnboardingRoll'>
  ) => Promise<StudentOnboardingRollPreview>;
  assignRoll: (
    input: EndpointInput<'assignStudentOnboardingRoll'>
  ) => Promise<StudentOnboardingCase>;
  setPlacement: (
    input: EndpointInput<'setStudentOnboardingPlacement'>
  ) => Promise<StudentOnboardingCase>;
};

export type StudentSetupAssignmentResult = {
  student: StudentOnboardingItem;
  status: 'saved' | 'skipped' | 'failed';
  message: string;
  updatedStudent?: StudentOnboardingItem;
  errorCode?: string;
};

type AssignmentOptions = {
  type: StudentSetupAssignmentType;
  mode: StudentSetupAssignmentMode;
  items: readonly StudentSetupAssignmentItem[];
  grAssignmentMode?: AssignmentModePolicy;
  /** Automatic division assignment always uses the user's explicit choice. */
  divisionId?: string;
  services: StudentSetupAssignmentServices;
  onResult?: (result: StudentSetupAssignmentResult) => void;
};

const labels: Record<StudentSetupAssignmentType, string> = {
  'gr-number': 'GR number',
  'roll-number': 'Roll number',
  division: 'Division',
};

const normalizeValue = (
  value: StudentSetupAssignmentValue | undefined,
  type: StudentSetupAssignmentType
): StudentSetupAssignmentValue => {
  if (value == null || String(value).trim() === '') return null;
  return type === 'roll-number' ? Number(value) : String(value).trim();
};

export const getStudentSetupAssignmentValue = (
  student: StudentOnboardingItem,
  type: StudentSetupAssignmentType
): StudentSetupAssignmentValue =>
  normalizeValue(
    type === 'gr-number'
      ? student.grNo
      : type === 'roll-number'
        ? student.rollNo
        : student.divisionId,
    type
  );

const closedReason = (student: StudentOnboardingItem): string | undefined => {
  if (student.source !== 'onboarding-case') return 'Manage this student through Student Records.';
  if (
    student.studentEnrollmentId ||
    student.backendStatus === 4 ||
    student.backendStatus === 5 ||
    student.backendStatus === 6 ||
    ['completed', 'cancelled', 'provisioning'].includes(student.status)
  )
    return 'This student is no longer editable in Student Setup.';
  return undefined;
};

export const studentSetupAssignmentNeedsReason = (
  student: StudentOnboardingItem,
  type: StudentSetupAssignmentType
): boolean =>
  getStudentSetupAssignmentValue(student, type) !== null &&
  (type === 'gr-number' || (type === 'roll-number' && Boolean(student.rollChangeReasonRequired)));

export const getStudentSetupAssignmentEligibility = (
  student: StudentOnboardingItem,
  type: StudentSetupAssignmentType,
  mode: StudentSetupAssignmentMode,
  grAssignmentMode?: AssignmentModePolicy
): { eligible: boolean; reason?: string } => {
  let reason = closedReason(student);
  const current = getStudentSetupAssignmentValue(student, type);
  if (!reason && mode === 'automatic' && current !== null) {
    reason = `${labels[type]} is already assigned.`;
  }
  if (!reason && type === 'gr-number') {
    if (!grAssignmentMode) reason = 'Load the published GR assignment settings before assigning.';
    else if (mode === 'manual' && student.grNumberLocked) reason = 'GR number is locked.';
    else if (
      mode === 'manual' &&
      (grAssignmentMode === 'automatic' || !student.grManualEntryAllowed)
    ) {
      reason = 'Manual GR entry is not allowed by the published school rule.';
    } else if (mode === 'automatic' && grAssignmentMode === 'manual' && !student.grNumberLocked) {
      reason = 'The school rule requires manual GR entry.';
    }
  }
  if (!reason && type === 'roll-number') {
    if (!student.divisionId) reason = 'Assign a division before assigning a Roll number.';
    else if (mode === 'manual' && student.rollNumberLocked) reason = 'Roll number is locked.';
    else if (!student.rollAssignmentMode)
      reason = 'Load the school Roll assignment rule before assigning.';
    else if (
      student.rollAssignmentMode !== 'both' &&
      student.rollAssignmentMode !== mode &&
      !(mode === 'automatic' && current === null && student.rollNumberLocked)
    )
      reason = `The school rule requires ${student.rollAssignmentMode} Roll assignment.`;
  }
  return { eligible: !reason, reason };
};

const inputError = (
  type: StudentSetupAssignmentType,
  value: StudentSetupAssignmentValue,
  reason: string
) => {
  if (value === null) return `Enter ${type === 'division' ? 'a division' : `a ${labels[type]}`}.`;
  if (
    type === 'roll-number' &&
    (!Number.isInteger(value) || Number(value) <= 0 || Number(value) > 2147483647)
  ) {
    return 'Enter a positive whole Roll number.';
  }
  if (type === 'gr-number' && String(value).length > 100)
    return 'GR number must be 100 characters or fewer.';
  if (reason.length > 1000) return 'Reason must be 1000 characters or fewer.';
  return undefined;
};

const assignGr = async (
  options: AssignmentOptions,
  current: StudentOnboardingCase,
  value: StudentSetupAssignmentValue,
  reason: string
) => {
  // The case endpoint resolves published applicability; never pick an arbitrary first series.
  const series = (await options.services.getSeries(current.id)).filter(
    (candidate) =>
      candidate.identifierType === 0 &&
      candidate.isActive &&
      candidate.academicYearId === current.academicYearId &&
      (!candidate.standardId || candidate.standardId === current.intendedStandardId) &&
      (candidate.maximumSequence == null || candidate.nextSequence <= candidate.maximumSequence)
  );
  if (series.length !== 1) {
    throw new Error(
      series.length
        ? 'Multiple GR series apply. Review the published GR rule before assigning.'
        : 'No available published GR series applies to this student.'
    );
  }
  return options.services.assignGr({
    id: current.id,
    concurrencyStamp: current.concurrencyStamp,
    numberSeriesId: series[0].id,
    ...(options.mode === 'manual'
      ? { manualValue: String(value), ...(reason ? { reason } : {}) }
      : {}),
  });
};

const assignRoll = async (
  options: AssignmentOptions,
  current: StudentOnboardingCase,
  value: StudentSetupAssignmentValue,
  reason: string
) => {
  const preview = await options.services.previewRoll({
    id: current.id,
    rollAssignmentMode: options.mode,
    ...(options.mode === 'manual'
      ? { rollNumber: Number(value), ...(reason ? { reason } : {}) }
      : {}),
  });
  if (
    !preview.concurrencyStamp ||
    (options.mode === 'manual' && preview.concurrencyStamp !== current.concurrencyStamp) ||
    preview.rollAssignmentMode !== options.mode ||
    !Number.isInteger(preview.proposedRollNumber) ||
    preview.proposedRollNumber <= 0 ||
    (options.mode === 'manual' && preview.proposedRollNumber !== value)
  )
    throw new Error('The Roll proposal changed. Refresh and review the assignment again.');
  return options.services.assignRoll({
    id: current.id,
    concurrencyStamp: preview.concurrencyStamp,
    rollNumber: preview.proposedRollNumber,
    rollAssignmentMode: preview.rollAssignmentMode,
    ...(options.mode === 'manual' && reason ? { reason } : {}),
  });
};

const runItem = async (
  options: AssignmentOptions,
  item: StudentSetupAssignmentItem
): Promise<StudentSetupAssignmentResult> => {
  const { student } = item;
  let updatedStudent: StudentOnboardingItem | undefined;
  const result = (
    status: StudentSetupAssignmentResult['status'],
    message: string,
    errorCode?: string
  ): StudentSetupAssignmentResult => ({
    student,
    status,
    message,
    updatedStudent,
    ...(errorCode ? { errorCode } : {}),
  });
  if (student.source !== 'onboarding-case') return result('skipped', closedReason(student)!);
  try {
    const current = await options.services.getCase(student.id);
    if (current.id !== student.id)
      throw new Error('The student could not be refreshed. Reload the list.');
    updatedStudent = mapOnboardingCaseToItem(current);
    const closed = closedReason(updatedStudent);
    if (closed) return result('skipped', closed);
    const academicScopeChanged = [
      [student.standardId, updatedStudent.standardId],
      [student.boardId, updatedStudent.boardId],
      [student.academicMediumId, updatedStudent.academicMediumId],
      [student.academicMediumStageId, updatedStudent.academicMediumStageId],
    ].some(([captured, fresh]) => captured != null && captured !== fresh);
    if (academicScopeChanged)
      return result(
        'failed',
        'The academic context changed since this action was opened. Refresh and review it again.',
        'Students.Onboarding.ConcurrencyConflict'
      );
    if (
      options.type === 'roll-number' &&
      options.mode === 'manual' &&
      getStudentSetupAssignmentValue(student, 'division') !==
        getStudentSetupAssignmentValue(updatedStudent, 'division')
    )
      return result(
        'failed',
        'Division changed since this action was opened. Refresh and review the Roll assignment again.',
        'Students.Onboarding.ConcurrencyConflict'
      );
    const freshValue = getStudentSetupAssignmentValue(updatedStudent, options.type);
    if (options.mode === 'automatic' && freshValue !== null) {
      return result('skipped', `${labels[options.type]} is already assigned.`);
    }
    const value = normalizeValue(
      options.mode === 'automatic' ? options.divisionId : item.value,
      options.type
    );
    if (options.mode === 'manual' && value !== null && freshValue === value)
      return result('skipped', `${labels[options.type]} is already set to this value.`);
    const reason = options.mode === 'manual' ? (item.reason?.trim() ?? '') : '';
    if (options.mode === 'manual' || options.type === 'division') {
      const invalid = inputError(options.type, value, reason);
      if (invalid) return result('failed', invalid);
    }
    if (options.mode === 'manual') {
      if (freshValue !== normalizeValue(item.baselineValue, options.type)) {
        return result(
          'failed',
          `${labels[options.type]} changed since this action was opened. Refresh and review it again.`,
          'Students.Onboarding.ConcurrencyConflict'
        );
      }
    }
    const eligibility = getStudentSetupAssignmentEligibility(
      updatedStudent,
      options.type,
      options.mode,
      options.grAssignmentMode
    );
    if (!eligibility.eligible) return result('failed', eligibility.reason!);
    if (!current.concurrencyStamp)
      return result('failed', 'Refresh this student before assigning.');
    if (
      options.mode === 'manual' &&
      studentSetupAssignmentNeedsReason(updatedStudent, options.type) &&
      !reason
    ) {
      return result('failed', `Enter a reason for changing the ${labels[options.type]}.`);
    }
    const saved =
      options.type === 'gr-number'
        ? await assignGr(options, current, value, reason)
        : options.type === 'roll-number'
          ? await assignRoll(options, current, value, reason)
          : await options.services.setPlacement({
              id: current.id,
              concurrencyStamp: current.concurrencyStamp,
              divisionId: String(value),
              ...(options.mode === 'manual' && reason ? { reason } : {}),
            });
    updatedStudent = mapOnboardingCaseToItem(saved);
    return result('saved', `${labels[options.type]} saved.`);
  } catch (error) {
    const problem = parseApiProblemDetail(error);
    return result('failed', problem.detail, problem.errorCode);
  }
};

/** Each student is refreshed and finished before the next begins; failures are never retried. */
export const runStudentSetupAssignment = (
  options: AssignmentOptions
): Promise<StudentSetupAssignmentResult[]> =>
  options.items.reduce(async (previous, item) => {
    const results = await previous;
    const result = await runItem(options, item);
    results.push(result);
    options.onResult?.(result);
    return results;
  }, Promise.resolve<StudentSetupAssignmentResult[]>([]));
