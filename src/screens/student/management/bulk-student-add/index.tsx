'use client';

import React from 'react';

import { Box, Button } from '@mui/material';
import { FileDownload } from '@mui/icons-material';

import CustomizableTable from 'src/components/customizabaleTable';

const BulkStudentAddScreen = () => (
  // const dialog = useBoolean();
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
      <Button size="small" variant="outlined">
        Download Template
      </Button>
      <Button size="small" startIcon={<FileDownload />} variant="contained">
        Import
      </Button>
    </Box>
    <CustomizableTable
      tableId="bulk-student-add"
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
