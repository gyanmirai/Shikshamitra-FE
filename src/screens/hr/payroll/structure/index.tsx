'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { hrPermissions } from 'src/constants/hr-menus';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { isApplicableToMonth } from 'src/screens/hr/employee/salary-utils';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { Box, Grid, Card, Alert, Paper, Button, Typography } from '@mui/material';
import { useLazyGetEmployeeQuery, useGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { useGetEmployeeSalaryStructureQuery } from 'src/redux/hr/employee-salary-structure-api';
import { useGetEffectiveCompensationRevisionQuery } from 'src/redux/hr/compensation-revision-api';
import {
  staffPayrollEditHref,
  staffPayrollProfileHref,
} from 'src/screens/hr/employee/payroll-profile-utils';
import {
  type EmployeeOption,
  buildEmployeeSelectOptions,
} from 'src/screens/hr/leave-request/leave-request.utils';

import { SalaryEditorDialog } from './salary-editor-dialog';
import { getLocalMonthKey } from './salary-structure-builder-utils';

const EmployeeSalaryStructureScreen = () => {
  const searchParams = useSearchParams();
  const requestedEmployeeId = searchParams.get('employeeId')?.trim() || '';
  const openRequestedSalarySetup = searchParams.get('setup') === 'salary';
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewCompensationRevisions = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.compensationRevisionActions.view
  );
  const canManageCompensation = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.compensationRevisionActions.manage
  );
  const canReadCompensationRevisions = canViewCompensationRevisions || canManageCompensation;
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: requestedEmployee } = useGetEmployeeByIdQuery(requestedEmployeeId, {
    skip: !requestedEmployeeId,
  });

  useEffect(() => {
    if (
      !requestedEmployeeId ||
      !requestedEmployee ||
      selectedEmployee?.id === requestedEmployeeId
    ) {
      return;
    }
    setSelectedEmployee({
      id: requestedEmployeeId,
      label: requestedEmployee.fullName || requestedEmployee.employeeName || 'Selected staff',
      status: requestedEmployee.status ?? requestedEmployee.employeeStatusType,
    });
    if (openRequestedSalarySetup) {
      setEditDialogOpen(true);
    }
  }, [openRequestedSalarySetup, requestedEmployee, requestedEmployeeId, selectedEmployee?.id]);

  const [getEmployees] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeQuery,
  });

  const employeeId = selectedEmployee?.id ?? '';

  const { data: structureData, isLoading: isStructureLoading } = useGetEmployeeSalaryStructureQuery(
    { employeeId },
    { skip: !employeeId }
  );
  const monthKey = getLocalMonthKey();
  const month = `${monthKey}-01T00:00:00.000Z`;
  const { data: effectiveRevision, isLoading: isRevisionLoading } =
    useGetEffectiveCompensationRevisionQuery(
      { employeeId, month },
      { skip: !employeeId || !canReadCompensationRevisions }
    );

  const payrollStructureRows = useMemo(() => {
    const recurringRows = (effectiveRevision?.lines || []).map((item) => ({
      id: item.id,
      payElement: { name: item.name },
      amount: item.amount,
      payrollStructureType: item.isEarning ? 0 : 1,
      _raw: item,
    }));
    const earningRows = (structureData?.earningComponents || [])
      .filter((item: any) => item.isTemp && isApplicableToMonth(item.applicableMonth, monthKey))
      .map((item: any) => ({
        id: item?.id || item?.componentId,
        payElement: { name: `${item?.name || '-'} (one-time)` },
        amount: item?.amount || 0,
        payrollStructureType: 0,
        _raw: item,
      }));

    const deductionRows = (structureData?.deductionComponents || [])
      .filter((item: any) => item.isTemp && isApplicableToMonth(item.applicableMonth, monthKey))
      .map((item: any) => ({
        id: item?.id || item?.componentId,
        payElement: { name: `${item?.name || '-'} (one-time)` },
        amount: item?.amount || 0,
        payrollStructureType: 1,
        _raw: item,
      }));

    return [...recurringRows, ...earningRows, ...deductionRows];
  }, [effectiveRevision, monthKey, structureData]);

  const handleOpenEdit = useCallback(() => {
    setEditDialogOpen(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditDialogOpen(false);
  }, []);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Payroll Structure"
        description="View and manage staff salary structures."
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Payroll Structure' },
        ]}
      />
      {['staff-profile', 'staff-edit'].includes(searchParams.get('from') || '') &&
        requestedEmployeeId && (
          <Button
            href={
              searchParams.get('from') === 'staff-edit'
                ? staffPayrollEditHref(requestedEmployeeId)
                : staffPayrollProfileHref(requestedEmployeeId)
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            {searchParams.get('from') === 'staff-edit'
              ? 'Back to staff edit'
              : 'Back to staff profile'}
          </Button>
        )}

      <Card>
        <Box display="flex" gap={1} flexWrap="wrap" p={1}>
          <PaginatedSearchSelect
            label="Staff"
            fetchOptions={async (query, page) => {
              if (page > 1) return { data: [], hasMore: false };
              const res = await getEmployees({
                page: 1,
                pageSize: 500,
                search: query,
              }).unwrap();
              const items: EmployeeOption[] = (Array.isArray(res) ? res : res?.items || []).map(
                (item: any) => ({
                  label: item.fullName,
                  id: item.id,
                  status: item.status ?? item.employeeStatusType,
                })
              );
              return {
                data: buildEmployeeSelectOptions(items, true),
                hasMore: false,
              };
            }}
            value={selectedEmployee}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(prop, option: any) => (
              <li {...prop} key={option.id}>
                {option.label}
              </li>
            )}
            getOptionLabel={(option: any) => option?.label || ''}
            minChars={0}
            onChange={(_, value) => setSelectedEmployee(value as EmployeeOption | null)}
            debounceMs={400}
            size="small"
            sx={{ maxWidth: '420px', width: '100%' }}
          />
        </Box>
      </Card>

      {!employeeId ? (
        <Paper elevation={3} sx={{ p: 3, mt: 1, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Select a staff member to view salary structure.
          </Typography>
        </Paper>
      ) : (
        <>
          {effectiveRevision && (
            <Paper variant="outlined" sx={{ p: 2, my: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Full-month gross
              </Typography>
              <Typography variant="h5">{formatCurrency(effectiveRevision.grossSalary)}</Typography>
              <Typography variant="caption" color="text.secondary">
                System calculation base. Payroll adjusts this amount once using payable days.
              </Typography>
            </Paper>
          )}
          {canManageCompensation && (
            <Box display="flex" justifyContent="flex-end" mt={1} mb={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={handleOpenEdit}
              >
                {effectiveRevision ? 'Edit salary' : 'Set up salary'}
              </Button>
            </Box>
          )}
          {canReadCompensationRevisions && !effectiveRevision && !isRevisionLoading && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              This staff member has no effective compensation revision for the current month.
              Payroll cannot be locked until salary is saved.
            </Alert>
          )}
          <Grid container spacing={1} alignItems="stretch">
            <Grid size={{ xs: 12, md: 6 }}>
              <Section
                title="Earning"
                rows={payrollStructureRows}
                type={0}
                isLoading={isStructureLoading || isRevisionLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Section
                title="Deduction"
                rows={payrollStructureRows}
                type={1}
                isLoading={isStructureLoading || isRevisionLoading}
              />
            </Grid>
          </Grid>

          {editDialogOpen && (
            <SalaryEditorDialog employeeId={employeeId} handleClose={handleCloseEdit} />
          )}
        </>
      )}
    </Box>
  );
};

const Section = ({
  title,
  rows,
  type,
  isLoading,
}: {
  title: string;
  rows: any[];
  type: number;
  isLoading: boolean;
}) => (
  <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
      <Typography variant="h5">{title}</Typography>
    </Box>
    <Box p={2} pt={0} sx={{ flex: 1 }}>
      <CustomizableTable
        tableId={`payroll-structure-${type}`}
        isFilter={false}
        isPagination={false}
        isSearch={false}
        isShowedDense={false}
        isLoading={isLoading}
        columns={[
          { id: 'payElement.name', label: 'Type', align: 'left' },
          {
            id: 'amount',
            label: 'Amount',
            align: 'left',
            filterType: 'number',
            render(value) {
              return formatCurrency(value);
            },
          },
        ]}
        data={rows.filter((i: any) => i.payrollStructureType === type)}
      />
    </Box>
  </Paper>
);

export default EmployeeSalaryStructureScreen;
