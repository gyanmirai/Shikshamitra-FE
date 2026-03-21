'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import CustomizableTable from 'src/components/customizable-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const StudentSiblingScreen = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Sibling"
        links={[{ name: 'Student' }, { name: 'Student Record' }, { name: 'Student Sibling' }]}
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
