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

export function workAssignmentText(application: {
  workAssignment?: EmployeeWorkAssignment | null;
  departmentAppliedFor?: string;
}): string {
  const assignment = application.workAssignment;
  const legacySuffix = assignment && application.departmentAppliedFor
    ? `; Legacy department: ${application.departmentAppliedFor}` : '';
  if (!assignment)
    return application.departmentAppliedFor
      ? `Legacy department: ${application.departmentAppliedFor}`
      : 'Not recorded';
  if (assignment.mode === 'schoolWide') return `School-wide / not tied to an academic organization${  legacySuffix}`;
  if (assignment.mode === 'decideLater') return `Decide later${  legacySuffix}`;
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
  return Boolean(
    loaded &&
    assignment.academicYearId &&
    assignment.organizationIds.length &&
    new Set(assignment.organizationIds).size === assignment.organizationIds.length &&
    assignment.organizationIds.every((id) => availableIds.includes(id))
  );
}
