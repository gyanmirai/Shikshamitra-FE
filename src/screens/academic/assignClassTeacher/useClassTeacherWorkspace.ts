import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type { ClassTeacherEligibleTeacher } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetClassTeacherWorkspaceQuery } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { getPendingAssignmentRows } from './classTeacherPendingRows';
import { applyDraftTeacherWorkloads } from './classTeacherDraftWorkload';
import { buildRows, getRowKey, getSummary, getChangedRows } from './classTeacherAssignmentModel';

import type { AssignmentTableRow } from './classTeacherAssignmentModel';

const EMPTY_TEACHERS: ClassTeacherEligibleTeacher[] = [];
const EMPTY_ROWS: AssignmentTableRow[] = [];

export function useClassTeacherWorkspace() {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'ClassManagement.ClassTeacherAssignment.View');
  const canAdd = hasGrantedPermission(permissions, 'ClassManagement.ClassTeacherAssignment.Add');
  const organizations: Organization[] = medium?.educationMediumStages ?? [];
  const [selectedOrganization, setOrganization] = useState('');
  const organization = organizations.some((item) => item.id === selectedOrganization)
    ? selectedOrganization
    : (organizations[0]?.id ?? '');
  const query = useGetClassTeacherWorkspaceQuery(
    { organizationId: organization },
    { skip: !canView || !organization }
  );
  const workspace = query.currentData;
  const assignmentsData = workspace?.items;
  const [draft, setDraft] = useState<{
    scope: string;
    rows: AssignmentTableRow[];
    original: AssignmentTableRow[];
  }>({ scope: '', rows: [], original: [] });
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!assignmentsData) return;
    const rows = buildRows(assignmentsData);
    setDraft((previous) => {
      // A background refresh must not overwrite unsaved edits in the same organization.
      if (
        previous.scope === organization &&
        getChangedRows(previous.rows, previous.original).length
      )
        return previous;
      return { scope: organization, rows, original: rows };
    });
  }, [assignmentsData, organization]);

  useEffect(() => {
    setPage(0);
  }, [organization, statusFilter]);

  const tableData = draft.scope === organization ? draft.rows : EMPTY_ROWS;
  const originalRows = draft.scope === organization ? draft.original : EMPTY_ROWS;
  const changedRows = getChangedRows(tableData, originalRows);
  const pendingRows = getPendingAssignmentRows(tableData, changedRows);
  const summary = getSummary(tableData, workspace?.summary, pendingRows.length);
  const eligibleTeachers = workspace?.eligibleTeachers ?? EMPTY_TEACHERS;
  // Reconcile the full teacher list once per draft so every row shares the same workload options.
  const teachers = useMemo(
    () => applyDraftTeacherWorkloads(eligibleTeachers, tableData, originalRows),
    [eligibleTeachers, tableData, originalRows]
  );
  const filteredData = tableData.filter(
    (row) =>
      statusFilter === 'all' ||
      (statusFilter === 'assigned' && !!row.classTeacher) ||
      (statusFilter === 'unassigned' && !row.classTeacher) ||
      (statusFilter === 'conflict' && row.conflictCount > 0) ||
      (statusFilter === 'changed' &&
        pendingRows.some((pending) => getRowKey(pending) === getRowKey(row))) ||
      (statusFilter === 'temporary' && row.assignmentTypeDraft === 'Temporary')
  );

  const updateRow = (rowKey: string, patch: Partial<AssignmentTableRow>) => {
    if (!canAdd) return;
    setDraft((previous) => ({
      ...previous,
      rows: previous.rows.map((row) => (getRowKey(row) === rowKey ? { ...row, ...patch } : row)),
    }));
  };
  const changeTeacher = (row: AssignmentTableRow, teacher: ClassTeacherEligibleTeacher | null) => {
    updateRow(getRowKey(row), {
      classTeacher: teacher?.teacherId ?? null,
      classTeacherName: teacher?.teacherName ?? '',
      assignedTeacher: teacher ? { ...teacher } : null,
      assignmentStatus: teacher ? 'Changed' : 'Unassigned',
    });
  };
  const discard = () => setDraft((previous) => ({ ...previous, rows: previous.original }));
  const markSaved = () => setDraft((previous) => ({ ...previous, original: previous.rows }));

  return {
    ...query,
    organization,
    organizations,
    setOrganization,
    canView,
    canAdd,
    workspace,
    tableData,
    teachers,
    filteredData,
    summary,
    pendingRows,
    hasChanges: changedRows.length > 0,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    updateRow,
    changeTeacher,
    discard,
    markSaved,
  };
}
