'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { convertBase64Format } from 'src/utils/base64Formate';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Avatar, Checkbox, Typography, IconButton } from '@mui/material';
import {
  PayrollStatus,
  PayrollStatusColor,
  PayrollStatusOptions,
} from 'src/enums/payroll-status-type';
import {
  useLazyGetRunPayrollPreviewQuery,
  useGenerateAndLockPayrollMutation,
} from 'src/redux/runPayroll/runPayrollApi';

import { SalaryDetailsTableCard } from '../salarySlip-generate/salarySlipGenerate';

const RunPayroll = () => {
  const deductionDialog = useBoolean();
  const isPayrollOpen = useBoolean();
  const lockConfirmDialog = useBoolean();
  const [month, setMonth] = useState<Dayjs | null>(dayjs());
  const [selectedBoard, setSelectedBoard] = useState('');
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const currentBoards = currentYear?.boards || [];
    setBoards(currentBoards);
    if (!selectedBoard && currentBoards.length > 0) {
      setSelectedBoard(currentBoards[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear?.boards]);

  const [
    fetchRunPayrollPreview,
    { data: getRunPayrollPreviewData, isLoading: getRunPayrollPreviewLoading },
  ] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetRunPayrollPreviewQuery,
  });

  const [generateAndLockPayroll, { isLoading: generateAndLockPayrollLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useGenerateAndLockPayrollMutation,
    });

  const tableData = useMemo(
    () => getRunPayrollPreviewData?.items || [],
    [getRunPayrollPreviewData?.items]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'checkBox',
        align: 'center',
        minWidth: '60px',
        isSort: false,
        sticky: true,
        isFilter: false,
        label: '',
        renderColumn() {
          const pendingEmployees = (tableData || []).filter(
            (emp: any) => emp?.status?.toLowerCase() !== 'locked'
          );
          const isAllSelected =
            pendingEmployees.length > 0 &&
            pendingEmployees.every((emp: any) => selectedEmployeeIds.includes(emp.id));
          return (
            <Checkbox
              checked={isAllSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEmployeeIds(pendingEmployees.map((emp: any) => emp.id));
                } else {
                  setSelectedEmployeeIds([]);
                }
              }}
            />
          );
        },
        render(value, row) {
          const isChecked = selectedEmployeeIds.includes(row.id);
          return (
            <Checkbox
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEmployeeIds((prev) => [...prev, row.id]);
                } else {
                  setSelectedEmployeeIds((prev) => prev.filter((id) => id !== row.id));
                }
              }}
            />
          );
        },
      },
      {
        id: 'employeeName',
        label: 'Employee Name',
        minWidth: '180px',
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
        label: 'Working Days',
        minWidth: '170px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'totalPresentDays',
        label: 'Present Days',
        minWidth: '170px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'totalAbsentDays',
        label: 'Absent Days',
        minWidth: '170px',
        align: 'left',
        filterType: 'number',
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
        minWidth: '180px',
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
                sx={{ zIndex: 0 }}
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
      {
        id: 'lastMonthSalary',
        label: 'Last Month Salary',
        minWidth: '130px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: '130px',
        align: 'left',
        sticky: true,
        filterType: 'enum',
        enumOptions: PayrollStatusOptions,
        render(value) {
          return (
            <Label variant="soft" color={PayrollStatusColor[value as PayrollStatus] as any}>
              {value === PayrollStatus.Locked ? 'Locked' : 'Pending'}
            </Label>
          );
        },
      },
    ],
    [deductionDialog, tableData, selectedEmployeeIds]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Run Payroll"
        links={[{ name: 'HR/Staff' }, { name: 'Payroll Management' }, { name: 'Run Payroll' }]}
        description="Run payroll by selecting a month, and verify details before processing."
      />
      {/* <StepsForPayroll /> */}

      <Card sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <CustomSelect
            label="Board"
            options={boards || []}
            labelKey="name"
            valueKey="id"
            value={selectedBoard}
            onChange={(value) => {
              setSelectedBoard(value as string);
            }}
            formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
          />

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
            {!getRunPayrollPreviewData?.isGenerated && (
              <LoadingButton
                variant="contained"
                loading={getRunPayrollPreviewLoading}
                startIcon={<Iconify icon="uiw:pay" />}
                disabled={!month}
                onClick={() => {
                  fetchRunPayrollPreview({
                    month: month?.format('MMMM-YYYY').toUpperCase(),
                  });
                  isPayrollOpen.onTrue();
                }}
                size="small"
                sx={{ px: '32px' }}
              >
                Run Payroll
              </LoadingButton>
            )}
          </Box>
        </Box>
      </Card>
      {month && (
        <Card
          sx={{ p: 1.5, mt: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        >
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
            <Box display="flex" gap={1}>
              <CustomTooltip
                title="Lock the payroll for the selected employees. Locked payrolls cannot be modified."
                placement="top"
                arrow
              >
                <span>
                  <LoadingButton
                    variant="contained"
                    startIcon={<Iconify icon="mdi:lock-outline" />}
                    disabled={(() => {
                      if (selectedEmployeeIds.length === 0) return true;
                      const selectedRows = tableData.filter((emp: any) =>
                        selectedEmployeeIds.includes(emp.id)
                      );
                      const hasPending = selectedRows.some(
                        (emp: any) => emp?.status?.toLowerCase() !== 'locked'
                      );
                      return !hasPending;
                    })()}
                    size="small"
                    onClick={() => lockConfirmDialog.onTrue()}
                  >
                    Lock
                  </LoadingButton>
                </span>
              </CustomTooltip>
            </Box>
          </Box>

          <CustomizableTable
            showCheckbox={selectedEmployeeIds.length !== 0}
            noDataText={<>No Data Found For Payroll</>}
            tableId="employee-salary-table"
            isLoading={getRunPayrollPreviewLoading}
            columns={columns}
            data={tableData || []}
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

      <ConfirmDialog
        open={lockConfirmDialog.value}
        onClose={lockConfirmDialog.onFalse}
        title="Lock Payroll"
        icon="warning"
        content={
          <>
            Are you sure you want to lock the payroll for{' '}
            <strong>{selectedEmployeeIds.length} employee(s)</strong>? This action cannot be undone.
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={generateAndLockPayrollLoading}
            onClick={async () => {
              try {
                const res = await generateAndLockPayroll({
                  month: month?.format('MMMM-YYYY').toUpperCase(),
                  boardId: selectedBoard,
                }).unwrap();
                shikshaMitraToast.success({
                  message: res?.message || 'Payroll locked successfully.',
                });
                lockConfirmDialog.onFalse();
              } catch (error: any) {
                console.error('Error locking payroll:', error);
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to lock payroll.',
                });
              }
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default RunPayroll;
