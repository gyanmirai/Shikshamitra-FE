'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceReports from '../index';

const FinanceReportsList = () => {
  const addReportDialog = useBoolean(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!addReportDialog.value && (
        <CustomBreadcrumbs
          heading="Reports"
          links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Reports' }]}
          action={
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={addReportDialog.onTrue}
            >
              Add Report
            </Button>
          }
          sx={{ mb: 1 }}
        />
      )}

      {addReportDialog.value ? (
        <FinanceReports addReportDialog={addReportDialog} />
      ) : (
        <CustomizableTable
          tableId="homework-reports"
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
              reportName: 'Homework Issuance Report',
              reportCategory: 'Homework',
              reportSubCategory: 'Issuance',
              reportDescription:
                'Details of homework assigned to students within a selected date range',
              generateReportDate: '01-12-2025',
              appliedFilters: [
                { name: 'From Date', value: '01-11-2025' },
                { name: 'To Date', value: '30-11-2025' },
                { name: 'Standard', value: '6th | 7th | 8th' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Homework Submission Report',
              reportCategory: 'Homework',
              reportSubCategory: 'Submission',
              reportDescription:
                'Track student homework submissions with status and late submission count',
              generateReportDate: '01-12-2025',
              appliedFilters: [
                { name: 'Subject', value: 'Maths | Science' },
                { name: 'Status', value: 'Submitted | Pending' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Pending Homework Report',
              reportCategory: 'Homework',
              reportSubCategory: 'Pending',
              reportDescription: 'Students who have not submitted homework by the due date',
              generateReportDate: '01-12-2025',
              appliedFilters: [
                { name: 'Division', value: 'A | B | C' },
                { name: 'Due Date', value: '28-11-2025' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Subject-wise Homework Report',
              reportCategory: 'Homework',
              reportSubCategory: 'Subject-wise',
              reportDescription:
                'Breakdown of homework assigned for each subject in selected standard',
              generateReportDate: '01-12-2025',
              appliedFilters: [
                { name: 'Standard', value: '9th' },
                { name: 'Subject', value: 'English | Math | Science' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Teacher-wise Homework Report',
              reportCategory: 'Homework',
              reportSubCategory: 'Teacher-wise',
              reportDescription: 'Homework created and assigned by individual teachers',
              generateReportReportDate: '01-12-2025',
              generateReportDate: '01-12-2025',
              appliedFilters: [
                { name: 'Teacher', value: 'Kiran Mam | Parth Sir' },
                { name: 'Month', value: '11-2025' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Homework Evaluation Report',
              reportCategory: 'Homework',
              reportSubCategory: 'Evaluation',
              reportDescription: 'Marks, feedback, and evaluation details of submitted homework',
              generateReportDate: '01-12-2025',
              appliedFilters: [
                { name: 'Subject', value: 'Science' },
                { name: 'Standard', value: '10th' },
              ],
              reportAction: 'View',
            },
          ]}
        />
      )}
    </Box>
  );
};
export default FinanceReportsList;
