export type EmployeeWorkAssignment = {
  mode: 'specificOrganizations' | 'schoolWide' | 'decideLater';
  academicYearId?: string | null;
  academicYearName?: string | null;
  organizationIds: string[];
  organizationLabels?: string[];
};

export const emptyWorkAssignment = (): EmployeeWorkAssignment => ({
  mode: 'decideLater',
  academicYearId: null,
  organizationIds: [],
});

export const MAX_WORK_ASSIGNMENT_ORGANIZATIONS = 100;

/** Display snapshots are never submitted as authoritative organization/year data. */
export function workAssignmentRequest(assignment: EmployeeWorkAssignment) {
  return {
    mode: assignment.mode,
    academicYearId: assignment.academicYearId || null,
    organizationIds: [...assignment.organizationIds],
  };
}

export function workAssignmentSelectionError(
  assignment: EmployeeWorkAssignment,
  availableIds: string[]
): string | undefined {
  if (!assignment.academicYearId) return 'Choose an academic year before selecting organizations.';
  if (!assignment.organizationIds.length) return 'Select at least one organization.';
  if (new Set(assignment.organizationIds).size !== assignment.organizationIds.length)
    return 'Remove duplicate organizations before continuing.';
  if (assignment.organizationIds.length > MAX_WORK_ASSIGNMENT_ORGANIZATIONS)
    return 'Select no more than 100 organizations.';
  if (assignment.organizationIds.some((id) => !id || !availableIds.includes(id)))
    return 'Remove unavailable organizations or retry the lookup.';
  return undefined;
}

export function workAssignmentText(application: {
  workAssignment?: EmployeeWorkAssignment | null;
  departmentAppliedFor?: string;
}): string {
  const assignment = application.workAssignment;
  const legacySuffix =
    assignment && application.departmentAppliedFor
      ? `; Legacy department: ${application.departmentAppliedFor}`
      : '';
  if (!assignment)
    return application.departmentAppliedFor
      ? `Legacy department: ${application.departmentAppliedFor}`
      : 'Not recorded';
  if (assignment.mode === 'schoolWide')
    return `School-wide / not tied to an academic organization${legacySuffix}`;
  if (assignment.mode === 'decideLater') return `Decide later${legacySuffix}`;
  return `${assignment.organizationLabels?.join('; ') || 'Organizations require review'} (${assignment.academicYearName || 'Academic year requires review'})${legacySuffix}`;
}

export function isWorkAssignmentValid(
  assignment: EmployeeWorkAssignment,
  availableIds: string[],
  loaded: boolean
): boolean {
  if (assignment.mode !== 'specificOrganizations')
    return (
      ['schoolWide', 'decideLater'].includes(assignment.mode) &&
      !assignment.academicYearId &&
      assignment.organizationIds.length === 0
    );
  return Boolean(loaded && !workAssignmentSelectionError(assignment, availableIds));
}
