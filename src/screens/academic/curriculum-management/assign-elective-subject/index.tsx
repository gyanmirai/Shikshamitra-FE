'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { Save, RestartAlt } from '@mui/icons-material';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizable-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const electiveGroups = [
  {
    id: 'elective1',
    name: 'Elective Group 1',
    subjects: [
      { id: 'computer', name: 'Computer' },
      { id: 'pt', name: 'Physical Training' },
    ],
  },
  {
    id: 'elective2',
    name: 'Elective Group 2',
    subjects: [
      { id: 'hindi', name: 'Hindi' },
      { id: 'sanskrit', name: 'Sanskrit' },
    ],
  },
];

const AssignElectiveSubject = () => {
  const theme = useTheme();
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  const [studentSelections, setStudentSelections] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<any[]>([]);

  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
    const dummyStudents = [
      { srNo: 1, rollNo: 'R001', name: 'Atre Prerna Bhanudas' },
      { srNo: 2, rollNo: 'R002', name: 'Mehta Divya Hitesh' },
      { srNo: 3, rollNo: 'R003', name: 'Patel Jiya Ganesh' },
      { srNo: 4, rollNo: 'R004', name: 'Shah Rohan Nirav' },
      { srNo: 5, rollNo: 'R005', name: 'Desai Krisha Manoj' },
      { srNo: 6, rollNo: 'R006', name: 'Joshi Aarav Mihir' },
      { srNo: 7, rollNo: 'R007', name: 'Kapadia Reeva Suresh' },
      { srNo: 8, rollNo: 'R008', name: 'Trivedi Anaya Harsh' },
      { srNo: 9, rollNo: 'R009', name: 'Modi Parth Bhargav' },
      { srNo: 10, rollNo: 'R010', name: 'Rathod Yashika Sanjay' },
    ];

    setElectiveSubject(electiveGroups[0].id);

    setStudents(dummyStudents);
    setStudentSelections({});
  }, [allClass, classes, setDivision]);

  // State to store the selected elective subject from dropdown
  const [electiveSubject, setElectiveSubject] = useState<string>('');

  // State to store the selected elective subject for individual students in the table
  const [selectedElectiveSubject, setSelectedElectiveSubject] = useState<string>('');

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Elective Assignment"
        description="Assign elective subjects according to students preferences and academic needs. Also, manage selections through a centralized system. "
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
          { name: 'Student Elective Assignment' },
        ]}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {/* Left side - Selects */}
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
            // disabled={!division}
            options={electiveGroups}
            value={electiveSubject}
            onChange={(value) => {
              setElectiveSubject(value as string);
            }}
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
          />
        </Box>

        {/* Right side - Save Button */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<RestartAlt />} onClick={() => {}} size="small">
            Reset
          </Button>
          <Button
            startIcon={<Save />}
            variant="contained"
            disabled={!classes || !division || !electiveSubject || selectedElectiveSubject === ''}
            size="small"
          >
            Save
          </Button>
        </Box>
      </Box>

      <CustomizableTable
        tableId="elective-subject-table"
        noDataText={<>No Students Found</>}
        searchFieldProps={{
          placeholder: 'Search by Sr. No, GR No, Student Name...',
          label: 'Search by Sr. No, GR No, Student Name...',
          sx: { maxWidth: '400px', width: '100%' },
        }}
        columns={[
          { id: 'name', label: 'Student Name', minWidth: '200px', align: 'left', sticky: true },
          { id: 'rollNo', label: 'Roll No.', minWidth: '120px', align: 'left' },
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
                        color="primary"
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
                          color: isSelected
                            ? '#fff' // For contained: always white text
                            : theme.palette.mode === 'dark'
                              ? '#fff'
                              : '#000', // For outlined: black in light, white in dark
                          borderColor: theme.palette.primary.main,
                          backgroundColor: isSelected ? theme.palette.primary.main : 'transparent',
                          '&:hover': {
                            backgroundColor: isSelected
                              ? theme.vars.palette.primary.dark
                              : theme.vars.palette.action.hover,
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
                        // color="primary"
                        // fontColor={isSelected? 'white' : 'primary'}
                        variant={isSelected ? 'contained' : 'outlined'}
                        size="small"
                        color="primary"
                        onClick={() =>
                          setStudentSelections((prev) => ({ ...prev, [row.grNo]: subj.id }))
                        }
                        sx={{
                          color: isSelected ? 'white' : 'primary',
                          borderColor: isSelected ? 'primary' : 'primary',
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
    </Box>
  );
};
export default AssignElectiveSubject;
