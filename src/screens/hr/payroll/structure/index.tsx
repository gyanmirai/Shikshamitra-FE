'use client';

import { useMemo, useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetEmployeeSalaryStructureQuery } from 'src/redux/hr/employee-salary-structure-api';

const EmployeeSalaryStructureScreen = () => {
  const [employeeId, setEmployeeId] = useState<string>('');

  const { data: employees, isLoading: isEmployeesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
    params: { page: 1, pageSize: 200, search: '' },
  });

  const employeeOptions = useMemo(
    () =>
      (employees?.items || []).map((item: any) => ({
        id: item?.id,
        name: `${item?.fullName || 'Unknown'}${item?.employeeIdentifier ? ` (${item.employeeIdentifier})` : ''}`,
      })),
    [employees?.items]
  );

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
    }));

    const deductionRows = (structureData?.deductionComponents || []).map((item: any) => ({
      id: item?.id || item?.componentId,
      payElement: { name: item?.name || '-' },
      amount: item?.amount || 0,
      payrollStructureType: 1,
    }));

    return [...earningRows, ...deductionRows];
  }, [structureData]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Payroll Structure"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Payroll Structure' }]}
      />

      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <CustomSelect
          options={employeeOptions}
          label="Employee"
          value={employeeId}
          onChange={(val) => setEmployeeId(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '420px', width: '100%' } }}
          disabled={isEmployeesLoading}
        />
      </Box>

      {!employeeId ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Select an employee to view salary structure.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
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
  <Paper elevation={3}>
    <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
      <Typography variant="h5">{title}</Typography>
    </Box>
    <Box p={2} pt={0}>
      <CustomizableTable
        tableId={`payroll-structure-${type}`}
        isFilter={false}
        isPagination={false}
        isSearch={false}
        isShowedDense={false}
        isLoading={isLoading}
        columns={[
          { id: 'payElement.name', label: 'Type' },
          {
            id: 'amount',
            label: 'Amount',
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
