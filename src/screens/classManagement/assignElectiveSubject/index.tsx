'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Save } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const electiveGroups = [
  {
    id: 'elective1',
    name: 'Tech & Fitness Group',
    subjects: [
      { id: 'computer', name: 'Computer', color: '#2196F3' },
      { id: 'pt', name: 'Physical Training', color: '#4CAF50' },
    ],
  },
  {
    id: 'elective2',
    name: 'Language Enrichment Group',
    subjects: [
      { id: 'hindi', name: 'Hindi', color: '#FF5722' },
      { id: 'sanskrit', name: 'Sanskrit', color: '#9C27B0' },
    ],
  },
];

const studentData = {
  elective1: [
    {
      srNo: 1,
      rollNo: 'R001',
      name: 'Atre Prerna Bhanudas',
      preference: 'Computer',
      grNo: 'GR001',
    },
    {
      srNo: 2,
      rollNo: 'R002',
      name: 'Mehta Divya Hitesh',
      preference: 'Physical Training',
      grNo: 'GR002',
    },
    { srNo: 3, rollNo: 'R003', name: 'Patel Jiya Ganesh', preference: 'Computer', grNo: 'GR003' },
    { srNo: 4, rollNo: 'R004', name: 'Shah Rohan Nirav', preference: 'Computer', grNo: 'GR004' },
    { srNo: 5, rollNo: 'R005', name: 'Desai Krisha Manoj', preference: 'Computer', grNo: 'GR005' },
    {
      srNo: 6,
      rollNo: 'R006',
      name: 'Joshi Aarav Mihir',
      preference: 'Physical Training',
      grNo: 'GR006',
    },
    {
      srNo: 7,
      rollNo: 'R007',
      name: 'Kapadia Reeva Suresh',
      preference: 'Computer',
      grNo: 'GR007',
    },
    { srNo: 8, rollNo: 'R008', name: 'Trivedi Anaya Harsh', preference: 'Computer', grNo: 'GR008' },
    { srNo: 9, rollNo: 'R009', name: 'Modi Parth Bhargav', preference: 'Computer', grNo: 'GR009' },
    {
      srNo: 10,
      rollNo: 'R010',
      name: 'Rathod Yashika Sanjay',
      preference: 'Physical Training',
      grNo: 'GR010',
    },
  ],
  elective2: [
    { srNo: 1, rollNo: 'R001', name: 'Atre Prerna Bhanudas', preference: 'Hindi', grNo: 'GR001' },
    { srNo: 2, rollNo: 'R002', name: 'Mehta Divya Hitesh', preference: 'Sanskrit', grNo: 'GR002' },
    { srNo: 3, rollNo: 'R003', name: 'Patel Jiya Ganesh', preference: 'Hindi', grNo: 'GR003' },
    { srNo: 4, rollNo: 'R004', name: 'Shah Rohan Nirav', preference: 'Hindi', grNo: 'GR004' },
    { srNo: 5, rollNo: 'R005', name: 'Desai Krisha Manoj', preference: 'Sanskrit', grNo: 'GR005' },
    { srNo: 6, rollNo: 'R006', name: 'Joshi Aarav Mihir', preference: 'Hindi', grNo: 'GR006' },
    {
      srNo: 7,
      rollNo: 'R007',
      name: 'Kapadia Reeva Suresh',
      preference: 'Hindi',
      grNo: 'GR007',
    },
    { srNo: 8, rollNo: 'R008', name: 'Trivedi Anaya Harsh', preference: 'Sanskrit', grNo: 'GR008' },
    { srNo: 9, rollNo: 'R009', name: 'Modi Parth Bhargav', preference: 'Hindi', grNo: 'GR009' },
    {
      srNo: 10,
      rollNo: 'R010',
      name: 'Rathod Yashika Sanjay',
      preference: 'Sanskrit',
      grNo: 'GR010',
    },
  ],
};

