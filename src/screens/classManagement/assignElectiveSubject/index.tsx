'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { Save, Lock, LockOpen } from '@mui/icons-material';
import React, { useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Alert, Button, Tooltip, AlertTitle, Typography } from '@mui/material';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useGetStudentElectiveAssignmentsQuery,
  useLockStudentElectiveAssignmentsMutation,
  useUpdateStudentElectiveAssignmentsMutation,
} from 'src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment';

const AssignElectiveSubject = () => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const [electiveGroupId, setElectiveGroupId] = useState<string>('');

  const [students, setStudents] = useState<any[]>([]);
  const [studentSelections, setStudentSelections] = useState<Record<string, string>>({});

  const resetDialog = useBoolean();
  const saveDialog = useBoolean();
  const lockDialog = useBoolean();

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

  // Deduplicate by electiveGroupId and skip records where the name is null/empty.
  // The subject-assignments endpoint returns one row per subject, so the same
  // electiveGroupId appears multiple times; only some rows carry a non-null name.
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
    setStudentSelections({});
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

  // --------------------------------------------
  // PROCESS GET API RESPONSE
  // --------------------------------------------
  useEffect(() => {
    if (assignmentData?.records) {
      setStudents(assignmentData.records);

      const initial: Record<string, string> = {};
      assignmentData.records.forEach((st: any) => {
        if (st.selectedSubjectId) {
          initial[st.studentId] = st.selectedSubjectId;
        }
      });

      // Prevent setState inside render → schedule after paint
      requestAnimationFrame(() => {
        setStudentSelections(initial);
      });
    }
  }, [assignmentData]);

  // --------------------------------------------
  // BULK SELECT (HEADER)
  // --------------------------------------------
  const handleHeaderSubjectClick = (subjectId: string) => {
    if (isLocked) return;
    const isSame = selectedHeaderSubject === subjectId;

    if (isSame) {
      setStudentSelections({});
      return;
    }

    const selections: Record<string, string> = {};
    students.forEach((s) => {
      selections[s.studentId] = subjectId;
    });

    setStudentSelections(selections);
  };

  // --------------------------------------------
  // INDIVIDUAL ROW CLICK
  // --------------------------------------------
  const handleStudentSubjectClick = (studentId: string, subjectId: string) => {
    if (isLocked) return;
    setStudentSelections((prev) => {
      const updated = { ...prev, [studentId]: subjectId };
      return updated;
    });
  };

  const isLocked = !!assignmentData?.isLocked;

  const selectedHeaderSubject = useMemo(() => {
    if (!students || students.length === 0) return '';
    const firstSel = studentSelections[students[0].studentId];
    if (!firstSel) return '';
    const allSame = students.every((s) => studentSelections[s.studentId] === firstSel);
    return allSame ? firstSel : '';
  }, [studentSelections, students]);

  const hasSelections = Object.keys(studentSelections).length > 0;

  const allStudentsAssigned = useMemo(
    () => students.length > 0 && students.every((st) => studentSelections[st.studentId]),
    [studentSelections, students]
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!assignmentData?.records) return false;
    if (students.length !== assignmentData.records.length) return true;
    return students.some(
      (st) =>
        studentSelections[st.studentId] !==
        assignmentData.records.find((r: any) => r.studentId === st.studentId)?.selectedSubjectId
    );
  }, [studentSelections, assignmentData, students]);

  const canLock = allStudentsAssigned && !hasUnsavedChanges && !isLocked;

  const getLockTooltip = () => {
    if (isLocked) {
      return 'These elective assignments are locked and cannot be modified.';
    }
    if (!allStudentsAssigned) {
      return 'Assign elective subjects to all students before locking.';
    }
    if (hasUnsavedChanges) {
      return 'Save your changes before locking.';
    }
    return 'Lock assignments. Warning: Once locked, you cannot modify student elective assignments.';
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
  // RESET
  // --------------------------------------------
  const handleReset = () => {
    setStudentSelections({});
    resetDialog.onFalse();

    shikshaMitraToast.success({ message: 'Selections reset successfully!' });
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
      refetchElectives();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to lock assignments.' });
    }
  };

  // --------------------------------------------
  // UI
  // --------------------------------------------

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Student Elective Assignment"
        description="Assign elective subjects based on student preference."
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Student Elective Assignment' },
        ]}
      />

      {/* MAIN CARD */}

      {/* FILTER & ACTIONS */}
      <Card sx={{ p: 1, mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              flexGrow: 1,
            }}
          >
            <CustomSelect
              label="Class"
              options={allClass}
              value={classes}
              labelKey="name"
              valueKey="id"
              onChange={(v) => setClasses(v as string)}
              formControlProps={{ sx: { minWidth: '200px' } }}
            />

            <CustomSelect
              label="Division"
              options={allDivision}
              value={division}
              labelKey="name"
              valueKey="id"
              isLoading={isLoading || isFetching}
              disabled={!classes}
              onChange={(v) => setDivision(v as string)}
              formControlProps={{ sx: { minWidth: '200px' } }}
            />

            <CustomSelect
              label="Elective Group"
              value={electiveGroupId}
              onChange={(v) => setElectiveGroupId(v as string)}
              labelKey="name"
              valueKey="id"
              isLoading={isLoading || isFetching}
              options={electiveGroups}
              disabled={!division}
              formControlProps={{ sx: { minWidth: '200px' } }}
            />
          </Box>

          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}
          >
            {!isLocked && (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
                  disabled={!hasSelections}
                  onClick={() => resetDialog.onTrue()}
                  size="medium"
                  sx={{ px: 3 }}
                >
                  Reset
                </Button>

                <LoadingButton
                  variant="contained"
                  startIcon={<Save />}
                  disabled={!hasSelections}
                  onClick={() => saveDialog.onTrue()}
                  size="medium"
                  loading={isSaving}
                  sx={{ px: 3, boxShadow: (theme) => theme.customShadows.z8 }}
                >
                  Save
                </LoadingButton>
              </>
            )}

            <Tooltip title={getLockTooltip()} arrow>
              <span>
                <LoadingButton
                  variant="contained"
                  color={isLocked ? 'success' : 'error'}
                  startIcon={isLocked ? <Lock /> : <LockOpen />}
                  disabled={!canLock}
                  onClick={() => lockDialog.onTrue()}
                  size="medium"
                  loading={isLocking}
                  sx={{ px: 3, boxShadow: (theme) => theme.customShadows.z8 }}
                >
                  {isLocked ? 'Locked' : 'Lock'}
                </LoadingButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Card>

      {isLocked && (
        <Alert
          severity="error"
          variant="standard"
          icon={<Lock sx={{ width: 22, height: 22 }} />}
          sx={{ mb: 1.5 }}
          // sx={{
          //   mb: 1.5,
          //   borderRadius: 1.5,
          //   borderWidth: '1px',
          //   backgroundColor: (theme) =>
          //     theme.palette.mode === 'dark' ? 'rgba(255, 167, 38, 0.05)' : 'rgba(255, 244, 229, 0.5)',
          //   borderColor: (theme) =>
          //     theme.palette.mode === 'dark' ? 'rgba(255, 167, 38, 0.3)' : 'rgba(255, 224, 178, 1)',
          //   color: (theme) =>
          //     theme.palette.mode === 'dark' ? '#FFE0B2' : '#E65100',
          //   '& .MuiAlert-icon': {
          //     color: '#FF9800',
          //   },
          // }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Assignments Locked</AlertTitle>
          These elective subject assignments have been finalized and locked. Editing is disabled.
        </Alert>
      )}

      {/* TABLE */}

      <CustomizableTable
        tableId="elective-table"
        data={students}
        isLoading={isElectiveLoading || isElectiveFetching}
        noDataText={<>No Students Found</>}
        columns={[
          { id: 'studentName', label: 'Student Name', minWidth: '200px', align: 'left' },
          { id: 'rollNo', label: 'Roll No.', minWidth: '120px', align: 'left' },
          // { id: 'studentPreference', label: 'Preference', minWidth: '200px' },
          {
            id: 'electiveSubjects',
            label: '',
            minWidth: '220px',
            isFilter: false,
            isSort: false,
            align: 'left',
            renderColumn: () => {
              if (!students || students.length === 0) return null;

              const subjects = students[0]?.selectableSubjects || [];

              return (
                <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
                  {subjects.map((s: any) => {
                    const isSelected = selectedHeaderSubject === s.subjectId;
                    return (
                      <Box
                        key={s.subjectId}
                        onClick={() => handleHeaderSubjectClick(s.subjectId)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          pl: 1,
                          pr: 1.5,
                          py: 0.625,
                          borderRadius: 1,
                          border: '1px solid',
                          cursor: isLocked ? 'default' : 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.18s ease',
                          pointerEvents: isLocked ? 'none' : 'auto',
                          ...(isSelected
                            ? {
                                boxShadow: `0 1px 4px ${s.subjectColor}30`,
                                '&:hover': {
                                  backgroundColor: isLocked ? 'transparent' : `${s.subjectColor}22`,
                                },
                              }
                            : {
                                opacity: isLocked ? 0.3 : 0.6,
                                '&:hover': {
                                  backgroundColor: isLocked ? 'transparent' : 'background.paper',
                                  borderColor: isLocked ? 'divider' : 'divider',
                                },
                              }),
                        }}
                      >
                        <Box
                          sx={{
                            width: 3,
                            height: 16,
                            borderRadius: 1,
                            flexShrink: 0,
                            backgroundColor: isSelected ? s.subjectColor : 'grey.300',
                            transition: 'background-color 0.18s ease',
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? 'text.primary' : 'text.secondary',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          {s.subjectName}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              );
            },

            render: (_, row) => (
              <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
                {row.selectableSubjects?.map((s: any) => {
                  const isSelected = studentSelections[row.studentId] === s.subjectId;

                  return (
                    <Box
                      key={s.subjectId}
                      onClick={() => handleStudentSubjectClick(row.studentId, s.subjectId)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pl: 1,
                        pr: 1.5,
                        py: 0.625,
                        borderRadius: 1,
                        border: '1px solid',
                        cursor: isLocked ? 'default' : 'pointer',
                        userSelect: 'none',
                        transition: 'all 0.18s ease',
                        pointerEvents: isLocked ? 'none' : 'auto',
                        ...(isSelected
                          ? {
                              boxShadow: `0 1px 4px ${s.subjectColor}30`,
                              '&:hover': {
                                backgroundColor: isLocked ? 'transparent' : `${s.subjectColor}22`,
                              },
                            }
                          : {
                              opacity: isLocked ? 0.3 : 0.6,
                              '&:hover': {
                                backgroundColor: isLocked ? 'transparent' : 'background.paper',
                                borderColor: isLocked ? 'divider' : 'divider',
                              },
                            }),
                      }}
                    >
                      <Box
                        sx={{
                          width: 3,
                          height: 16,
                          borderRadius: 1,
                          flexShrink: 0,
                          backgroundColor: isSelected ? s.subjectColor : 'grey.300',
                          transition: 'background-color 0.18s ease',
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? 'text.primary' : 'text.secondary',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        {s.subjectName}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ),
          },
        ]}
      />

      {/* RESET DIALOG */}
      <ConfirmDialog
        open={resetDialog.value}
        onClose={() => resetDialog.onFalse()}
        title="Reset Selections"
        content="Are you sure you want to clear all selected elective subjects?"
        action={
          <Button variant="contained" color="error" onClick={handleReset}>
            Reset
          </Button>
        }
      />

      {/* SAVE DIALOG */}
      <ConfirmDialog
        open={saveDialog.value}
        onClose={() => saveDialog.onFalse()}
        title="Save Changes"
        content="Are you sure you want to save these elective assignments?"
        action={
          <LoadingButton variant="contained" onClick={handleSave} loading={isSaving}>
            Save
          </LoadingButton>
        }
      />

      {/* LOCK DIALOG */}
      <ConfirmDialog
        open={lockDialog.value}
        onClose={() => lockDialog.onFalse()}
        title="Lock Elective Assignments"
        content="Are you sure you want to lock these elective assignments? Once locked, you will not be able to edit or assign subjects to students for this class and division."
        action={
          <LoadingButton variant="contained" color="error" onClick={handleLock} loading={isLocking}>
            Lock
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default AssignElectiveSubject;
