import type {
  ClassTeacherSummary,
  ClassTeacherAssignmentRowDto,
} from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

export type AssignmentTableRow = ClassTeacherAssignmentRowDto & {
  classTeacher: string | null;
  classTeacherName: string;
  effectiveFromDraft: string;
  assignmentTypeDraft: string;
  changeReasonDraft: string;
};

export const assignmentTypes = ['Permanent', 'Temporary', 'Acting', 'Replacement'];
export const changeReasons = [
  'New Academic Year',
  'Transfer',
  'Long Leave',
  'Workload Balancing',
  'Administrative Decision',
  'Other',
];

const todayIso = () => new Date().toISOString().slice(0, 10);

export const buildRows = (rows: ClassTeacherAssignmentRowDto[]): AssignmentTableRow[] =>
  rows.map((row) => ({
    ...row,
    classTeacher: row.assignedTeacher?.teacherId ?? null,
    classTeacherName: row.assignedTeacher?.teacherName ?? '',
    effectiveFromDraft: row.effectiveFrom?.slice(0, 10) ?? todayIso(),
    assignmentTypeDraft: row.assignmentType || 'Permanent',
    changeReasonDraft: 'New Academic Year',
  }));

export const getRowKey = (row: AssignmentTableRow) => `${row.classId}-${row.divisionId}`;

export const getChangedRows = (rows: AssignmentTableRow[], originalRows: AssignmentTableRow[]) =>
  rows.filter((row) => {
    const original = originalRows.find((item) => getRowKey(item) === getRowKey(row));
    return (
      row.classTeacher !== original?.classTeacher ||
      row.effectiveFromDraft !== original?.effectiveFromDraft ||
      row.assignmentTypeDraft !== original?.assignmentTypeDraft ||
      row.changeReasonDraft !== original?.changeReasonDraft
    );
  });

export const getSummary = (
  rows: AssignmentTableRow[],
  apiSummary: ClassTeacherSummary | undefined,
  pendingChanges: number
): ClassTeacherSummary => {
  const assigned = rows.filter((row) => row.classTeacher).length;
  const conflicts = rows.filter((row) => row.conflictCount > 0).length;
  const unassigned = rows.length - assigned;
  const reasons = [
    ...(unassigned ? [`${unassigned} class divisions are unassigned.`] : []),
    ...(conflicts ? [`${conflicts} assignments need review.`] : []),
    ...(pendingChanges ? [`${pendingChanges} changes are awaiting confirmation.`] : []),
  ];

  return {
    totalClasses: rows.length,
    assigned,
    unassigned,
    conflicts,
    pendingChanges,
    pendingApproval: apiSummary?.pendingApproval ?? 0,
    temporaryAssignments: rows.filter((row) => row.assignmentTypeDraft === 'Temporary').length,
    acknowledgmentPending: apiSummary?.acknowledgmentPending ?? 0,
    status: conflicts || unassigned || pendingChanges ? 'Attention Needed' : 'Ready',
    reasons,
  };
};
