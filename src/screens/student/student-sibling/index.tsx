'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const StudentSiblingScreen = () => {
  const dialog = useBoolean();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canWrite = hasGrantedPermission(permissions, 'Students.Records.StudentList.Add');
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Sibling"
        links={[{ name: 'Student' }, { name: 'Student Record' }, { name: 'Student Sibling' }]}
        action={
          <Button disabled={!canWrite} startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
            Add Sibling
          </Button>
        }
      />
      <CustomizableTable columns={[]} data={[]} tableId="student-sibling" />
      <CustomDialog open={dialog.value && canWrite} handleClose={dialog.onFalse} title="Add Sibling">
        <SiblingForm />
      </CustomDialog>
    </Box>
  );
};

export default StudentSiblingScreen;

const SiblingForm = () => <Box>jh</Box>;
