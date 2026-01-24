'use client';

import type { Dayjs } from 'dayjs';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { convertBase64Format } from 'src/utils/base64Formate';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Alert, Avatar, Button, Typography, IconButton } from '@mui/material';
import {
  useGetRunPayrollPreviewQuery,
  useGenerateAndLockPayrollMutation,
} from 'src/redux/runPayroll/runPayrollApi';

import { salaryData } from './component/verifyPayrollComponent';
import { SalaryDetailsTableCard } from '../salarySlip-generate/salarySlipGenerate';

const RunPayroll = () => {
  const deductionDialog = useBoolean();
  const isPayrollOpen = useBoolean();
  const [month, setMonth] = useState<Dayjs | null>(dayjs());

  const { data: getRunPayrollPreviewData, isLoading: getRunPayrollPreviewLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetRunPayrollPreviewQuery,
      params: { month: month?.format('MMMM-YYYY').toUpperCase() },
      options: {
        skip: !month,
      },
    });
  // console.log("getRunPayrollPreviewData---", getRunPayrollPreviewData)
  const [generateAndLockPayroll, { isLoading: generateAndLockPayrollLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useGenerateAndLockPayrollMutation,
    });

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'employeeName',
        label: 'Employee Name',
        minWidth: '160px',
        align: 'left',
        sticky: true,
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                alt={value}
                src={convertBase64Format(row.profilePicture)}
                sx={{ height: 32, width: 32 }}
              />{' '}
              {value} ({row.employeeIdentifier})
            </Box>
          );
        },
      },
      { id: 'employeeGroup', label: 'Employee Group', minWidth: '160px', align: 'left' },
      {
        id: 'totalWorkingDays',
        label: 'Total Working Days',
        minWidth: '170px',
        align: 'left',
      },
      {
        id: 'totalPresentDays',
        label: 'Total Present Days',
        minWidth: '170px',
        align: 'left',
      },
      {
        id: 'totalAbsentDays',
        label: 'Total Absent Days',
        minWidth: '170px',
        align: 'left',
      },
      {
        id: 'salary',
        label: 'Salary',
        minWidth: '100px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'grossSalary',
        label: 'Gross Salary',
        minWidth: '130px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'basicSalary',
        label: 'Basic Salary',
        minWidth: '130px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'totalDeduction',
        label: 'Total Deduction',
        minWidth: '150px',
        align: 'left',
        filterType: 'number',
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
              <IconButton
                onClick={() => {
                  deductionDialog.onTrue();
                }}
                size="small"
              >
                <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
              </IconButton>
            </Box>
          );
        },
      },
      {
        id: 'netSalary',
        label: 'Net Salary',
        filterType: 'number',
        minWidth: '130px',
        align: 'left',
      },
    ],
    [deductionDialog]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Run Payroll"
        links={[{ name: 'HR/Staff' }, { name: 'Payroll' }, { name: 'Run Payroll' }]}
        sx={{ mb: 2 }}
        description="Run payroll by selecting a month, and verify details before processing."
      />
      {/* <StepsForPayroll /> */}

      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
          <DatePicker
            label="Select Month *"
            views={['month']}
            format="MMMM"
            value={month}
            onChange={(newValue) => {
              setMonth(newValue);
            }}
            slotProps={{ textField: { size: 'small' } }}
            sx={{ width: '100%', maxWidth: '200px' }}
          />

          {/* Button aligned to the right */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {!getRunPayrollPreviewData?.data?.isGenerated && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="uiw:pay" />}
                disabled={!month}
                onClick={() => {
                  isPayrollOpen.onTrue();
                }}
                size="small"
                sx={{ px: '32px' }}
              >
                Run Payroll
              </Button>
            )}
          </Box>
        </Box>
        <Alert variant="outlined" severity="warning">
          Please ensure all payroll data is accurate and verified before proceeding. Once payroll is
          processed, any modifications may require additional steps.
        </Alert>
      </Card>
      {month && (
        <Card sx={{ p: 2, mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="h6">Employee Payable</Typography>
            <LoadingButton
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={() => {
                generateAndLockPayroll({
                  message: 'Payroll generated and locked successfully',
                  month: month?.format('MMMM-YYYY').toUpperCase(),
                });
              }}
              loading={generateAndLockPayrollLoading}
              size="small"
            >
              Submit
            </LoadingButton>
          </Box>

          <CustomizableTable
            wrapperProps={{ sx: { height: '400px' } }}
            noDataText={<>No Data Found For Payroll</>}
            tableId="employee-salary-table"
            isLoading={getRunPayrollPreviewLoading}
            columns={columns}
            data={salaryData}
          />
        </Card>
      )}

      <CustomDialog
        open={deductionDialog.value}
        handleClose={() => deductionDialog.onFalse()}
        title="Deduction History"
        maxWidth="sm"
      >
        <Box p={2}>
          <SalaryDetailsTableCard
            title="Deductions"
            subheader="Breakdown of deductions"
            icon="solar:minus-circle-linear"
            iconColor={{ bg: 'error.lighter', color: 'error.main' }}
            data={[]}
            tableId="deduction-table"
            nameColumnLabel="Deduction Type"
            noDataText="No Deduction Found"
          />
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default RunPayroll;
