'use client';

import type { RootState } from 'src/redux/store';
import type { EmployeeOptionsResponse } from 'src/redux/hr/employeeApi';
import type { EmployeeOption } from 'src/screens/hr/leave-request/leave-request.utils';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { RouterLink } from 'src/routes/components/router-link';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useGetSalarySummaryQuery } from 'src/redux/hr/compensation-revision-api';
import { useGetEmployeeByIdQuery, useLazyGetEmployeeOptionsQuery } from 'src/redux/hr/employeeApi';
import {
  staffPayrollEditHref,
  staffPayrollProfileHref,
} from 'src/screens/hr/employee/payroll-profile-utils';
import {
  Box,
  Link,
  Stack,
  Alert,
  Paper,
  Button,
  Skeleton,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import { salaryEditorHref } from './salary-editor-navigation';
import { getLocalMonthKey } from './salary-structure-builder-utils';
import { formatPayrollMonth } from '../setting/esi-statutory-utils';
import { SalaryTotals, SalaryBreakdown, StatutorySummary } from './salary-summary-view';

export default function EmployeeSalaryStructureScreen() {
  const params = useSearchParams();
  return <SalaryStructureWorkspace key={params.get('employeeId') || ''} />;
}

function SalaryStructureWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const employeeId = params.get('employeeId')?.trim() || '';
  const hasRequestedMonth = params.has('month');
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.get('month') || '')
    ? params.get('month')!
    : getLocalMonthKey();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.compensationRevisionActions.manage
  );
  const canRead =
    canManage ||
    hasGrantedPermission(permissions, hrPermissions.payroll.compensationRevisionActions.view);
  const [selected, setSelected] = useState<EmployeeOption | null>(
    employeeId ? { id: employeeId, label: 'Loading staff…' } : null
  );
  const { currentData: employee } = useGetEmployeeByIdQuery(employeeId, {
    skip: !employeeId || !canRead,
  });
  const {
    currentData: summary,
    isFetching,
    isError,
    refetch,
  } = useGetSalarySummaryQuery({ employeeId, month }, { skip: !employeeId || !canRead });
  const [getEmployees] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeOptionsQuery,
  });
  const fetchEmployees = useCallback(
    async (query: string, page: number) => {
      const result: EmployeeOptionsResponse = await getEmployees({
        page,
        pageSize: 25,
        search: query.trim(),
        status: 'Active',
      }).unwrap();
      return {
        data: result.items.map((item) => ({
          id: item.id,
          label: item.fullName,
          status: item.status,
        })),
        hasMore: result.hasMore,
      };
    },
    [getEmployees]
  );
  useEffect(() => {
    if (employee)
      setSelected({
        id: employeeId,
        label: employee.fullName || employee.employeeName || 'Selected staff',
        status: employee.status ?? employee.employeeStatusType,
      });
  }, [employee, employeeId]);
  const updateContext = (values: { employeeId?: string; month?: string }) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.replace(hrPaths.payroll.structure + (next.size ? `?${next}` : ''));
  };
  const returnParams = new URLSearchParams(params.toString());
  returnParams.delete('setup');
  const returnHref = `${hrPaths.payroll.structure}?${returnParams}`;
  const editHref = salaryEditorHref(employeeId, returnHref, hasRequestedMonth ? month : undefined);
  const legacySetup = params.get('setup') === 'salary';
  const from = params.get('from');
  useEffect(() => {
    if (!legacySetup || !employeeId) return;
    const back =
      from === 'staff-edit'
        ? staffPayrollEditHref(employeeId)
        : from === 'staff-profile'
          ? staffPayrollProfileHref(employeeId)
          : returnHref;
    router.replace(salaryEditorHref(employeeId, back, hasRequestedMonth ? month : undefined));
  }, [legacySetup, employeeId, from, returnHref, router, month, hasRequestedMonth]);

  return (
    <Stack spacing={2}>
      <CustomBreadcrumbs
        heading="Payroll Structure"
        headingComponent="h1"
        layout="inline"
        description="Review recurring salary and statutory deductions for a full month."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Payroll Structure' },
        ]}
        action={
          employeeId && canManage ? (
            <Button
              component={RouterLink}
              href={editHref}
              variant="contained"
              size="small"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              {summary?.revisionId ? 'Edit salary' : 'Set up salary'}
            </Button>
          ) : undefined
        }
      />
      {employeeId && (from === 'staff-profile' || from === 'staff-edit') && (
        <Link
          component={RouterLink}
          href={
            from === 'staff-edit'
              ? staffPayrollEditHref(employeeId)
              : staffPayrollProfileHref(employeeId)
          }
          variant="body2"
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to staff {from === 'staff-edit' ? 'edit' : 'profile'}
        </Link>
      )}
      {!canRead ? (
        <Alert severity="error">You do not have permission to view salary details.</Alert>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <PaginatedSearchSelect
              label="Staff"
              fetchOptions={fetchEmployees}
              filterOptions={(options) => options}
              value={selected}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option: any) => option?.label || ''}
              minChars={0}
              debounceMs={400}
              size="small"
              sx={{ flex: '1 1 280px', maxWidth: { md: 420 } }}
              onChange={(_, value) => {
                setSelected(value as EmployeeOption | null);
                updateContext({ employeeId: (value as EmployeeOption | null)?.id || '' });
              }}
            />
            <TextField
              label="Preview month"
              type="month"
              size="small"
              value={month}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(event) => {
                if (/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value))
                  updateContext({ month: event.target.value });
              }}
              sx={{ width: { xs: '100%', sm: 190 } }}
            />
          </Paper>
          {!employeeId ? (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Select a staff member to review salary and statutory deductions.
              </Typography>
            </Paper>
          ) : isError ? (
            <Alert
              severity="error"
              action={
                <Button onClick={() => refetch()} size="small">
                  Retry
                </Button>
              }
            >
              Unable to load salary details. Try again.
            </Alert>
          ) : !summary ? (
            <Stack aria-label="Loading salary details" role="status" spacing={2}>
              <Skeleton variant="rounded" height={90} />
              <Skeleton variant="rounded" height={230} />
              <Skeleton variant="rounded" height={200} />
            </Stack>
          ) : !summary.revisionId ? (
            <Alert severity="info">
              No salary is effective for {formatPayrollMonth(month)}.
              {canManage ? ' Set up salary to see the full-month estimate.' : ''}
            </Alert>
          ) : (
            <Stack spacing={2} aria-busy={isFetching}>
              {isFetching && <LinearProgress aria-label="Refreshing salary details" />}
              <Box>
                <Typography variant="subtitle1">
                  Full-month estimate · {formatPayrollMonth(month)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Salary effective from{' '}
                  {formatPayrollMonth(summary.salaryEffectiveMonth!.slice(0, 7))}. Attendance and
                  one-time adjustments are applied in Run Payroll.
                </Typography>
              </Box>
              {!summary.isComplete && (
                <Alert severity="warning">
                  This estimate is incomplete. Resolve the statutory setup shown below before
                  relying on take-home or school cost.
                </Alert>
              )}
              <SalaryTotals
                gross={summary.grossSalary}
                deductions={summary.totalDeductions}
                net={summary.netSalary}
                employerCost={summary.employerCost}
              />
              {summary.quotedEmployerCost != null &&
                summary.employerCost != null &&
                Math.abs(summary.employerCost - summary.quotedEmployerCost) > 0.01 && (
                  <Alert severity="info">
                    Current school cost differs from saved CTC by{' '}
                    {formatPayrollCurrency(summary.employerCost - summary.quotedEmployerCost)}.
                    Agreed gross salary remains unchanged.
                  </Alert>
                )}
              <StatutorySummary schemes={summary.statutorySummary} />
              <SalaryBreakdown
                earnings={summary.earnings}
                deductions={summary.deductions}
                employerContributions={summary.employerContributions}
              />
              <Link
                component={RouterLink}
                href={hrPaths.payroll.runPayroll}
                variant="body2"
                sx={{ alignSelf: 'flex-start' }}
              >
                Open Run Payroll for attendance and monthly adjustments
              </Link>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
