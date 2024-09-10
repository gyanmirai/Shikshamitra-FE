'use client';

import React from 'react';

import { Box, Button } from '@mui/material';
import { FileDownload } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const BulkStudentAddScreen = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Bulk Student Add"
        links={[{ name: 'Student' }, { name: 'Student Management' }, { name: 'Bulk Student Add' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
        <Button variant="outlined" onClick={dialog.onTrue}>
          Manually
        </Button>
        <Button startIcon={<FileDownload />} variant="contained">
          Import
        </Button>
      </Box>
      <CustomizableTable columns={[]} data={[]} />

      <CustomDialog
        maxWidth="md"
        title="Add Student"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <BulkStudentAdd />
      </CustomDialog>
    </Box>
  );
};

export default BulkStudentAddScreen;

const BulkStudentAdd = () => {
  const a = null;
  return 'sdsds';
};
