'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Save } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetElectiveGroupsQuery } from 'src/redux/academic-api/curriculum-management-api/setting/Elective-GroupApi';
import {
  useGetStudentElectiveAssignmentsQuery,
  useUpdateStudentElectiveAssignmentsMutation,
} from 'src/redux/class-management-api/student-elective-assignment/studentElectiveAssignment';

const AssignElectiveSubject = () => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const [electiveGroupId, setElectiveGroupId] = useState<string>('');

  const [students, setStudents] = useState<any[]>([]);
  const [studentSelections, setStudentSelections] = useState<Record<string, string>>({});
  const [selectedHeaderSubject, setSelectedHeaderSubject] = useState<string>('');

  const resetDialog = useBoolean();
  const saveDialog = useBoolean();

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // --------------------------------------------
  // FETCH ELECTIVE GROUPS
  // --------------------------------------------
  const { data: electiveGroupsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetElectiveGroupsQuery,
    params: { academicMediumId: medium?.id },
  });

  const electiveGroups = electiveGroupsData?.records || [];

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

    setStudents([]);
    setStudentSelections({});
    setSelectedHeaderSubject('');
  }, [allClass, classes]);

  // --------------------------------------------
  // GET ELECTIVE ASSIGNMENTS USING useQueryAndMutation
  // --------------------------------------------
  const {
    data: assignmentData,
    isLoading: isElectiveLoading,
    refetch: refetchElectives,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentElectiveAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      classId: classes,
      divisionId: division,
      electiveGroupId,
      search: '',
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
        setSelectedHeaderSubject('');
      });
    }
  }, [assignmentData]);

  // --------------------------------------------
  // BULK SELECT (HEADER)
  // --------------------------------------------
  const handleHeaderSubjectClick = (subjectId: string) => {
    const isSame = selectedHeaderSubject === subjectId;

    if (isSame) {
      setSelectedHeaderSubject('');
      setStudentSelections({});
      return;
    }

    setSelectedHeaderSubject(subjectId);

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
    setStudentSelections((prev) => {
      const updated = { ...prev, [studentId]: subjectId };

      const allSame = students.every((s) => updated[s.studentId] === subjectId);
      setSelectedHeaderSubject(allSame ? subjectId : '');

      return updated;
    });
  };

  const hasSelections = Object.keys(studentSelections).length > 0;

  // --------------------------------------------
  // PUT API USING useQueryAndMutation
  // --------------------------------------------
  const { updateStudentElectiveAssignments, isLoading: isSaving } = useQueryAndMutation({
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
      await updateStudentElectiveAssignments(payload);
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
    setSelectedHeaderSubject('');
    resetDialog.onFalse();

    shikshaMitraToast.success({ message: 'Selections reset successfully!' });
  };

  // --------------------------------------------
  // UI
  // --------------------------------------------

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Elective Assignment"
        description="Assign elective subjects based on student preference."
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Student Elective Assignment' },
        ]}
      />

      {/* MAIN CARD */}
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.card,
          p: 1.5,
        }}
      >
        {/* FILTER & ACTIONS */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 1,
            mb: 1,
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
              options={electiveGroups}
              disabled={!division}
              formControlProps={{ sx: { minWidth: '200px' } }}
            />
          </Box>

          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}
          >
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
          </Box>
        </Box>

        {/* TABLE */}
        <CustomizableTable
          tableId="elective-table"
          data={students}
          isLoading={isElectiveLoading}
          noDataText={<>No Students Found</>}
          columns={[
            { id: 'studentName', label: 'Student Name', minWidth: '200px' },
            { id: 'rollNo', label: 'Roll No.', minWidth: '120px' },
            { id: 'studentPreference', label: 'Preference', minWidth: '200px' },
            {
              id: 'electiveSubjects',
              label: '',
              minWidth: '500px',
              isFilter: false,
              isSort: false,
              renderColumn: () => {
                if (!students || students.length === 0) return null;

                const subjects = students[0]?.selectableSubjects || [];

                return (
                  <Box display="flex" gap={1.5}>
                    {subjects.map((s: any) => {
                      const isSelected = selectedHeaderSubject === s.subjectId;
                      return (
                        <Button
                          key={s.subjectId}
                          variant={isSelected ? 'contained' : 'outlined'}
                          onClick={() => handleHeaderSubjectClick(s.subjectId)}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: isSelected ? 'bold' : 'normal',
                            boxShadow: isSelected ? 2 : 0,
                            color: isSelected ? '#fff' : s.subjectColor,
                            borderColor: s.subjectColor,
                            backgroundColor: isSelected ? s.subjectColor : 'transparent',
                            '&:hover': {
                              backgroundColor: isSelected ? s.subjectColor : `${s.subjectColor}15`,
                              borderColor: s.subjectColor,
                              boxShadow: isSelected ? 3 : 0,
                            },
                          }}
                        >
                          {s.subjectName}
                        </Button>
                      );
                    })}
                  </Box>
                );
              },

              render: (_, row) => (
                <Box display="flex" gap={1.5}>
                  {row.selectableSubjects?.map((s: any) => {
                    const isSelected = studentSelections[row.studentId] === s.subjectId;

                    return (
                      <Button
                        key={s.subjectId}
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => handleStudentSubjectClick(row.studentId, s.subjectId)}
                        size="small"
                        sx={{
                          borderRadius: 1,
                          textTransform: 'none',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          boxShadow: isSelected ? 2 : 0,
                          color: isSelected ? '#fff' : s.subjectColor,
                          borderColor: s.subjectColor,
                          backgroundColor: isSelected ? s.subjectColor : 'transparent',
                          '&:hover': {
                            backgroundColor: isSelected ? s.subjectColor : `${s.subjectColor}15`,
                            borderColor: s.subjectColor,
                            boxShadow: isSelected ? 3 : 0,
                          },
                        }}
                      >
                        {s.subjectName}
                      </Button>
                    );
                  })}
                </Box>
              ),
            },
          ]}
        />
      </Box>

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
    </Box>
  );
};

export default AssignElectiveSubject;
