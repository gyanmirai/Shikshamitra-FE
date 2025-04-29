'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Button, TextField, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CollectFeesForm from './components/feeCollectForm';
import StudentProfile from '../studentAllocation/compoenents/studentProfile';
import HostelStudentDetailedFeeComponent from './components/feeManagementTabs';

const HostelfeeManagement = () => {
  // State for selected class
  const [classes, setClasses] = useState<string>('');
  // State for selected division
  const [division, setDivision] = useState<string>('');
  // State for division options based on selected class
  const [student, setStudent] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  // State to control visibility of student list
  const [showStudents, setShowStudents] = useState(false);
  const collectFeeDialog = useBoolean();

  // Query to fetch class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  return (
    <Box display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Fee Collection"
        description="Student Fee Management For Hostel "
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Fee Management', href: '' },
          { name: 'Fee Collection', href: '' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            onClick={() => {
              collectFeeDialog.onTrue();
            }}
            disabled={!student}
            startIcon={<Iconify icon="game-icons:receive-money" />}
            variant="outlined"
            size="small"
          >
            Collect Fees
          </Button>
        }
      />
      <Box display="flex" alignItems="center" mb={2} gap={1}>
        <Autocomplete
          options={classData?.items || []}
          getOptionLabel={(option) => option.name || ''}
          value={classes ? classData?.items.find((item: Standards) => item.id === classes) : null}
          onChange={(_, value) => {
            setClasses(value?.id || '');
            setDivisionOptions(value?.divisions || []);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Class"
              name="className"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
        <Autocomplete
          disabled={!classes}
          options={divisionOptions || []}
          getOptionLabel={(option) => option.name || ''}
          value={division ? divisionOptions.find((item: Division) => item.id === division) : null}
          onChange={(_, value) => {
            setDivision(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Division"
              name="division"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
        <Autocomplete
          disabled={!division}
          options={[
            { id: '1', name: 'Student 1' },
            { id: '2', name: 'Student 2' },
            { id: '3', name: 'Student 3' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setStudent(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Student"
              name="student"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
      </Box>
      <StudentProfile studentId="1" />
      <HostelStudentDetailedFeeComponent studentId="1" />
      <CustomDialog
        open={collectFeeDialog.value}
        handleClose={collectFeeDialog.onFalse}
        title="Collect Fee Of John"
        maxWidth="md"
      >
        <CollectFeesForm
          open={collectFeeDialog.value}
          onClose={() => {
            collectFeeDialog.onFalse();
          }}
          student={student}
        />
      </CustomDialog>
    </Box>
  );
};

export default HostelfeeManagement;
