'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HomeworkAssignmentReports from '..';

const MOCK_DATA = [
  {
    id: '1',
    reportType: 'Daily Homework Report',
    createdBy: 'Admin User',
    createdOn: '01/12/2025',
  },
  {
    id: '2',
    reportType: 'Class Wise Homework Report',
    createdBy: 'Teacher A',
    createdOn: '30/11/2025',
  },
];

const HomeworkReportsList = () => {
  const addReportDialog = useBoolean(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          heading="Homework Reports"
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Homework & Assignment', href: '/academic/homeworkCreation' },
            { name: 'Reports' },
          ]}
          action={
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={addReportDialog.onTrue}
              sx={{ px: '32px' }}
            >
              Add Report
            </Button>
          }
        />
      )}

      {addReportDialog.value ? (
        <HomeworkAssignmentReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="homeworkReportsList"
          columns={[
            { id: 'reportType', label: 'Report Type', align: 'left' },
            { id: 'createdBy', label: 'Created By', align: 'left' },
            { id: 'createdOn', label: 'Created On', align: 'left' },
          ]}
          data={MOCK_DATA}
          isSearch
          isFilter
          tableContainerProps={{ sx: { height: '100%' } }}
        />
      )}
    </Box>
  );
};
export default HomeworkReportsList;
