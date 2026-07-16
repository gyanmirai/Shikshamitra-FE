'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Button,
  Tooltip,
  Checkbox,
} from '@mui/material';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useGetStudentElectiveAssignmentsQuery,
  useLockStudentElectiveAssignmentsMutation,
  useUpdateStudentElectiveAssignmentsMutation,
} from 'src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment';

import { workflowStatusConfig } from './statusConfig';
import BulkAssignmentBar from './components/BulkAssignmentBar';
import ElectiveContextBar from './components/ElectiveContextBar';
import ReviewAndLockDrawer from './components/ReviewAndLockDrawer';
import UnsavedChangesDialog from './components/UnsavedChangesDialog';
import ValidationIssuesDrawer from './components/ValidationIssuesDrawer';
import SubjectSelectionControl from './components/SubjectSelectionControl';
import SubjectCapacityOverview from './components/SubjectCapacityOverview';
import useElectiveAssignmentState from './hooks/useElectiveAssignmentState';
import AssignmentProgressSummary from './components/AssignmentProgressSummary';

const AssignElectiveSubject = () => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const [electiveGroupId, setElectiveGroupId] = useState<string>('');

  const [students, setStudents] = useState<any[]>([]);

  const resetDialog = useBoolean();
  const saveDialog = useBoolean();
  const lockDialog = useBoolean();
  const issuesDrawer = useBoolean();
  const reviewDrawer = useBoolean();
  const unsavedDialog = useBoolean();

  // Pending context change captured while an unsaved-changes guard is shown.
  const pendingContextChange = useRef<(() => void) | null>(null);

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // --------------------------------------------
  // FETCH ELECTIVE GROUPS (subject-assignments filtered to elective/subjectType=1)
  // --------------------------------------------
  const {
    data: subjectAssignmentsData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: classes },
    options: { skip: !classes },
  });

  const electiveGroups = useMemo(() => {
    const seen = new Set<string>();
    return (subjectAssignmentsData?.data?.items ?? [])
      .filter(
        (item: any) => item.subjectType === 1 && item.electiveGroupId && item.electiveGroupName
      )
      .reduce((acc: { id: string; name: string }[], item: any) => {
        if (!seen.has(item.electiveGroupId)) {
          seen.add(item.electiveGroupId);
          acc.push({ id: item.electiveGroupId, name: item.electiveGroupName });
        }
        return acc;
      }, []);
  }, [subjectAssignmentsData]);

  // --------------------------------------------
  // BUILD CLASS LIST FROM MEDIUM
  // --------------------------------------------
  useEffect(() => {
    const list =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage?.standards || []) || [];

    setAllClass(list);
    setClasses(list[0]?.id || '');
  }, [medium]);

  // --------------------------------------------
  // UPDATE DIVISIONS WHEN CLASS CHANGES
  // --------------------------------------------
  useEffect(() => {
    const selectedClass = allClass.find((c) => c.id === classes);
    setAllDivision(selectedClass?.divisions || []);
    setDivision(selectedClass?.divisions?.[0]?.id || '');

    setElectiveGroupId('');
    setStudents([]);
  }, [allClass, classes]);

  // --------------------------------------------
  // GET ELECTIVE ASSIGNMENTS USING useQueryAndMutation
  // --------------------------------------------
  const {
    data: assignmentData,
    isLoading: isElectiveLoading,
    refetch: refetchElectives,
    isFetching: isElectiveFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentElectiveAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      classId: classes,
      divisionId: division,
      electiveGroupId,
    },
    options: {
      skip: !medium?.id || !classes || !division || !electiveGroupId,
    },
  });

  useEffect(() => {
    if (assignmentData?.records) {
      setStudents(assignmentData.records);
    }
  }, [assignmentData]);

  const isLocked = !!assignmentData?.isLocked;

  const {
    studentSelections,
    assignSubject,
    bulkAssignSubject,
    clearSelections,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedRowIds,
    toggleRowSelected,
    toggleAllRowsSelected,
    clearRowSelection,
    filteredStudents,
    summary,
    subjectCapacity,
    validationIssues,
    preferenceMatch,
    rowStatus,
    hasUnsavedChanges,
    unsavedChangesCount,
    allStudentsAssigned,
    hasSelections,
    workflowStatus,
  } = useElectiveAssignmentState({
    students,
    serverRecords: assignmentData?.records,
    isLocked,
  });

  // --------------------------------------------
  // CONTEXT CHANGE GUARD (unsaved changes)
  // --------------------------------------------
  const guardedContextChange = (applyChange: () => void) => {
    if (hasUnsavedChanges) {
      pendingContextChange.current = applyChange;
      unsavedDialog.onTrue();
      return;
    }
    applyChange();
  };

  const handleDiscardAndContinue = () => {
    pendingContextChange.current?.();
    pendingContextChange.current = null;
    unsavedDialog.onFalse();
  };

  // --------------------------------------------
  // PUT API USING useQueryAndMutation
  // --------------------------------------------
  const [updateStudentElectiveAssignments, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentElectiveAssignmentsMutation,
  });

  const handleSave = async () => {
    const payload = {
      academicMediumId: medium?.id,
      electiveGroupId,
      assignments: Object.entries(studentSelections).map(([studentId, selectedSubjectId]) => ({
        studentId,
        selectedSubjectId,
      })),
    };

    try {
      await updateStudentElectiveAssignments(payload).unwrap();
      shikshaMitraToast.success({ message: 'Elective assignments saved!' });
      saveDialog.onFalse();
      refetchElectives();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to save assignments.' });
    }
  };

  // --------------------------------------------
  // DISCARD (RESET)
  // --------------------------------------------
  const handleReset = () => {
    clearSelections();
    resetDialog.onFalse();
    shikshaMitraToast.success({ message: 'Changes discarded.' });
  };

  // --------------------------------------------
  // LOCK API USING useQueryAndMutation
  // --------------------------------------------
  const [lockStudentElectiveAssignments, { isLoading: isLocking }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLockStudentElectiveAssignmentsMutation,
  });

  const handleLock = async () => {
    const payload = {
      academicMediumId: medium?.id,
      classId: classes,
      divisionId: division,
      electiveGroupId,
    };

    try {
      await lockStudentElectiveAssignments(payload).unwrap();
      shikshaMitraToast.success({ message: 'Elective assignments locked successfully!' });
      lockDialog.onFalse();
      reviewDrawer.onFalse();
      refetchElectives();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to lock assignments.' });
    }
  };

  const canLock = allStudentsAssigned && !hasUnsavedChanges && !isLocked;

  const getLockTooltip = () => {
    if (isLocked) return 'These elective assignments are locked and cannot be modified.';
    if (!allStudentsAssigned) return 'Assign elective subjects to all students before locking.';
    if (hasUnsavedChanges) return 'Save your changes before locking.';
    return 'Review the allocation and lock it.';
  };

  const handleGoToStudent = (studentId: string) => {
    const student = students.find((s) => s.studentId === studentId);
    issuesDrawer.onFalse();
    setStatusFilter('all');
    if (student) setSearchTerm(student.rollNo);
  };

  const statusInfo = workflowStatusConfig[workflowStatus];
  const availableSubjects = students[0]?.selectableSubjects ?? [];

  // --------------------------------------------
  // UI
  // --------------------------------------------

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Student Elective Assignment"
        description="Assign and manage student elective subjects for the selected class and elective group."
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Student Elective Assignment' },
        ]}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Label color={statusInfo.color} variant="soft">
                {statusInfo.label}
              </Label>
              {isLocked ? (
                <Box sx={{ fontSize: 12, color: 'text.disabled' }}>Locked · editing disabled</Box>
              ) : unsavedChangesCount > 0 ? (
                <Box sx={{ fontSize: 12, color: 'text.disabled' }}>
                  {unsavedChangesCount} unsaved change{unsavedChangesCount === 1 ? '' : 's'}
                </Box>
              ) : null}
            </Box>

            {electiveGroupId && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isLocked && (
                  <>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
                      disabled={!hasSelections}
                      onClick={resetDialog.onTrue}
                    >
                      Discard
                    </Button>

                    <LoadingButton
                      variant="contained"
                      size="small"
                      startIcon={<Iconify icon={GlobalIcons.submit} />}
                      disabled={!hasUnsavedChanges}
                      onClick={saveDialog.onTrue}
                      loading={isSaving}
                    >
                      Save Draft
                    </LoadingButton>
                  </>
                )}

                <Tooltip title={getLockTooltip()} arrow>
                  <span>
                    <Button
                      variant="contained"
                      size="small"
                      color={isLocked ? 'success' : 'error'}
                      startIcon={<Iconify icon={isLocked ? GlobalIcons.approvedIcon : GlobalIcons.lockIcon} />}
                      disabled={isLocked}
                      onClick={reviewDrawer.onTrue}
                    >
                      {isLocked ? 'Locked' : 'Review & Lock'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>
        }
      />

      {/* CONTEXT BAR */}
      <ElectiveContextBar
        allClass={allClass}
        classes={classes}
        onClassChange={(v) => guardedContextChange(() => setClasses(v))}
        allDivision={allDivision}
        division={division}
        onDivisionChange={(v) => guardedContextChange(() => setDivision(v))}
        electiveGroups={electiveGroups}
        electiveGroupId={electiveGroupId}
        onElectiveGroupChange={(v) => guardedContextChange(() => setElectiveGroupId(v))}
        isLoading={isLoading || isFetching}
        students={students}
      />

      {electiveGroupId && (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* INSIGHTS & CAPACITY OVERVIEW */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={12} lg={8.5}>
              <AssignmentProgressSummary
                total={summary.total}
                assigned={summary.assigned}
                unassigned={summary.unassigned}
                issues={summary.issues}
                preferenceMatchPct={summary.preferenceMatchPct}
                activeFilter={statusFilter}
                onFilterAssigned={() => setStatusFilter(statusFilter === 'assigned' ? 'all' : 'assigned')}
                onFilterUnassigned={() =>
                  setStatusFilter(statusFilter === 'unassigned' ? 'all' : 'unassigned')
                }
                onFilterPreferenceMismatch={() =>
                  setStatusFilter(statusFilter === 'preferenceMismatch' ? 'all' : 'preferenceMismatch')
                }
                onOpenIssues={issuesDrawer.onTrue}
                sx={{ mb: 0 }}
              />
            </Grid>
            <Grid item xs={12} lg={3.5}>
              <SubjectCapacityOverview
                subjects={subjectCapacity}
                totalStudents={summary.total}
                sx={{ mb: 0, height: '100%' }}
              />
            </Grid>
          </Grid>

          {/* BULK ASSIGNMENT BAR */}
          {!isLocked && (
            <BulkAssignmentBar
              selectedCount={selectedRowIds.size}
              subjects={availableSubjects}
              onAssign={(subjectId) => {
                bulkAssignSubject(Array.from(selectedRowIds), subjectId);
                clearRowSelection();
              }}
              onClearAssignments={() => {
                clearSelections(Array.from(selectedRowIds));
                clearRowSelection();
              }}
              onClearSelection={clearRowSelection}
            />
          )}

          {/* TABLE */}
          <CustomizableTable
            tableId="elective-table"
            data={filteredStudents}
            isLoading={isElectiveLoading || isElectiveFetching}
            isSearch={false}
            noDataText={<>No Students Found</>}
            wrapperProps={{
              sx: {
                flex: 1,
                minHeight: { xs: 420, md: 0 },
              },
            }}
            tableContainerProps={{
              sx: {
                minHeight: { xs: 340, md: 0 },
              },
            }}
            columns={[
              {
                id: 'rowSelect',
                label: (
                  <Checkbox
                    size="small"
                    disabled={isLocked || filteredStudents.length === 0}
                    checked={
                      filteredStudents.length > 0 &&
                      filteredStudents.every((s) => selectedRowIds.has(s.studentId))
                    }
                    indeterminate={
                      filteredStudents.some((s) => selectedRowIds.has(s.studentId)) &&
                      !filteredStudents.every((s) => selectedRowIds.has(s.studentId))
                    }
                    onChange={(e) =>
                      toggleAllRowsSelected(
                        filteredStudents.map((s) => s.studentId),
                        e.target.checked
                      )
                    }
                  />
                ),
                minWidth: '48px',
                isFilter: false,
                isSort: false,
                sticky: true,
                stickyPosition: 'left',
                render: (_, row) => (
                  <Checkbox
                    size="small"
                    disabled={isLocked}
                    checked={selectedRowIds.has(row.studentId)}
                    onChange={() => toggleRowSelected(row.studentId)}
                  />
                ),
              },
              {
                id: 'studentName',
                label: 'Student Name',
                minWidth: '200px',
                align: 'left',
                sticky: true,
                stickyPosition: 'left',
              },
              { id: 'rollNo', label: 'Roll No.', minWidth: '110px', align: 'left' },
              {
                id: 'preference',
                label: 'Preference Match',
                minWidth: '160px',
                align: 'left',
                isFilter: false,
                isSort: false,
                render: (_, row) => {
                  const match = preferenceMatch(row as any);
                  if (match === 'noPreference') {
                    return (
                      <Box component="span" sx={{ color: 'text.disabled', fontSize: 13 }}>
                        No preference
                      </Box>
                    );
                  }
                  return (
                    <Chip
                      size="small"
                      variant="soft"
                      color={match === 'matched' ? 'success' : 'warning'}
                      label={match === 'matched' ? 'Matched' : 'Mismatch'}
                    />
                  );
                },
              },
              {
                id: 'electiveSubjects',
                label: 'Elective Subject',
                minWidth: '260px',
                isFilter: false,
                isSort: false,
                align: 'left',
                render: (_, row) => (
                  <SubjectSelectionControl
                    subjects={row.selectableSubjects}
                    selectedSubjectId={studentSelections[row.studentId]}
                    onSelect={(subjectId) => assignSubject(row.studentId, subjectId)}
                    disabled={isLocked}
                    ariaLabelPrefix={row.studentName}
                  />
                ),
              },
              {
                id: 'status',
                label: 'Status',
                minWidth: '120px',
                isFilter: false,
                isSort: false,
                align: 'left',
                render: (_, row) => {
                  const status = isLocked ? 'locked' : rowStatus(row as any);
                  const map: Record<string, { label: string; color: any }> = {
                    assigned: { label: 'Assigned', color: 'success' },
                    unassigned: { label: 'Unassigned', color: 'error' },
                    changed: { label: 'Changed', color: 'info' },
                    locked: { label: 'Locked', color: 'default' },
                  };
                  const s = map[status];
                  return <Chip size="small" variant="soft" color={s.color} label={s.label} />;
                },
              },
            ]}
          />
        </Box>
      )}

      {!electiveGroupId && (
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          Select a class, division, and elective group to begin.
        </Alert>
      )}

      {/* RESET / DISCARD DIALOG */}
      <ConfirmDialog
        open={resetDialog.value}
        onClose={resetDialog.onFalse}
        title="Discard Changes"
        content="Are you sure you want to discard all unsaved elective subject changes?"
        action={
          <Button variant="contained" color="error" onClick={handleReset}>
            Discard
          </Button>
        }
      />

      {/* SAVE DIALOG */}
      <ConfirmDialog
        open={saveDialog.value}
        onClose={saveDialog.onFalse}
        title="Save Draft"
        content="Are you sure you want to save these elective assignments as a draft?"
        action={
          <LoadingButton variant="contained" onClick={handleSave} loading={isSaving}>
            Save
          </LoadingButton>
        }
      />

      {/* LOCK CONFIRM DIALOG (final confirmation, triggered from review drawer) */}
      <ConfirmDialog
        open={lockDialog.value}
        onClose={lockDialog.onFalse}
        title="Lock Elective Assignments"
        content="Are you sure you want to lock these elective assignments? Once locked, you will not be able to edit or assign subjects to students for this class and division."
        action={
          <LoadingButton variant="contained" color="error" onClick={handleLock} loading={isLocking}>
            Lock
          </LoadingButton>
        }
      />

      {/* VALIDATION ISSUES DRAWER */}
      <ValidationIssuesDrawer
        open={issuesDrawer.value}
        onClose={issuesDrawer.onFalse}
        issues={validationIssues}
        onGoToStudent={handleGoToStudent}
      />

      {/* REVIEW AND LOCK DRAWER */}
      <ReviewAndLockDrawer
        open={reviewDrawer.value}
        onClose={reviewDrawer.onFalse}
        total={summary.total}
        assigned={summary.assigned}
        unassigned={summary.unassigned}
        subjectCapacity={subjectCapacity}
        preferenceMatchPct={summary.preferenceMatchPct}
        canLock={canLock}
        isLocking={isLocking}
        onConfirmLock={() => {
          reviewDrawer.onFalse();
          lockDialog.onTrue();
        }}
      />

      {/* UNSAVED CHANGES GUARD */}
      <UnsavedChangesDialog
        open={unsavedDialog.value}
        onClose={() => {
          pendingContextChange.current = null;
          unsavedDialog.onFalse();
        }}
        onDiscard={handleDiscardAndContinue}
      />
    </Box>
  );
};

export default AssignElectiveSubject;
