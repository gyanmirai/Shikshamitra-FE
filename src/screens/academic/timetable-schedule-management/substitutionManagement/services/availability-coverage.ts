import type { SubstitutionStatus } from '../substitutionData';

type AvailabilityCoverageInput = {
  affectedLectureCount: number;
  coveredLectureCount?: number;
  uncoveredLectureCount?: number;
  canCreateSubstitution?: boolean;
  activeSubstitutionStatuses?: SubstitutionStatus[];
  activeSubstitutionIds?: string[];
};

type ActionColor = 'default' | 'success' | 'warning' | 'error' | 'info';

const clampCount = (value: number, total: number) => Math.min(Math.max(value, 0), total);

export const getAvailabilityCoverageState = (input: AvailabilityCoverageInput) => {
  const total = Math.max(input.affectedLectureCount, 0);
  let covered = clampCount(
    input.coveredLectureCount ?? input.activeSubstitutionIds?.length ?? 0,
    total
  );
  let uncovered = clampCount(input.uncoveredLectureCount ?? total - covered, total);

  if (
    input.uncoveredLectureCount === undefined &&
    input.canCreateSubstitution === true &&
    uncovered === 0 &&
    total > 0
  ) {
    uncovered = 1;
    covered = total - 1;
  }

  if (total <= 0) {
    return {
      total,
      covered: 0,
      uncovered: 0,
      coverageLabel: '0',
      actionLabel: 'No affected lectures',
      actionColor: 'default' as ActionColor,
      canCreate: false,
    };
  }

  if (uncovered > 0) {
    const canCreate = input.canCreateSubstitution !== false;

    return {
      total,
      covered,
      uncovered,
      coverageLabel: covered > 0 ? `${covered}/${total} Covered` : `${total}`,
      actionLabel: canCreate ? 'Create substitution' : `${uncovered} Uncovered`,
      actionColor:
        covered > 0 || !canCreate ? ('warning' as ActionColor) : ('default' as ActionColor),
      canCreate,
    };
  }

  const statuses = input.activeSubstitutionStatuses ?? [];
  const completed = statuses.includes('Completed');
  const acknowledged = statuses.includes('Acknowledged');
  const waiting = statuses.includes('Waiting Ack');
  const assigned = statuses.includes('Assigned');
  const conflict = statuses.includes('Conflict') || statuses.includes('Rejected');

  return {
    total,
    covered,
    uncovered,
    coverageLabel: `${covered}/${total} Covered`,
    actionLabel: completed
      ? 'Completed'
      : acknowledged
        ? 'Covered'
        : waiting
          ? 'Awaiting acknowledgement'
          : assigned
            ? 'Assigned'
            : conflict
              ? 'Conflict'
              : 'Covered',
    actionColor:
      completed || acknowledged
        ? ('success' as ActionColor)
        : waiting
          ? ('warning' as ActionColor)
          : assigned
            ? ('info' as ActionColor)
            : conflict
              ? ('error' as ActionColor)
              : ('success' as ActionColor),
    canCreate: false,
  };
};
