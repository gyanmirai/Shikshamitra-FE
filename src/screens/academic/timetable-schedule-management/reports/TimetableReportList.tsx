'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TimetableReports from './TimetableReports';

const TimetableReportList = () => {
  const addReportDialog = useBoolean(false);

  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(permissions, `${academicPermissions.timetable.reports}.Add`);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          heading="Reports"
          links={[
            { name: 'Academic', href: '/academic/dashboard/' },
            {
              name: 'Timetable',
              href: '/academic/timetable-schedule-management/dashboard/',
            },
            { name: 'Reports' },
          ]}
          action={
            canAdd ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                onClick={addReportDialog.onTrue}
              >
                Add Report
              </Button>
            ) : null
          }
        />
      )}

      {addReportDialog.value ? (
        <TimetableReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="timetable-reports"
          columns={[
            {
              label: 'Name',
              id: 'reportName',
              minWidth: '90px',
              align: 'left',
              sticky: true,
            },
            {
              label: 'Category',
              id: 'reportCategory',
              minWidth: '90px',
              align: 'left',
            },
            {
              label: 'Description',
              id: 'reportDescription',
              minWidth: '170px',
              align: 'left',
            },
            {
              label: 'Generated Date',
              id: 'generatedDate',
              minWidth: '150px',
              align: 'left',
            },
            {
              label: 'Applied Filters',
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
              reportName: 'Class-wise Timetable Report',
              reportCategory: 'Timetable Reports',
              reportDescription: 'Weekly schedule for a specific class.',
              generatedDate: '01-12-2025',
              appliedFilters: [{ name: 'Class', value: '10th A' }],
              reportAction: 'View',
            },
            {
              reportName: 'Teacher-wise Timetable Report',
              reportCategory: 'Timetable Reports',
              reportDescription: 'Weekly schedule for a specific teacher.',
              generatedDate: '02-12-2025',
              appliedFilters: [{ name: 'Teacher', value: 'Ramesh Kumar' }],
              reportAction: 'View',
            },
            {
              reportName: 'Room Utilization Report',
              reportCategory: 'Timetable Reports',
              reportDescription: 'Usage details of classrooms.',
              generatedDate: '03-12-2025',
              appliedFilters: [{ name: 'Room', value: '101' }],
              reportAction: 'View',
            },
          ]}
        />
      )}
    </Box>
  );
};

export default TimetableReportList;
