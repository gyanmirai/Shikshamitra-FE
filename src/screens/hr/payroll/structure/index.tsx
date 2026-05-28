'use client';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { LoadingScreen } from 'src/components/loading-screen';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Grid, Card, Paper, Button, Typography, DialogActions } from '@mui/material';
import { RenderComponents } from 'src/screens/hr/employee/employee-form-fields/PayrollFields';
import {
  isSalaryComponentFixed,
  getSalaryComponentPayloadAmount,
} from 'src/screens/hr/employee/salary-utils';
import {
  type EmployeeOption,
  buildEmployeeSelectOptions,
} from 'src/screens/hr/leave-request/leave-request.utils';
import {
  useGetEmployeeSalaryStructureQuery,
  useUpdateEmployeeSalaryStructureMutation,
} from 'src/redux/hr/employee-salary-structure-api';

const EmployeeSalaryStructureScreen = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [getEmployees] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeQuery,
  });

  const employeeId = selectedEmployee?.id ?? '';

  const { data: structureData, isLoading: isStructureLoading } = useGetEmployeeSalaryStructureQuery(
    { employeeId },
    { skip: !employeeId }
  );

  const payrollStructureRows = useMemo(() => {
    const earningRows = (structureData?.earningComponents || []).map((item: any) => ({
      id: item?.id || item?.componentId,
      payElement: { name: item?.name || '-' },
      amount: item?.amount || 0,
      payrollStructureType: 0,
      _raw: item,
    }));

    const deductionRows = (structureData?.deductionComponents || []).map((item: any) => ({
      id: item?.id || item?.componentId,
      payElement: { name: item?.name || '-' },
      amount: item?.amount || 0,
      payrollStructureType: 1,
      _raw: item,
    }));

    return [...earningRows, ...deductionRows];
  }, [structureData]);

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
        <Box display="flex" gap={2} flexWrap="wrap" p={1}>
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
          <Grid container spacing={1} alignItems="stretch">
            <Grid size={{ xs: 12, md: 6 }}>
              <Section
                title="Earning"
                rows={payrollStructureRows}
                type={0}
                isLoading={isStructureLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Section
                title="Deduction"
                rows={payrollStructureRows}
                type={1}
                isLoading={isStructureLoading}
              />
            </Grid>
          </Grid>

          <CustomDialog
            maxWidth="lg"
            open={editDialogOpen}
            handleClose={handleCloseEdit}
            title="Edit Salary Structure"
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
        earningComponents: values.earningComponents.map((item: any) => ({
          id: item?.id && item?.id !== item?.componentId ? item.id : null,
          componentId: item?.componentId || null,
          name: item?.earningComponentName || item?.name,
          amount: getSalaryComponentPayloadAmount(item),
          isFixed: isSalaryComponentFixed(item),
          isTemp: !!item?.isTemp,
          applicableMonth: item?.applicableMonth ? dayjs(item.applicableMonth).toISOString() : null,
        })),
        deductionComponents: values.deductionComponents.map((item: any) => ({
          id: item?.id && item?.id !== item?.componentId ? item.id : null,
          componentId: item?.componentId || null,
          name: item?.deductionComponentName || item?.name,
          amount: getSalaryComponentPayloadAmount(item),
          isFixed: isSalaryComponentFixed(item),
          isTemp: !!item?.isTemp,
          applicableMonth: item?.applicableMonth ? dayjs(item.applicableMonth).toISOString() : null,
        })),
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
        earningComponents: salaryStructure?.earningComponents ?? [],
        deductionComponents: salaryStructure?.deductionComponents ?? [],
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
              <Grid size={{ xs: 12, md: 6 }}>
                <RenderComponents
                  formik={formik}
                  name="earningComponents"
                  label="Earning Components"
                  type="earning"
                  showTempAdd
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <RenderComponents
                  formik={formik}
                  name="deductionComponents"
                  label="Deduction Components"
                  type="deduction"
                  showTempAdd
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
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};

export default EmployeeSalaryStructureScreen;
