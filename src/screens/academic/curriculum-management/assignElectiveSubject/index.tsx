'use client';

import React, { useMemo } from 'react';
import { Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save, RestartAlt } from '@mui/icons-material';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { electiveGroups, useAssignElectiveSubject } from './hooks/useAssignElectiveSubject';

const AssignElectiveSubject = () => {
  const theme = useTheme();
  const {
    allClass,
    classes,
    setClasses,
    allDivision,
    division,
    setDivision,
    studentSelections,
    students,
    electiveSubject,
    setElectiveSubject,
    selectedElectiveSubject,
    handleSelectElectiveForStudent,
    handleApplyElectiveToAll,
  } = useAssignElectiveSubject();

  /**
   * Memoization Justification:
   * Memoizes standard/elective subject assignment columns configuration
   * to prevent re-creation of headers and cell render buttons.
   * This preserves focus and selection state of buttons inside each row.
   */
  const columns = useMemo(() => {
    const group = electiveGroups.find((g) => g.id === electiveSubject);
    const subjects = group?.subjects || [];

    return [
      {
        id: 'name',
        label: 'Student Name',
        minWidth: '200px',
        align: 'left' as const,
        sticky: true,
      },
      { id: 'rollNo', label: 'Roll No.', minWidth: '120px', align: 'left' as const },
      {
        id: 'electiveSubject',
        label: '',
        minWidth: '500px',
        align: 'left' as const,
        isSort: false,
        isFilter: false,
        renderColumn: () => (
          <Box display="flex" alignItems="center" gap={1}>
            {subjects.map((subj) => {
              const isSelected = selectedElectiveSubject === subj.id;
              return (
                <Button
                  key={subj.id}
                  variant={isSelected ? 'contained' : 'outlined'}
                  size="small"
                  color="primary"
                  onClick={() => handleApplyElectiveToAll(subj.id)}
                  sx={{
                    color: isSelected ? '#fff' : theme.palette.mode === 'dark' ? '#fff' : '#000',
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
        ),
        render: (_: any, row: any) => (
          <Box display="flex" alignItems="center" gap={1}>
            {subjects.map((subj) => {
              const isSelected = studentSelections[row.grNo] === subj.id;
              return (
                <Button
                  key={subj.id}
                  variant={isSelected ? 'contained' : 'outlined'}
                  size="small"
                  color="primary"
                  onClick={() => handleSelectElectiveForStudent(row.grNo, subj.id)}
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
        ),
      },
    ];
  }, [
    electiveSubject,
    selectedElectiveSubject,
    studentSelections,
    handleApplyElectiveToAll,
    handleSelectElectiveForStudent,
    theme,
  ]);

  return (
    <Box>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Student Elective Assignment"
        description="Assign elective subjects according to students preferences and academic needs. Also, manage selections through a centralized system. "
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Student Elective Assignment' },
        ]}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            onChange={(value) => setElectiveSubject(value as string)}
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
          />
        </Box>

        <Box display="flex" gap={1} justifyContent="flex-end">
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
        columns={columns}
        data={students}
      />
    </Box>
  );
};

export default AssignElectiveSubject;
