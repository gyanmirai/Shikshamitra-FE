'use client';

import { useState, useCallback } from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Grid, Paper, Button, MenuList, MenuItem, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { EmployeeStatusType, EmployeeStatusTypeArray } from 'src/enums/employee-status-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EmployeeFrom from './employee-form';
import EmployeeView from './employee-view';
import { Sections } from '../payroll/structure';

const HrEmployee = () => {
  const statusDialog = useBoolean();
  const [searchParams, setSearchParams] = useSearchParam();
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const payrollDialog = useBoolean();

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setSearchParams({ employee: row?.id });
              pop.onClose();
            }}
          >
            <Iconify icon="carbon:view-filled" sx={{ height: '16px', width: '16px' }} />
            View
          </MenuItem>

          <MenuItem
            onClick={() => {
              setOpen(true);
              pop.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              payrollDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify
              icon="material-symbols:payments-outline-sharp"
              sx={{ height: '16px', width: '16px' }}
            />
            Payroll Structure
          </MenuItem>
          <MenuItem
            onClick={() => {
              pop.onClose();
              statusDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:form-dropdown" sx={{ height: '16px', width: '16px' }} />
            Change Status
          </MenuItem>
        </MenuList>
      </>
    ),
    [payrollDialog, setSearchParams, statusDialog]
  );

  const { data: employee } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });
  return (
    <>
      {!searchParams?.employee ? (
        <>
          {' '}
          <CustomBreadcrumbs
            heading="Employee"
            links={[{ name: 'HR' }, { name: 'Employee' }]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setOpen(true)}
              >
                Add Employee
              </Button>
            }
          />
          <Paper sx={{ px: 1, py: 2 }}>
            <CustomizableTable
              columns={[
                // { id: 'organizationName', label: 'Organization' },
                { id: 'Code', label: 'Code' },
                // { id: 'Name', label: 'Name' },
                { id: 'firstName', label: 'First Name' },
                { id: 'middleName', label: 'Middle Name' },
                { id: 'role', label: 'Role' },
                {
                  id: 'employeeCode',
                  label: 'Status',
                  render(value, row) {
                    return (
                      <Label variant="soft" color={value === 'Active' ? 'success' : 'error'}>
                        {value}
                      </Label>
                    );
                  },
                },
                {
                  id: 'actions',
                  label: 'Actions',
                  isSort: false,
                  render(value, row) {
                    return (
                      <ThreeDotsActions
                        onClickThreeDots={() => {
                          setEditData(row);
                        }}
                        actions={(props) => actions({ ...props, row })}
                        placement="right-top"
                      />
                    );
                  },
                },
              ]}
              data={employee?.items || []}
            />
            <CustomDialog
              open={statusDialog.value}
              handleClose={statusDialog.onFalse}
              title="Change Status"
            >
              <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <CustomSelect
                  options={EmployeeStatusTypeArray.map((item, index) => ({
                    label: EmployeeStatusType[index],
                    value: index,
                  }))}
                  value=""
                  onChange={() => {}}
                  label="Change Status"
                  formControlProps={{
                    fullWidth: true,
                    sx: {
                      maxWidth: 'unset',
                    },
                  }}
                />
              </Scrollbar>
              <DialogActions>
                <Button variant="outlined" onClick={statusDialog.onFalse}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={statusDialog.onFalse}>
                  Change Status
                </Button>
              </DialogActions>
            </CustomDialog>
            <CustomDialog
              maxWidth="xl"
              open={open}
              handleClose={() => setOpen(false)}
              title="Add Employee"
            >
              <EmployeeFrom editData={editData} />
            </CustomDialog>
            <CustomDialog
              maxWidth="lg"
              open={payrollDialog.value}
              handleClose={payrollDialog.onFalse}
              title="Payroll Structure"
              paperProps={{
                sx: {
                  maxHeight: '70vh',
                },
              }}
            >
              <Box bgcolor="background.neutral" p={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Sections
                      title="Earning"
                      data={[
                        { type: 'Basic Salary', amount: 50000 },
                        { type: 'House Rent', amount: 10000 },
                        { type: 'Medical Allowance', amount: 5000 },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Sections
                      title="Deduction"
                      data={[
                        { type: 'Income Tax', amount: 5000 },
                        { type: 'Provident Fund', amount: 2000 },
                        { type: 'Insurance', amount: 1000 },
                      ]}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CustomDialog>
          </Paper>{' '}
        </>
      ) : (
        <EmployeeView searchParams={searchParams} setSearchParams={setSearchParams} />
      )}
    </>
  );
};
export default HrEmployee;
