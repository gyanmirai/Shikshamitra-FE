'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Save, RestartAlt } from '@mui/icons-material';
import { Box, Button, TextField, Autocomplete } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AssignElectiveSubject = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

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
  }, [allClass, classes, setDivision]);

  // State to store the selected elective subject from dropdown
  const [electiveSubject, setElectiveSubject] = useState<string>('');

  // State to store the selected elective subject for individual students in the table
  const [selectedElectiveSubject, setSelectedElectiveSubject] = useState<string>('');

  // Available elective subject options that can be assigned to students
  const teacherOptions = [
    { id: '1', name: 'Physics' },
    { id: '2', name: 'Chemistry' },
    { id: '3', name: 'Biology' },
    { id: '4', name: 'Computer Science' },
    { id: '5', name: 'Economics' },
  ];
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Allocate Elective Subjects"
        description="Assign elective subjects to students based on their preferences and academic requirements. Manage and track student elective choices efficiently through this centralized system."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
          { name: 'Allocate Elective Subjects' },
        ]}
        sx={{ px: 1, mb: 2 }}
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
            label="Elective Subject"
            labelKey="name"
            valueKey="id"
            disabled={!division}
            options={[
              { id: '1', name: 'Physics' },
              { id: '2', name: 'Chemistry' },
              { id: '3', name: 'Biology' },
              { id: '4', name: 'Computer Science' },
              { id: '5', name: 'Economics' },
            ]}
            value={electiveSubject}
            onChange={(value) => {
              setElectiveSubject(value as string);
            }}
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
          />
        </Box>

        {/* Right side - Save Button */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<RestartAlt />} onClick={() => {}}>
            Reset
          </Button>
          <Button
            startIcon={<Save />}
            variant="contained"
            disabled={!classes || !division || !electiveSubject}
          >
            Save
          </Button>
        </Box>
      </Box>

      <CustomizableTable
        tableId="elective-subject-table"
        noDataText={<>No Bulk Update Data Found </>}
        searchFieldProps={{
          placeholder: 'Search by Sr. No, GR No, Name...',
          label: 'Search by Sr. No, GR No, Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        columns={[
          { id: 'srNo', label: 'Sr. No.', minWidth: '150px', align: 'left' },
          { id: 'grNo', label: 'GR No.', minWidth: '200px', align: 'left' },
          { id: 'name', label: 'Name', minWidth: '200px', align: 'left' },
          {
            id: 'electiveSubject',
            label: 'Elective Subject',
            isSort: false,
            minWidth: '200px',
            align: 'left',
            isFilter: false,
            // renderColumn: (row: any) => <TextField size="small" label={headerLabel || 'hello'} />,
            // render: (value, row: any) => renderDynamicField({ value, row , selectedSubCategory}),
            render: (value, row: any) => (
              <Autocomplete
                options={teacherOptions}
                getOptionLabel={(option) => option.name}
                value={teacherOptions.find((opt) => opt.id === division) || null}
                onChange={(_, newValue) => {
                  setSelectedElectiveSubject(newValue?.id || '');
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Elective Subject" variant="outlined" size="small" />
                )}
                sx={{ minWidth: '200px', width: '100%' }}
              />
            ),

            // render: (row: any) => <TextField size="small" label={selectedSubCategory?.name} />,
          },
        ]}
        data={[
          {
            srNo: 1,
            grNo: 'GR001',
            name: 'Aarav Sharma',
            electiveSubject: '1', // Physics
          },
          {
            srNo: 2,
            grNo: 'GR002',
            name: 'Diya Mehta',
            electiveSubject: '3', // Biology
          },
          {
            srNo: 3,
            grNo: 'GR003',
            name: 'Kabir Patel',
            electiveSubject: '4', // Computer Science
          },
          {
            srNo: 4,
            grNo: 'GR004',
            name: 'Meera Desai',
            electiveSubject: '2', // Chemistry
          },
          {
            srNo: 5,
            grNo: 'GR005',
            name: 'Ishaan Joshi',
            electiveSubject: '5', // Economics
          },
        ]}
      />
    </Box>
  );
};
export default AssignElectiveSubject;
