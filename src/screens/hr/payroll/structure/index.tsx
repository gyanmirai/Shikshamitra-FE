'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { hrPermissions } from 'src/constants/hr-menus';
import CustomTooltip from 'src/components/custom-tooltip';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingScreen } from 'src/components/loading-screen';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useLazyGetEmployeeQuery, useGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { RenderComponents } from 'src/screens/hr/employee/employee-form-fields/PayrollFields';
import { Box, Grid, Card, Alert, Paper, Button, Typography, DialogActions } from '@mui/material';
import { useGetEffectiveCompensationRevisionQuery } from 'src/redux/hr/compensation-revision-api';
import {
  type EmployeeOption,
  buildEmployeeSelectOptions,
} from 'src/screens/hr/leave-request/leave-request.utils';
import {
  useGetEmployeeSalaryStructureQuery,
  useUpdateEmployeeSalaryStructureMutation,
} from 'src/redux/hr/employee-salary-structure-api';
import {
  isApplicableToMonth,
  isSalaryComponentFixed,
  toApplicableMonthPayload,
  getSalaryComponentPayloadAmount,
} from 'src/screens/hr/employee/salary-utils';

import { SalaryStructureBuilder } from './SalaryStructureBuilder';
import { getLocalMonthKey } from './salary-structure-builder-utils';

