'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Save } from '@mui/icons-material';
import { Box, Button, useTheme } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
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
    { srNo: 1, rollNo: 'R001', name: 'Atre Prerna Bhanudas', preference: 'Computer' },
    { srNo: 2, rollNo: 'R002', name: 'Mehta Divya Hitesh', preference: 'Physical Training' },
    { srNo: 3, rollNo: 'R003', name: 'Patel Jiya Ganesh', preference: 'Computer' },
    { srNo: 4, rollNo: 'R004', name: 'Shah Rohan Nirav', preference: 'Art' },
    { srNo: 5, rollNo: 'R005', name: 'Desai Krisha Manoj', preference: 'Computer' },
    { srNo: 6, rollNo: 'R006', name: 'Joshi Aarav Mihir', preference: 'Physical Training' },
    { srNo: 7, rollNo: 'R007', name: 'Kapadia Reeva Suresh', preference: 'Art' },
    { srNo: 8, rollNo: 'R008', name: 'Trivedi Anaya Harsh', preference: 'Computer' },
    { srNo: 9, rollNo: 'R009', name: 'Modi Parth Bhargav', preference: 'Art' },
    { srNo: 10, rollNo: 'R010', name: 'Rathod Yashika Sanjay', preference: 'Physical Training' },
  ],
  elective2: [
    { srNo: 1, rollNo: 'R001', name: 'Atre Prerna Bhanudas', preference: 'Hindi' },
    { srNo: 2, rollNo: 'R002', name: 'Mehta Divya Hitesh', preference: 'Sanskrit' },
    { srNo: 3, rollNo: 'R003', name: 'Patel Jiya Ganesh', preference: 'Hindi' },
    { srNo: 4, rollNo: 'R004', name: 'Shah Rohan Nirav', preference: 'Gujarati' },
    { srNo: 5, rollNo: 'R005', name: 'Desai Krisha Manoj', preference: 'Sanskrit' },
    { srNo: 6, rollNo: 'R006', name: 'Joshi Aarav Mihir', preference: 'Hindi' },
    { srNo: 7, rollNo: 'R007', name: 'Kapadia Reeva Suresh', preference: 'Gujarati' },
    { srNo: 8, rollNo: 'R008', name: 'Trivedi Anaya Harsh', preference: 'Sanskrit' },
    { srNo: 9, rollNo: 'R009', name: 'Modi Parth Bhargav', preference: 'Hindi' },
    { srNo: 10, rollNo: 'R010', name: 'Rathod Yashika Sanjay', preference: 'Sanskrit' },
  ],
};

const AssignElectiveSubject = () => {
  const theme = useTheme();
  // State for managing class-related data
  const [allClass, setAllClass] = useState<Standards[]>([]); // Stores all available classes
  const [classes, setClasses] = useState<string>(''); // Currently selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]); // Stores divisions for selected class
  const [division, setDivision] = useState<string>(''); // Currently selected division

  // State for managing student and subject selections
  const [studentSelections, setStudentSelections] = useState<Record<string, string>>({}); // Maps student GR numbers to selected subjects
  const [students, setStudents] = useState<any[]>([]); // List of students in current selection
  const [electiveSubject, setElectiveSubject] = useState<string>(''); // Currently selected elective subject group
  const [selectedElectiveSubject, setSelectedElectiveSubject] = useState<string>(''); // Subject selected for bulk assignment

  // Dialog control states
  const resetDialog = useBoolean(); // Controls visibility of reset confirmation dialog
  const saveDialog = useBoolean(); // Controls visibility of save confirmation dialog

  // Get global state from Redux
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Effect to populate classes when medium changes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Effect to update divisions when selected class changes
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

  // Handler for resetting all selections
  const handleReset = () => {
    setSelectedElectiveSubject('');
    setStudentSelections({});
    resetDialog.onFalse();
    shikshaMitraToast.success({ message: 'Reset successful' });
  };

  // Handler for saving current selections
  const handleSave = () => {
    // Add your save logic here
    saveDialog.onFalse();
    shikshaMitraToast.success({ message: 'Changes saved successfully' });
  };

  // Check if any student selections have been made
  const hasStudentSelections = Object.keys(studentSelections).length > 0;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Elective Assignment"
        description="Assign elective subjects to students based on their preferences and academic requirements. Manage and track student elective choices efficiently through this centralized system."
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Student Elective Assignment' },
        ]}
        sx={{ px: 1, mb: 2 }}
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
                        onClick={() => {
                          const isSame = selectedElectiveSubject === subj.id;
                          const newValue = isSame ? '' : subj.id;
                          setSelectedElectiveSubject(newValue);

                          if (!isSame) {
                            const newSelections = students.reduce(
                              (acc, student) => {
                                acc[student.grNo] = subj.id;
                                return acc;
                              },
                              {} as Record<string, string>
                            );
                            setStudentSelections(newSelections);
                          }
                        }}
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
                        onClick={() =>
                          setStudentSelections((prev) => ({
                            ...prev,
                            [row.grNo]: subj.id,
                          }))
                        }
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
        content="Are you sure you want to reset all selections?"
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
