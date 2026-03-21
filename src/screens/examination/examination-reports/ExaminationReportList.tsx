'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { Box, Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizable-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ExaminationReports from '.';

const ExaminationReportsList = () => {
  const addReportDialog = useBoolean(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          heading="Reports"
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard/' },
            { name: 'Examination', href: '/examination/dashboard' },
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
        />
      )}

      {addReportDialog.value ? (
        <ExaminationReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="exam-reports"
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
              reportName: 'Student-wise Result Report',
              reportCategory: 'Result Analysis',
              reportDescription: 'Detailed marks and grades for each student for selected exam.',
              generatedDate: '01-12-2025',
              appliedFilters: [
                { name: 'Exam', value: 'Mid Term 1' },
                { name: 'Standard', value: '8th' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Subject-wise Performance Report',
              reportCategory: 'Performance Analysis',
              reportDescription:
                'Average score and distribution for each subject across divisions.',
              generatedDate: '01-12-2025',
              appliedFilters: [
                { name: 'Subject', value: 'Maths' },
                { name: 'Exam', value: 'Final Exam' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Top Performers Report',
              reportCategory: 'Student Ranking',
              reportDescription: 'List of highest-scoring students by standards.',
              generatedDate: '01-12-2025',
              appliedFilters: [
                { name: 'Grade', value: 'A1 | A2' },
                { name: 'Exam', value: 'Unit Test 2' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Weak Students Report',
              reportCategory: 'Student Ranking',
              reportDescription: 'Students who scored below passing marks in selected subjects.',
              generatedDate: '01-12-2025',
              appliedFilters: [
                { name: 'Subject', value: 'Science' },
                { name: 'Exam', value: 'Mid Term 2' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Division-wise Performance Report',
              reportCategory: 'Division Analysis',
              reportDescription: 'Performance comparison of divisions for selected exam.',
              generatedDate: '01-12-2025',
              appliedFilters: [
                { name: 'Division', value: 'A | B | C' },
                { name: 'Exam', value: 'Final Exam' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Overall Exam Summary Report',
              reportCategory: 'Summary',
              reportDescription: 'Pass percentage, average marks, and overall statistics.',
              generatedDate: '01-12-2025',
              appliedFilters: [
                { name: 'Standard', value: '10th' },
                { name: 'Exam', value: 'Board Prelims' },
              ],
              reportAction: 'View',
            },
          ]}
        />
      )}
    </Box>
  );
};

export default ExaminationReportsList;
