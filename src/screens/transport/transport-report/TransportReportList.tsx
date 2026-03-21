'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { Box, Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizable-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransportReportScreen from '.';

const TransportReportList = () => {
  const addReportDialog = useBoolean(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          heading="Reports"
          links={[{ name: 'Transport', href: '/transport/dashboard/' }, { name: 'Reports' }]}
          action={
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={addReportDialog.onTrue}
            >
              Report
            </Button>
          }
        />
      )}

      {addReportDialog.value ? (
        <TransportReportScreen addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="transport-reports"
          columns={[
            {
              label: 'Report Name',
              id: 'reportName',
              minWidth: '120px',
              align: 'left',
              sticky: true,
            },
            {
              label: 'Category',
              id: 'reportCategory',
              minWidth: '120px',
              align: 'left',
            },
            {
              label: 'Description',
              id: 'reportDescription',
              minWidth: '200px',
              align: 'left',
            },
            {
              label: 'Generated Date',
              id: 'generatedDate',
              minWidth: '150px',
              align: 'left',
            },
            {
              label: 'Filters Applied',
              id: 'appliedFilters',
              align: 'left',
              minWidth: '150px',
              render(value, row) {
                return (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {row.appliedFilters?.map((filter: any) => (
                      <Chip
                        key={filter.name}
                        size="small"
                        variant="soft"
                        label={`${filter.name}: ${filter.value}`}
                      />
                    ))}
                  </Box>
                );
              },
            },
            {
              label: 'Action',
              id: 'reportAction',
              minWidth: '40px',
              align: 'left',
              isFilter: false,
              isSort: false,
              sticky: true,
              render() {
                return (
                  <IconButton size="small" onClick={() => {}}>
                    <Iconify icon={GlobalIcons.report} />
                  </IconButton>
                );
              },
            },
          ]}
          data={[
            {
              reportName: 'Route Assignment Report',
              reportCategory: 'Transport Reports',
              reportDescription: 'List of students assigned to transport routes.',
              generatedDate: '01-12-2025',
              appliedFilters: [
                { name: 'Route', value: 'Route 1' },
                { name: 'Bus', value: 'Bus 12' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Bus Capacity Utilization',
              reportCategory: 'Transport Reports',
              reportDescription: 'Shows seat usage across all buses.',
              generatedDate: '02-12-2025',
              appliedFilters: [{ name: 'Bus', value: 'All' }],
              reportAction: 'View',
            },
            {
              reportName: 'Transport Fee Status',
              reportCategory: 'Transport Reports',
              reportDescription: 'Pending and collected fees for transport users.',
              generatedDate: '03-12-2025',
              appliedFilters: [{ name: 'Status', value: 'Pending' }],
              reportAction: 'View',
            },
          ]}
        />
      )}
    </Box>
  );
};

export default TransportReportList;
