'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TeacherResourceTable from './component/teacher-resource-table';
import ResourceBookingDialog from './component/resource-booking-dialog';

import type { IResourceBookingFormValues } from './resource-booking-interface';

const TeacherBookingScreen = () => {
  const bookResourceDialog = useBoolean();
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <CustomBreadcrumbs
          heading="Book Resource"
          links={[{ name: 'Resource Management' }, { name: 'Book Resource ' }]}
          sx={{ mb: 2 }}
        />
        <Button
          onClick={() => {
            bookResourceDialog.onTrue();
          }}
          sx={{ mb: 2 }}
          variant="contained"
          startIcon={<Add />}
        >
          Book Resource
        </Button>
      </Box>

      <TeacherResourceTable />

      {bookResourceDialog.value && (
        <CustomDialog
          open={bookResourceDialog.value}
          handleClose={bookResourceDialog.onFalse}
          title="Book Resource"
        >
          <ResourceBookingDialog data={{} as IResourceBookingFormValues} isEdit={false} />
        </CustomDialog>
      )}
    </>
  );
};

export default TeacherBookingScreen;