const AssignElectiveSubject = () => {
  // Theme hook for Material-UI styling
  const theme = useTheme();

  // State for managing class data
  const [allClass, setAllClass] = useState<Standards[]>([]); // Stores all available classes
  const [classes, setClasses] = useState<string>(''); // Currently selected class

  // State for managing division data
  const [allDivision, setAllDivision] = useState<Division[]>([]); // Stores all divisions for selected class
  const [division, setDivision] = useState<string>(''); // Currently selected division

  // State for managing student and subject selections
  const [studentSelections, setStudentSelections] = useState<Record<string, string>>({}); // Maps student GR numbers to selected subjects
  const [students, setStudents] = useState<any[]>([]); // List of students in current selection
  const [electiveSubject, setElectiveSubject] = useState<string>(''); // Currently selected elective subject group
  const [selectedElectiveSubject, setSelectedElectiveSubject] = useState<string>(''); // Subject selected for bulk assignment

  // Dialog control states
  const resetDialog = useBoolean(); // Controls visibility of reset confirmation dialog
  const saveDialog = useBoolean(); // Controls visibility of save confirmation dialog

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Effect to initialize classes when medium changes
  // Flattens education medium stages to get all available classes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Effect to handle class selection changes
  // Updates divisions, sets default division and elective subject, resets selections
  useEffect(() => {
    const selectedClass = allClass.find((org: any) => org?.id === classes);
    setAllDivision(selectedClass?.divisions || []);
    setDivision(selectedClass?.divisions?.[0]?.id || '');
    setElectiveSubject(electiveGroups[0].id);
    setStudentSelections({});
  }, [allClass, classes, setDivision]);

  // Effect to update student list when elective subject group changes
  useEffect(() => {
    if (electiveSubject) {
      setStudents(studentData[electiveSubject as keyof typeof studentData]);
    }
  }, [electiveSubject]);

  // Handles resetting all student elective selections
  // Clears selected subject and student selections, closes dialog and shows success message
  const handleReset = () => {
    setSelectedElectiveSubject('');
    setStudentSelections({});
    resetDialog.onFalse();
    shikshaMitraToast.success({
      message: 'Student elective assignments have been reset successfully',
    });
  };

  // Handles saving student elective selections
  // Closes save dialog and shows success message
  const handleSave = () => {
    saveDialog.onFalse();
    shikshaMitraToast.success({
      message: 'Student elective subject assignments have been saved successfully',
    });
  };

  // Handles clicking subject button in table header
  // Toggles subject selection for all students
  const handleHeaderSubjectClick = (subjId: string) => {
    const isSame = selectedElectiveSubject === subjId;
    setSelectedElectiveSubject(isSame ? '' : subjId);

    if (!isSame) {
      const newSelections = students.reduce(
        (acc, student) => {
          acc[student.grNo] = subjId;
          return acc;
        },
        {} as Record<string, string>
      );
      setStudentSelections(newSelections);
    } else {
      setStudentSelections({});
    }
  };

  // Handles clicking subject button for individual student
  // Updates subject selection for single student and checks if all students have same selection
  const handleStudentSubjectClick = (studentGrNo: string, subjId: string) => {
    setStudentSelections((prev) => {
      const newSelections = { ...prev, [studentGrNo]: subjId };

      // Check if all students have the same subject selected
      const allSameSubject = students.every((student) => newSelections[student.grNo] === subjId);
      setSelectedElectiveSubject(allSameSubject ? subjId : '');

      return newSelections;
    });
  };

  // Helper to check if any student selections exist
  const hasStudentSelections = Object.keys(studentSelections).length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Student Elective Assignment"
        description="Assign elective subjects according to students preferences and academic needs. Also, manage selections through a centralized system. "
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Student Elective Assignment' },
        ]}
        sx={{ mb: 2 }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          ml: 1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <CustomSelect
            options={allClass}
            label="Class"
            value={classes}
            onChange={(val) => setClasses(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
          />
          <CustomSelect
            options={allDivision}
            label="Division"
            value={division}
            onChange={(val) => setDivision(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
            disabled={!classes}
          />
          <CustomSelect
            label="Elective Group"
            labelKey="name"
            valueKey="id"
            options={electiveGroups}
            value={electiveSubject}
            onChange={(value) => {
              setElectiveSubject(value as string);
              setSelectedElectiveSubject('');
              setStudentSelections({});
            }}
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
          />
        </Box>

        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            onClick={() => resetDialog.onTrue()}
            disabled={!classes || !division || !electiveSubject || !hasStudentSelections}
            size="small"
          >
            Reset
          </Button>
          <Button
            startIcon={<Save />}
            variant="contained"
            onClick={() => saveDialog.onTrue()}
            disabled={!classes || !division || !electiveSubject || !hasStudentSelections}
            size="small"
          >
            Save
          </Button>
        </Box>
      </Box>
      <CustomizableTable
        tableId="elective-subject-table"
        noDataText={<>No Students Found</>}
        columns={[
          { id: 'name', label: 'Student Name', minWidth: '200px', align: 'left', sticky: true },
          { id: 'rollNo', label: 'Roll No.', minWidth: '120px', align: 'left' },
          { id: 'preference', label: 'Student Preference', minWidth: '200px', align: 'left' },
          {
            id: 'electiveSubject',
            label: '',
            minWidth: '500px',
            align: 'left',
            isSort: false,
            isFilter: false,
            renderColumn: () => {
              const group = electiveGroups.find((g) => g.id === electiveSubject);
              const subjects = group?.subjects || [];

              return (
                <Box display="flex" alignItems="center" gap={2}>
                  {subjects.map((subj) => {
                    const isSelected = selectedElectiveSubject === subj.id;
                    return (
                      <Button
                        key={subj.id}
                        variant={isSelected ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleHeaderSubjectClick(subj.id)}
                        sx={{
                          color: isSelected ? '#fff' : subj.color,
                          borderColor: subj.color,
                          backgroundColor: isSelected ? subj.color : 'transparent',
                          '&:hover': {
                            backgroundColor: isSelected ? subj.color : `${subj.color}20`,
                          },
                        }}
                      >
                        {subj.name}
                      </Button>
                    );
                  })}
                </Box>
              );
            },
            render: (_, row: any) => {
              const group = electiveGroups.find((g) => g.id === electiveSubject);
              const subjects = group?.subjects || [];

              return (
                <Box display="flex" alignItems="center" gap={2}>
                  {subjects.map((subj) => {
                    const isSelected = studentSelections[row.grNo] === subj.id;
                    return (
                      <Button
                        key={subj.id}
                        variant={isSelected ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleStudentSubjectClick(row.grNo, subj.id)}
                        sx={{
                          color: isSelected ? '#fff' : subj.color,
                          borderColor: subj.color,
                          backgroundColor: isSelected ? subj.color : 'transparent',
                          '&:hover': {
                            backgroundColor: isSelected ? subj.color : `${subj.color}20`,
                          },
                        }}
                      >
                        {subj.name}
                      </Button>
                    );
                  })}
                </Box>
              );
            },
          },
        ]}
        data={students}
      />
      <ConfirmDialog
        open={resetDialog.value}
        onClose={() => resetDialog.onFalse()}
        title="Reset"
        content="Are you sure you want to reset all selections ?"
        action={
          <Button
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            variant="contained"
            size="small"
            onClick={handleReset}
          >
            Reset
          </Button>
        }
      />
      <ConfirmDialog
        open={saveDialog.value}
        onClose={() => saveDialog.onFalse()}
        title="Save"
        content="Are you sure you want to save these changes ?"
        action={
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            variant="contained"
            size="small"
            onClick={handleSave}
          >
            Save
          </Button>
        }
      />
    </Box>
  );
};

export default AssignElectiveSubject;
