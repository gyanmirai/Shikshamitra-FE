'use client';

import React from 'react';

import { Box, Button } from '@mui/material';
import { FileDownload } from '@mui/icons-material';

import CustomizableTable from 'src/components/customizabaleTable';

const BulkStudentAddScreen = () => (
  // const dialog = useBoolean();
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
      {/* <Button variant="outlined" onClick={dialog.onTrue}>
          Manually
        </Button> */}
      <Button startIcon={<FileDownload />} variant="contained">
        Import
      </Button>
    </Box>
    <CustomizableTable
      columns={[
        { id: 'name', label: 'Name' },
        { id: 'rollNo', label: 'Roll No' },
        { id: 'board', label: 'Board' },
        { id: 'medium', label: 'Medium' },
        { id: 'organization', label: 'Organization' },
        { id: 'class', label: 'Class' },
        { id: 'division', label: 'Division' },
      ]}
      data={[]}
    />
  </Box>
);
export default BulkStudentAddScreen;
