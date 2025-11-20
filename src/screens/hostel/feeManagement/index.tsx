'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Button, TextField, Autocomplete } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CollectFeesForm from './components/feeCollectForm';
import StudentProfile from '../studentAllocation/compoenents/studentProfile';
import HostelStudentDetailedFeeComponent from './components/feeManagementTabs';

const HostelfeeManagement = () => {
  const [hostelType, setHostelType] = useState('');
  const [hostelName, setHostelName] = useState('');

  const [student, setStudent] = useState<string>('');
  // State to control visibility of student list
  const collectFeeDialog = useBoolean();

  // Query to fetch class data
  useQueryAndMutation({
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
        sx={{ mb: 2 }}
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
        {/* Hostel Dropdown */}
        <Autocomplete
          options={[
            { id: 'H1', name: 'Hostel A' },
            { id: 'H2', name: 'Hostel B' },
            { id: 'H3', name: 'Hostel C' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setHostelType(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Hostel Type"
              name="hostelType"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />

        {/* Room Dropdown */}
        <Autocomplete
          options={[
            { id: 'R101', name: 'Room 101' },
            { id: 'R102', name: 'Room 102' },
            { id: 'R103', name: 'Room 103' },
          ]}
          disabled={!hostelType}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setHostelName(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Hostel Name"
              name="hostelName"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
        <Autocomplete
          disabled={!hostelName}
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
