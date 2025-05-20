'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Save, RestartAlt } from '@mui/icons-material';
import { Box, Button, TextField, Autocomplete } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AssignElectiveSubject = () => {
  // Query hook to fetch class data from the API
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // State to store the selected division
  const [division, setDivision] = useState<string>('');
  const [electiveSubject, setElectiveSubject] = useState<string>('');

  // State to store available division options
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // State to store the selected class
  const [classes, setClasses] = useState<string>('');
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
        heading="Assign Elective Subject to Students"
        description="Assign elective subjects to students based on their preferences and academic requirements. Manage and track student elective choices efficiently through this centralized system."
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Assign Elective Subject to Students' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {/* Left side - Selects */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <CustomSelect
            label="Class"
            name="class"
            options={classData?.items || []}
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
            value={classes}
            labelKey="name"
            valueKey="id"
            onChange={(value) => {
              const selectedClass: Standards = classData.items.find(
                (i: Standards) => i.id === value
              );
              setClasses(selectedClass?.id);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              const selectedDivision = divisionOptions.find((i: Division) => val === i.id);
              setDivision(val as string);
            }}
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
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
            onChange={(val) => {}}
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
          />
        </Box>

        {/* Right side - Save Button */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={() => {}}>
            Reset
          </Button>
          <Button
            startIcon={<Save />}
            size="small"
            variant="outlined"
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
          placeholder: 'Search by Sr. No, GR No, Name',
          label: 'Search by Sr. No, GR No, Name',
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
                  setElectiveSubject(newValue?.id || '');
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Elective Subject" variant="outlined" size="small" />
                )}
                sx={{ maxWidth: '600px', width: '100%' }}
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
