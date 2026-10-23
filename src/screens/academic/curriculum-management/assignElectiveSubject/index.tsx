'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Alert, Button } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useGetStudentElectiveAssignmentsQuery,
  useLockStudentElectiveAssignmentsMutation,
  useUpdateStudentElectiveAssignmentsMutation,
} from 'src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment';

import BulkAssignmentBar from './components/BulkAssignmentBar';
import ElectiveContextBar from './components/ElectiveContextBar';
import ReviewAndLockDialog from './components/ReviewAndLockDialog';
import UnsavedChangesDialog from './components/UnsavedChangesDialog';
import ValidationIssuesDrawer from './components/ValidationIssuesDrawer';
import AssignmentSummaryDrawer from './components/AssignmentSummaryDrawer';
import ElectiveAssignmentTable from './components/ElectiveAssignmentTable';
import useElectiveAssignmentState from './hooks/useElectiveAssignmentState';
import useAutoSelectElectiveGroup from './hooks/useAutoSelectElectiveGroup';
import ElectiveAssignmentActions from './components/ElectiveAssignmentActions';
import { buildElectiveAssignmentUpdates } from './utils/buildElectiveAssignmentUpdates';

import type { StudentElectiveRow } from './types';

const AssignElectiveSubject = () => {
  const router = useRouter();
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const [electiveGroupId, setElectiveGroupId] = useState<string>('');

  const [students, setStudents] = useState<StudentElectiveRow[]>([]);

  const resetDialog = useBoolean();
  const saveDialog = useBoolean();
  const lockDialog = useBoolean();
  const issuesDrawer = useBoolean();
  const summaryDrawer = useBoolean();
  const reviewDrawer = useBoolean();
  const unsavedDialog = useBoolean();

  // Pending context change captured while an unsaved-changes guard is shown.
  const pendingContextChange = useRef<(() => void) | null>(null);

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.electiveAssignment}.View`
  );
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.electiveAssignment}.Add`
  );

  // --------------------------------------------
  // FETCH ELECTIVE GROUPS (subject-assignments filtered to elective/subjectType=1)
  // --------------------------------------------
  const {
    currentData: subjectAssignmentsData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: classes },
    options: { skip: !canView || !classes },
  });

  const electiveGroups = useMemo(() => {
    const seen = new Set<string>();
    const assignments: {
      subjectType: number;
      electiveGroupId?: string | null;
      electiveGroupName?: string | null;
    }[] = subjectAssignmentsData?.data?.items ?? [];

    return assignments
      .reduce<{ id: string; name: string }[]>((acc, item) => {
        const { electiveGroupId: groupId, electiveGroupName: groupName } = item;
        if (item.subjectType === 1 && groupId && groupName && !seen.has(groupId)) {
          seen.add(groupId);
          acc.push({ id: groupId, name: groupName });
        }
        return acc;
      }, [])
      .sort(
        (left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)
      );
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

  useAutoSelectElectiveGroup({
    classId: classes,
    divisionId: division,
    groups: electiveGroups,
    selectedGroupId: electiveGroupId,
    isLoading: isLoading || isFetching,
    onSelect: setElectiveGroupId,
  });

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
      skip: !canView || !medium?.id || !classes || !division || !electiveGroupId,
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
    toggleSubject,
    bulkAssignSubject,
    clearSelections,
    resetSelections,
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
    allStudentsAssigned,
  } = useElectiveAssignmentState({
    students,
    serverRecords: assignmentData?.records,
    isLocked: isLocked || !canAdd,
  });

  const { confirmation: navigationConfirmation } = useUnsavedNavigation(hasUnsavedChanges, {
    push: router.push,
    title: 'Unsaved Changes',
    description:
      'You have unsaved elective assignment changes. Leave this page to discard them, or keep editing to preserve your work.',
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
    resetSelections();
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
    if (!canAdd) return;
    const payload = {
      academicMediumId: medium?.id,
      electiveGroupId,
      assignments: buildElectiveAssignmentUpdates(students, studentSelections),
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
    resetSelections();
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
    if (!canAdd) return;
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

  const canLock = canAdd && allStudentsAssigned && !hasUnsavedChanges && !isLocked;

  const getLockTooltip = () => {
    if (isLocked) return 'These elective assignments are locked and cannot be modified.';
    if (hasUnsavedChanges) return 'Save your changes before locking.';
    if (!allStudentsAssigned) return 'Assign elective subjects to all students before locking.';
    return 'Review the allocation and lock it.';
  };

  const handleGoToStudent = (studentId: string) => {
    const student = students.find((s) => s.studentId === studentId);
    issuesDrawer.onFalse();
    setStatusFilter('all');
    if (student) setSearchTerm(student.rollNo);
  };

  const availableSubjects = students[0]?.selectableSubjects ?? [];

  // --------------------------------------------
  // UI
  // --------------------------------------------

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Elective Assignment"
        description="Assign and manage student elective subjects for the selected class and elective group."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum' },
          { name: 'Elective Assignment' },
        ]}
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
        actions={
          electiveGroupId ? (
            <ElectiveAssignmentActions
              canManage={canAdd}
              isLocked={isLocked}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              canLock={canLock}
              lockTooltip={getLockTooltip()}
              onViewInsights={summaryDrawer.onTrue}
              onDiscard={resetDialog.onTrue}
              onSaveDraft={saveDialog.onTrue}
              onReviewLock={reviewDrawer.onTrue}
            />
          ) : undefined
        }
      />

      {electiveGroupId && (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* BULK ASSIGNMENT BAR */}
          {canAdd && !isLocked && (
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
          <ElectiveAssignmentTable
            students={filteredStudents}
            isLoading={isElectiveLoading || isElectiveFetching}
            isLocked={isLocked || !canAdd}
            searchTerm={searchTerm}
            selectedRowIds={selectedRowIds}
            studentSelections={studentSelections}
            onSearchChange={setSearchTerm}
            onToggleRow={toggleRowSelected}
            onToggleAllRows={toggleAllRowsSelected}
            onToggleSubject={toggleSubject}
            getPreferenceMatch={preferenceMatch}
            getRowStatus={rowStatus}
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
        open={canAdd && saveDialog.value}
        onClose={saveDialog.onFalse}
        disableBackdropClick
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
        open={canAdd && lockDialog.value}
        onClose={lockDialog.onFalse}
        disableBackdropClick
        title="Lock Elective Assignments"
        content="Are you sure you want to lock these elective assignments? Once locked, you will not be able to edit or assign subjects to students for this class and division."
        action={
          <LoadingButton variant="contained" color="error" onClick={handleLock} loading={isLocking}>
            Lock
          </LoadingButton>
        }
      />

      {/* QUICK SUMMARY DRAWER */}
      <AssignmentSummaryDrawer
        open={summaryDrawer.value}
        onClose={summaryDrawer.onFalse}
        total={summary.total}
        assigned={summary.assigned}
        unassigned={summary.unassigned}
        issues={summary.issues}
        preferenceMatchPct={summary.preferenceMatchPct}
        activeFilter={statusFilter}
        onFilter={setStatusFilter}
        onOpenIssues={issuesDrawer.onTrue}
      />

      {/* VALIDATION ISSUES DRAWER */}
      <ValidationIssuesDrawer
        open={issuesDrawer.value}
        onClose={issuesDrawer.onFalse}
        issues={validationIssues}
        onGoToStudent={handleGoToStudent}
      />

      {/* REVIEW AND LOCK DIALOG */}
      <ReviewAndLockDialog
        open={canAdd && reviewDrawer.value}
        onClose={reviewDrawer.onFalse}
        total={summary.total}
        assigned={summary.assigned}
        unassigned={summary.unassigned}
        subjectCapacity={subjectCapacity}
        preferenceMatchPct={summary.preferenceMatchPct}
        canLock={canLock}
        hasUnsavedChanges={hasUnsavedChanges}
        isLocked={isLocked}
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

      {navigationConfirmation}
    </Box>
  );
};

export default AssignElectiveSubject;
