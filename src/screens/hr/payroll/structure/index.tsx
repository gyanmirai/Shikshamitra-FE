'use client';

import { useMemo, useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, Card, Paper, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetEmployeeSalaryStructureQuery } from 'src/redux/hr/employee-salary-structure-api';

const EmployeeSalaryStructureScreen = () => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [editRow, setEditRow] = useState<any>(null);
  const [deleteRow, setDeleteRow] = useState<any>(null);

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

  const handleEdit = useCallback((row: any) => {
    setEditRow(row);
    // TODO: open edit dialog / form for this row
  }, []);

  const handleDelete = useCallback((row: any) => {
    setDeleteRow(row);
    // TODO: open confirm-delete dialog for this row
  }, []);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Payroll Structure"
        description="View and manage employee salary structures."
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Payroll Structure' }]}
      />
      <Card>
        <Box display="flex" gap={2} flexWrap="wrap" p={1}>
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
      </Card>

      {!employeeId ? (
        <Paper elevation={3} sx={{ p: 3, mt: 1, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Select an employee to view salary structure.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} mt={1} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <Section
              title="Earning"
              rows={payrollStructureRows}
              type={0}
              isLoading={isStructureLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Section
              title="Deduction"
              rows={payrollStructureRows}
              type={1}
              isLoading={isStructureLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
  onEdit,
  onDelete,
}: {
  title: string;
  rows: any[];
  type: number;
  isLoading: boolean;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
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
          { id: 'payElement.name', label: 'Type' },
          {
            id: 'amount',
            label: 'Amount',
            render(value) {
              return formatCurrency(value);
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: '80px',
            render(_value: any, row: any) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => onEdit(row)}
                  handleDeleteClick={() => onDelete(row)}
                />
              );
            },
          },
        ]}
        data={rows.filter((i: any) => i.payrollStructureType === type)}
      />
    </Box>
  </Paper>
);

export default EmployeeSalaryStructureScreen;
