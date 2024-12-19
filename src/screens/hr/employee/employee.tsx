'use client';

import { useState, useCallback } from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Grid, Paper, Button, Avatar, MenuList, MenuItem } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { convertBase64Format } from 'src/utils/base64Formate';

import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { EmployeeStatusType, EmployeeStatusTypeColor } from 'src/enums/employee-status-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EmployeeFrom from './employee-form';
import EmployeeView from './employee-view';
import { Sections } from '../payroll/structure';
import ChangeStatusForm from './chnage-status-form';

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
              setEditData(row);
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
              setEditData(row);
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

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };
  const handleCloseStatus = () => {
    statusDialog.onFalse();
    setEditData(null);
  };

  const { data: employee, isLoading } = useQueryAndMutation({
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
              isLoading={isLoading}
              columns={[
                { id: 'employeeCode', label: 'Employee Code' },
                {
                  id: 'employeeName',
                  label: 'Full Name',
                  render(value, row) {
                    return (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          alt={value}
                          src={convertBase64Format(row.profilePicture)}
                          sx={{ height: 32, width: 32 }}
                        />{' '}
                        {value}
                      </Box>
                    );
                  },
                },

                { id: 'dateOfBirth', label: 'DOB', minWidth: 100 },
                {
                  id: 'genderType',
                  label: 'Gender',
                  render(value, row) {
                    return GenderType[value] || '-';
                  },
                },
                { id: 'dateOfJoining', label: 'Date Of Joining', minWidth: 150 },
                { id: 'email', label: 'Email' },
                { id: 'mobileNo', label: 'Mobile No', minWidth: 150 },
                {
                  id: 'role.name',
                  label: 'Role',
                  render(value, row) {
                    return <Label variant="soft">{value || 'Not-assigned'}</Label>;
                  },
                },
                {
                  id: 'employeeStatusType',
                  label: 'Status',
                  render(value, row) {
                    const status = EmployeeStatusType[value];
                    return (
                      <Label
                        variant="soft"
                        color={
                          EmployeeStatusTypeColor[status as keyof typeof EmployeeStatusTypeColor]
                        }
                      >
                        {status || '-'}
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
              handleClose={handleCloseStatus}
              title="Change Status"
            >
              <ChangeStatusForm
                handleClose={handleCloseStatus}
                employeeId={editData?.id}
                status={editData?.employeeStatusType}
              />
            </CustomDialog>
            <CustomDialog maxWidth="xl" open={open} handleClose={handleClose} title="Add Employee">
              <EmployeeFrom editData={editData} handleClose={handleClose} />
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
                    <Sections title="Earning" data={[]} type={0} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Sections title="Deduction" data={[]} type={1} />
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