const EmployeeSalaryStructureScreen = () => {
  const searchParams = useSearchParams();
  const requestedEmployeeId = searchParams.get('employeeId')?.trim() || '';
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewCompensationRevisions = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.compensationRevisionActions.view
  );
  const canEditPayrollStructure = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.payrollStructureActions.add
  );
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
      label: requestedEmployee.fullName || requestedEmployee.employeeName || 'Selected employee',
      status: requestedEmployee.status ?? requestedEmployee.employeeStatusType,
    });
  }, [requestedEmployee, requestedEmployeeId, selectedEmployee?.id]);

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
      { skip: !employeeId || !canViewCompensationRevisions }
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
        description="View and manage employee salary structures."
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Payroll Structure' },
        ]}
      />
      <Card>
        <Box display="flex" gap={1} flexWrap="wrap" p={1}>
          <PaginatedSearchSelect
            label="Employee"
            fetchOptions={async (query, page) => {
              if (page > 1) return { data: [], hasMore: false };
              const res = await getEmployees({
                page: 1,
                pageSize: 500,
                search: query,
                status: EmployeeStatusType.Active,
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
            Select an employee to view salary structure.
          </Typography>
        </Paper>
      ) : (
        <>
          {canEditPayrollStructure && (
            <Box display="flex" justifyContent="flex-end" mt={1} mb={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={handleOpenEdit}
              >
                Edit Salary Structure
              </Button>
            </Box>
          )}
          {canViewCompensationRevisions && !effectiveRevision && !isRevisionLoading && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              This employee has no approved compensation revision for the current month. Payroll
              cannot be locked until the first revision is approved.
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

          <CustomDialog
            maxWidth="lg"
            open={editDialogOpen}
            handleClose={handleCloseEdit}
            title={
              <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                <Typography variant="h5">Edit Salary Structure</Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title="Define the employee's salary structure by assigning fixed or temporary earning and deduction components."
                >
                  <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
                </CustomTooltip>
              </Box>
            }
            paperProps={{ sx: { maxHeight: '70vh' } }}
          >
            {editDialogOpen && (
              <SalaryStructureEdit employeeId={employeeId} handleClose={handleCloseEdit} />
            )}
          </CustomDialog>
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

const SalaryStructureEdit = ({
  employeeId,
  handleClose,
}: {
  employeeId: string;
  handleClose: () => void;
}) => {
  const { data: salaryStructure, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeSalaryStructureQuery,
    params: { employeeId },
    options: { skip: !employeeId },
  });

  const [updateSalaryStructure, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeSalaryStructureMutation,
  });

  const formik = useFormik({
    initialValues: {
      earningComponents: [] as any[],
      deductionComponents: [] as any[],
      pfRule: '',
      quotedSalaryBasis: '',
      quotedMonthlyAmount: null as number | null,
      sourceSalaryTemplateId: null as string | null,
      sourceSalaryTemplateVersionId: null as string | null,
      sourceSalaryTemplateVersion: null as number | null,
      salaryGeneratedAt: null as string | null,
      wasModifiedAfterGeneration: false,
    },
    validationSchema: Yup.object({
      earningComponents: Yup.array().of(
        Yup.object({
          name: Yup.string(),
          componentType: Yup.string(),
          amount: Yup.string().required('Amount is required'),
          applicableMonth: Yup.mixed().when('isTemp', {
            is: true,
            then: (schema) => schema.required('Applicable month is required'),
            otherwise: (schema) => schema.nullable(),
          }),
        })
      ),
      deductionComponents: Yup.array().of(
        Yup.object({
          name: Yup.string(),
          componentType: Yup.string(),
          amount: Yup.string().required('Amount is required'),
          applicableMonth: Yup.mixed().when('isTemp', {
            is: true,
            then: (schema) => schema.required('Applicable month is required'),
            otherwise: (schema) => schema.nullable(),
          }),
        })
      ),
    }),
    onSubmit: async (values) => {
      const data = {
        earningComponents: values.earningComponents
          .filter((item: any) => item.isTemp)
          .map((item: any) => ({
            id: item?.id && item?.id !== item?.componentId ? item.id : null,
            componentId: item?.componentId || null,
            name: item?.earningComponentName || item?.name,
            amount: getSalaryComponentPayloadAmount(item),
            isFixed: isSalaryComponentFixed(item),
            isTemp: !!item?.isTemp,
            usesMasterValue: item?.usesMasterValue,
            applicableMonth: toApplicableMonthPayload(item?.applicableMonth),
            semanticType: item?.semanticType || 'Ordinary',
            statutoryRuleId: item?.statutoryRuleId || null,
          })),
        deductionComponents: values.deductionComponents
          .filter((item: any) => item.isTemp)
          .map((item: any) => ({
            id: item?.id && item?.id !== item?.componentId ? item.id : null,
            componentId: item?.componentId || null,
            name: item?.deductionComponentName || item?.name,
            amount: getSalaryComponentPayloadAmount(item),
            isFixed: isSalaryComponentFixed(item),
            isTemp: !!item?.isTemp,
            usesMasterValue: item?.usesMasterValue,
            applicableMonth: toApplicableMonthPayload(item?.applicableMonth),
            semanticType: item?.semanticType || 'Ordinary',
            statutoryRuleId: item?.statutoryRuleId || null,
          })),
        pfRuleId: values.pfRule || null,
        quotedSalaryBasis: values.quotedSalaryBasis || null,
        quotedMonthlyAmount: values.quotedMonthlyAmount,
        sourceSalaryTemplateId: values.sourceSalaryTemplateId,
        sourceSalaryTemplateVersionId: values.sourceSalaryTemplateVersionId,
        sourceSalaryTemplateVersion: values.sourceSalaryTemplateVersion,
        salaryGeneratedAt: values.salaryGeneratedAt,
        wasModifiedAfterGeneration: values.wasModifiedAfterGeneration,
      };

      try {
        await updateSalaryStructure({ employeeId, data }).unwrap();
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (salaryStructure) {
      formik.setValues({
        earningComponents: (salaryStructure?.earningComponents ?? []).filter(
          (item: any) => item.isTemp
        ),
        deductionComponents: (salaryStructure?.deductionComponents ?? []).filter(
          (item: any) => item.isTemp
        ),
        pfRule: salaryStructure?.pfRuleId ?? '',
        quotedSalaryBasis: salaryStructure?.quotedSalaryBasis ?? '',
        quotedMonthlyAmount: salaryStructure?.quotedMonthlyAmount ?? null,
        sourceSalaryTemplateId: salaryStructure?.sourceSalaryTemplateId ?? null,
        sourceSalaryTemplateVersionId: salaryStructure?.sourceSalaryTemplateVersionId ?? null,
        sourceSalaryTemplateVersion: salaryStructure?.sourceSalaryTemplateVersion ?? null,
        salaryGeneratedAt: salaryStructure?.salaryGeneratedAt ?? null,
        wasModifiedAfterGeneration: salaryStructure?.wasModifiedAfterGeneration ?? false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaryStructure]);

  return (
    <>
      <DialogScrollContent>
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <Paper elevation={2} sx={{ p: 1 }}>
            <Grid container spacing={3}>
              <SalaryStructureBuilder formik={formik} employeeId={employeeId} />
              <Grid size={{ xs: 12, md: 6 }}>
                <RenderComponents
                  formik={formik}
                  name="earningComponents"
                  label="One-time earning components"
                  type="earning"
                  showTempAdd
                  temporaryOnly
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <RenderComponents
                  formik={formik}
                  name="deductionComponents"
                  label="One-time deduction components"
                  type="deduction"
                  showTempAdd
                  temporaryOnly
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          size="small"
          loading={isUpdating}
          variant="contained"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Save one-time components
        </LoadingButton>
      </DialogActions>
    </>
  );
};

export default EmployeeSalaryStructureScreen;
