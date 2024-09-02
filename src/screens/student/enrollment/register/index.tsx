'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Paper, Button } from '@mui/material';

import { Label } from 'src/components/label';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RegisterForm from './RegisterForm';

const RegisterScreen = () => {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Registration"
        links={[{ name: 'Student' }, { name: 'Student Enroll' }, { name: 'Registration' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Registration
          </Button>
        }
      />
      <Paper sx={{ px: 1, py: 2 }}>
        <CustomizableTable
          columns={[
            { id: 'Organization', label: 'Organization' },
            { id: 'Code', label: 'Code' },
            { id: 'Name', label: 'Name' },
            { id: 'FirstName', label: 'First Name' },
            { id: 'MiddleName', label: 'Middle Name' },
            { id: 'EmployeeDesignation', label: 'Role' },
            {
              id: 'StatusName',
              label: 'Status',
              render(value, row) {
                return (
                  <Label variant="soft" color={value === 'Active' ? 'success' : 'error'}>
                    {value}
                  </Label>
                );
              },
            },
            {
              id: 'actions',
              label: 'Actions',
              isSort: false,
              //   render(value, row) {
              //     return (
              //       <ThreeDotsActions
              //         onClickThreeDots={() => {
              //           setEditData(row);
              //         }}
              //         actions={(props) => actions({ ...props, row })}
              //         placement="right-top"
              //       />
              //     );
              //   },
            },
          ]}
          data={[]}
        />
        <CustomDialog
          maxWidth="lg"
          open={open}
          handleClose={() => setOpen(false)}
          title="Registration"
        >
          <RegisterForm />
        </CustomDialog>
      </Paper>{' '}
    </Box>
  );
};

export default RegisterScreen;
