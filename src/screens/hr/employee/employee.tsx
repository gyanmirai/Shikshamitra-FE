'use client';

import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Add from '@mui/icons-material/Add';
import {
  Box,
  Grid,
  Card,
  Paper,
  Button,
  Avatar,
  MenuList,
  MenuItem,
  Checkbox,
} from '@mui/material';

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
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

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
              payrollDialog.onTrue();
              setEditData(row);
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
    [payrollDialog, statusDialog]
  );

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };
  const handleCloseStatus = () => {
    statusDialog.onFalse();
    setEditData(null);
  };
  const handleClosePayroll = () => {
    payrollDialog.onFalse();
    setEditData(null);
  };

  const { data: employee, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });

  const tableData = employee?.items?.map((item: any) => ({
    ...item,
    dob: dayjs(item?.dateOfBirth, 'YYYY-MM-DD').format('DD-MM-YYYY'),
    genderValue: GenderType[item?.genderType],
    doi: dayjs(item?.dateOfJoining, 'YYYY-MM-DD').format('DD-MM-YYYY'),
    roleValue: item?.role?.name || 'Not Assigned',
    statusValue: EmployeeStatusType[item?.employeeStatusType],
  }));

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <>
      {open ? (
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <CustomBreadcrumbs
            heading={editData ? 'Update Employee' : 'Add Employee'}
            links={[
              { name: 'HR' },
              { name: 'Employee List', onClick: handleClose },
              { name: editData ? 'Update Employee' : 'Add Employee' },
            ]}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handleClose}
              >
                Back
              </Button>
            }
          />

          <Card sx={{ height: '100%' }}>
            <EmployeeFrom editData={editData} handleClose={handleClose} />
          </Card>
        </Box>
      ) : !searchParams?.employee ? (
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
                Employee
              </Button>
            }
            description="This section displays a list of employees. Click on the View action to access their detailed profile information."
          />
          <Paper sx={{ px: 1, py: 2 }}>
            <CustomizableTable
              onSendNotification={handlerSendNotification}
              showCheckbox={selectedStudents.length !== 0}
              isLoading={isLoading}
              tableId="employee-table"
              columns={[
                {
                  id: 'checkBox',
                  align: 'left',
                  minWidth: '60px',
                  isSort: false,
                  isFilter: false,
                  label: '',
                  renderColumn() {
                    return (
                      <Checkbox
                        checked={
                          tableData?.length && selectedStudents?.length === tableData?.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(tableData || []);
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                      />
                    );
                  },
                  render(value, row) {
                    return (
                      <Checkbox
                        checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, row]);
                          } else {
                            setSelectedStudents(
                              selectedStudents.filter((i: any) => i.id !== row.id)
                            );
                          }
                        }}
                      />
                    );
                  },
                },
                { id: 'employeeCode', label: 'Employee Code', sticky: true },
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

                { id: 'dob', label: 'DOB', minWidth: 100 },
                {
                  id: 'genderValue',
                  label: 'Gender',
                },
                { id: 'doi', label: 'Date Of Joining', minWidth: 150 },
                { id: 'email', label: 'Email' },
                { id: 'mobileNo', label: 'Mobile No', minWidth: 150 },
                {
                  id: 'roleValue',
                  label: 'Role',
                  render(value, row) {
                    return <Label variant="soft">{value}</Label>;
                  },
                },
                {
                  id: 'statusValue',
                  label: 'Status',
                  render(value, row) {
                    return (
                      <Label
                        variant="soft"
                        color={
                          EmployeeStatusTypeColor[value as keyof typeof EmployeeStatusTypeColor]
                        }
                      >
                        {value || '-'}
                      </Label>
                    );
                  },
                },
                {
                  id: 'actions',
                  label: 'Actions',
                  isSort: false,
                  sticky: true,
                  render(value, row) {
                    return (
                      <ThreeDotsActions
                        actions={(props) => actions({ ...props, row })}
                        placement="right-top"
                        showViewIcon
                        showEditIcon
                        handleViewClick={() => {
                          setSearchParams({ employee: row?.id });
                        }}
                        handleEditClick={() => {
                          setEditData(row);
                          setOpen(true);
                        }}
                      />
                    );
                  },
                },
              ]}
              data={tableData || []}
            />
            {sendInstantNotificationDialogValue.value && (
              <SendInstantNotificationDialog
                open={sendInstantNotificationDialogValue.value}
                onClose={sendInstantNotificationDialogValue.onFalse}
                data={[]}
                userList={selectedStudents}
              />
            )}
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
            {/* <CustomDialog maxWidth="xl" open={open} handleClose={handleClose} title="Add Employee"> */}
            {/*  <EmployeeFrom editData={editData} handleClose={handleClose} /> */}
            {/* </CustomDialog> */}
            <CustomDialog
              maxWidth="lg"
              open={payrollDialog.value}
              handleClose={handleClosePayroll}
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
                      organization={editData?.educationMediumStageId}
                      data={[]}
                      type={0}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Sections
                      title="Deduction"
                      organization={editData?.educationMediumStageId}
                      data={[]}
                      type={1}
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
