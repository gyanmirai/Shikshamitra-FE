'use client';

import React from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AddProcurementRequestDialog from './component/add-procurement-request-dialog';
import TeacherProcurementRequestTable from './component/teacher-procurement-request-table';

import type { IProcurementAndVendorFromValues } from './procurement-and-vendor-interface';

const ManageProcurementRequestScreenTeacher = () => {
  const addNewProcurementRequest = useBoolean();
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <CustomBreadcrumbs
          heading="Procurement Request"
          links={[{ name: 'Resource Management' }, { name: 'Procurement Request' }]}
          sx={{ px: 1, mb: 2 }}
        />
        <Button
          onClick={() => {
            addNewProcurementRequest.onTrue();
          }}
          sx={{ px: 1, mb: 2 }}
          variant="contained"
          startIcon={<Add />}
        >
          New Request
        </Button>
      </Box>
      <TeacherProcurementRequestTable />

      {addNewProcurementRequest.value && (
        <CustomDialog
          maxWidth="md"
          open={addNewProcurementRequest.value}
          handleClose={addNewProcurementRequest.onFalse}
          title="Add Procurement Request"
        >
          <AddProcurementRequestDialog
            data={{} as IProcurementAndVendorFromValues}
            isEdit={false}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default ManageProcurementRequestScreenTeacher;
