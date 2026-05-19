import type {
  AttendanceConfiguration,
  AttendancePolicyOverride,
  AttendancePolicyEvaluationRun,
  AttendancePolicyEvaluationRequest,
  AttendanceConfigurationPreviewRequest,
} from './types';

const emptyToUndefined = <T>(value: T | '') => (value === '' ? undefined : value);

export const normalizeAttendanceOverride = (
  override: AttendancePolicyOverride
): AttendancePolicyOverride => ({
  ...override,
  hoursBasedPayPercentage: emptyToUndefined(override.hoursBasedPayPercentage),
  graceTime: emptyToUndefined(override.graceTime),
  maxLateAllowedPerMonth: emptyToUndefined(override.maxLateAllowedPerMonth),
  penaltyType: emptyToUndefined(override.penaltyType),
  overtimeRate: emptyToUndefined(override.overtimeRate),
  minOvertimeMinutes: emptyToUndefined(override.minOvertimeMinutes),
});

export const buildAttendanceConfigurationRequest = (
  values: AttendanceConfiguration
): AttendanceConfiguration =>
  ({
    ...values,
    dailyRules: {
      ...values.dailyRules,
      hoursBasedPayPercentage: values.punchRules.fullDayThresholdPercentage,
    },
    overtime: values.overtime.enabled
      ? values.overtime
      : {
          enabled: false,
        },
    overrides: values.overrides.map(normalizeAttendanceOverride),
  }) as AttendanceConfiguration;

export type AttendancePreviewFilters = {
  fromDate: string;
  toDate: string;
  departmentId?: string;
  roleId?: string;
  employeeType?: string;
  shiftId?: string;
};

const trimToUndefined = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

export const buildAttendanceConfigurationPreviewRequest = (
  filters: AttendancePreviewFilters,
  values: AttendanceConfiguration
): AttendanceConfigurationPreviewRequest => ({
  fromDate: filters.fromDate,
  toDate: filters.toDate,
  departmentId: trimToUndefined(filters.departmentId),
  roleId: trimToUndefined(filters.roleId),
  employeeType: trimToUndefined(filters.employeeType),
  shiftId: trimToUndefined(filters.shiftId),
  configuration: buildAttendanceConfigurationRequest(values),
});

export const buildAttendancePolicyEvaluationRequest = (
  academicYearId: string,
  evaluationMonth: string,
  filters?: Partial<
    Pick<AttendancePolicyEvaluationRequest, 'departmentId' | 'roleId' | 'employeeType' | 'shiftId'>
  >
): AttendancePolicyEvaluationRequest => {
  const [year, month] = evaluationMonth.split('-').map(Number);
  return {
    academicYearId,
    month,
    year,
    departmentId: trimToUndefined(filters?.departmentId),
    roleId: trimToUndefined(filters?.roleId),
    employeeType: trimToUndefined(filters?.employeeType),
    shiftId: trimToUndefined(filters?.shiftId),
  };
};

const actionableStatuses = ['evaluated', 'approved', 'needs_review'];
const fallbackStatusPriority: Record<string, number> = {
  draft: 0,
  cancelled: 1,
  superseded: 2,
};

const getRunTimestamp = (run: AttendancePolicyEvaluationRun) =>
  new Date(
    run.lastUpdatedAt || run.publishedAt || run.approvedAt || run.createdAt || run.toDate
  ).getTime();

const newestRun = (runs: AttendancePolicyEvaluationRun[]) =>
  [...runs].sort((a, b) => getRunTimestamp(b) - getRunTimestamp(a))[0];

export const pickLatestAttendanceEvaluation = (
  runs: AttendancePolicyEvaluationRun[] = []
): AttendancePolicyEvaluationRun | undefined => {
  const newestPublished = newestRun(runs.filter((run) => run.status === 'published'));
  const newestActionable = newestRun(runs.filter((run) => actionableStatuses.includes(run.status)));

  if (newestPublished && newestActionable) {
    return getRunTimestamp(newestActionable) > getRunTimestamp(newestPublished)
      ? newestActionable
      : newestPublished;
  }

  if (newestActionable) return newestActionable;
  if (newestPublished) return newestPublished;

  return [...runs].sort((a, b) => {
    const statusDelta =
      (fallbackStatusPriority[a.status] ?? 99) - (fallbackStatusPriority[b.status] ?? 99);
    if (statusDelta !== 0) return statusDelta;
    return getRunTimestamp(b) - getRunTimestamp(a);
  })[0];
};

export const canApproveAttendanceEvaluation = (run?: AttendancePolicyEvaluationRun) =>
  run?.status === 'evaluated';

export const canPublishAttendanceEvaluation = (run?: AttendancePolicyEvaluationRun) =>
  run?.status === 'approved';

export const canCancelAttendanceEvaluation = (run?: AttendancePolicyEvaluationRun) =>
  !!run && ['draft', 'evaluated', 'needs_review', 'approved'].includes(run.status);

export const shouldRenderEvaluationSummary = (
  showPreviewEvaluation: boolean,
  persistedEvaluation?: AttendancePolicyEvaluationRun
) => showPreviewEvaluation || !!persistedEvaluation;

export const shouldRenderEvaluationEmptyState = (
  hasSavedRuns: boolean,
  showPreviewEvaluation: boolean,
  persistedEvaluation?: AttendancePolicyEvaluationRun
) => !hasSavedRuns && !showPreviewEvaluation && !persistedEvaluation;
