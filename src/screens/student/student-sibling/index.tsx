'use client';

import React from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const StudentSiblingScreen = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Sibling"
        links={[{ name: 'Student' }, { name: 'Student Record' }, { name: 'Student Sibling' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
            Add Sibling
          </Button>
        }
      />
      <CustomizableTable columns={[]} data={[]} tableId="student-sibling" />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Add Sibling">
        <SiblingForm />
      </CustomDialog>
    </Box>
  );
};

export default StudentSiblingScreen;

const SiblingForm = () => <Box>jh</Box>;
