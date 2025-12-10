'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CurriculumReports from './CurriculumReports';

const CurriculumReportList = () => {
  const addReportDialog = useBoolean(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          heading="Reports"
          links={[
            { name: 'Academic', href: '/academic/dashboard/' },
            { name: 'Curriculum Management', href: '/academic/curriculum-management/dashboard/' },
            { name: 'Reports' },
          ]}
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
          sx={{ mb: 1 }}
        />
      )}

      {addReportDialog.value ? (
        <CurriculumReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="curriculum-reports"
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
              reportName: 'Chapter Progress Report',
              reportCategory: 'Curriculum Reports',
              reportDescription: 'Status of chapters (Upcoming, In Progress, Completed).',
              generatedDate: '01-12-2025',
              appliedFilters: [
                { name: 'Subject', value: 'Mathematics' },
                { name: 'Class', value: '10th' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Subject-wise Chapter Coverage',
              reportCategory: 'Curriculum Reports',
              reportDescription: 'Coverage of chapters across subjects.',
              generatedDate: '02-12-2025',
              appliedFilters: [
                { name: 'Subject', value: 'Science' },
                { name: 'Class', value: '9th' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Curriculum Completion Report',
              reportCategory: 'Curriculum Reports',
              reportDescription: 'Overall completion status of the curriculum.',
              generatedDate: '03-12-2025',
              appliedFilters: [{ name: 'Class', value: 'All' }],
              reportAction: 'View',
            },
          ]}
        />
      )}
    </Box>
  );
};

export default CurriculumReportList;
