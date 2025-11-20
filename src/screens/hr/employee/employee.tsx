'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import Add from '@mui/icons-material/Add';
import { Label } from 'src/components/label';
import { useState, useCallback } from 'react';
import { GenderType } from 'src/enums/gender';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { useSearchParam } from 'src/hooks/use-search-param';
import { convertBase64Format } from 'src/utils/base64Formate';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { EmployeeGroupType, EmployeeGroupTypeFilter } from 'src/enums/employee-group';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { Box, Grid, Card, Button, Avatar, MenuList, MenuItem, Typography } from '@mui/material';
import {
  EmployeeStatusType,
  EmployeeStatusTypeColor,
  EmployeeStatusTypeOptions,
} from 'src/enums/employee-status-type';

import EmployeeFrom from './employee-form';
import EmployeeView from './employee-view';
import { Sections } from '../payroll/structure';
import ChangeStatusForm from './chnage-status-form';

const HrEmployee = () => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
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
          {/* <MenuItem
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
          </MenuItem> */}
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
    [statusDialog]
  );
  const {
    data: employee,
    isLoading,
    refetch,
  } = useQueryAndMutation({ type: 'query', currentQueryAndMutation: useGetEmployeeQuery });
  const handleClose = useCallback(
    (_e?: any, isSubmit?: boolean) => {
      if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
        dispatch(setIsChanges(false));
        setOpen(false);
        setEditData(null);
      } else if (!isChanges) {
        setOpen(false);
        setEditData(null);
      }
    },
    [dispatch, isChanges]
  );
  const handleCloseStatus = (): void => {
    statusDialog.onFalse();
    setEditData(null);
    refetch();
  };
  const handleClosePayroll = () => {
    payrollDialog.onFalse();
    setEditData(null);
    refetch();
  };

  const tableData = employee?.items?.map((item: any) => ({
    ...item,
    dob: dayjs(item?.dateOfBirth, 'YYYY-MM-DD').format('DD-MM-YYYY'),
    genderValue: GenderType[item?.genderType],
    doi: dayjs(item?.dateOfJoining, 'YYYY-MM-DD').format('DD-MM-YYYY'),
    roleValue: item?.role?.name || 'Not Assigned',
    statusValue: item?.employeeStatusType,
    fullName: `${item?.lastName} ${item?.firstName} ${item?.middleName}`,
    shiftName: `${item?.shift?.shiftName} (${dayjs(item?.shift?.startTime, 'HH:mm:ss').format('hh:mm A')} - ${dayjs(item?.shift?.endTime, 'HH:mm:ss').format('hh:mm A')})`,
    // employeeType: EmployeeGroupType[item?.employeeGroup],
    organization: item?.educationMediumStage?.name,
  }));
  const [selectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {open ? (
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <CustomBreadcrumbs
            heading="Employee List"
            links={[
              { name: 'HR/Staff', href: '/hr/dashboard/' },
              { name: 'Employee', href: '/hr/employee/' },
              { name: 'Employee List', href: '/hr/employee/' },
            ]}
            description="Fill out the form below with personal, contact, and employment details. Required fields are marked with an asterisk (*)."
            isBack
            onBack={handleClose}
          />

          <Card sx={{ height: '100%' }}>
            <EmployeeFrom editData={editData} handleClose={handleClose} />
          </Card>
        </Box>
      ) : !searchParams?.employee ? (
        <>
          {' '}
          <CustomBreadcrumbs
            heading="Employee List"
            links={[
              { name: 'HR/Staff', href: '/hr/dashboard/' },
              { name: 'Employee', href: '/hr/employee/' },
              { name: 'Employee List', href: '/hr/employee/' },
            ]}
            sx={{ px: 1, mb: 1 }}
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
            description="This section displays the employees list. Click 'View' to see their detailed profile information."
          />
          <CustomizableTable
            noDataText={
              <>
                No Employee Found{' '}
                <Box
                  onClick={() => {
                    setOpen(true);
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Add Employee
                </Box>
              </>
            }
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedStudents.length !== 0}
            isLoading={isLoading}
            tableId="employee-table"
            columns={[
              // {
              //   id: 'checkBox',
              //   align: 'left',
              //   minWidth: '60px',
              //   isSort: false,
              //   isFilter: false,
              //   sticky: true,
              //   label: '',
              //   renderColumn() {
              //     return (
              //       <Checkbox
              //         checked={
              //           tableData?.length && selectedStudents?.length === tableData?.length
              //         }
              //         onChange={(e) => {
              //           if (e.target.checked) {
              //             setSelectedStudents(tableData || []);
              //           } else {
              //             setSelectedStudents([]);
              //           }
              //         }}
              //       />
              //     );
              //   },
              //   render(value, row) {
              //     return (
              //       <Checkbox
              //         checked={!!selectedStudents.some((i: any) => i.id === row.id)}
              //         onChange={(e) => {
              //           if (e.target.checked) {
              //             setSelectedStudents([...selectedStudents, row]);
              //           } else {
              //             setSelectedStudents(
              //               selectedStudents.filter((i: any) => i.id !== row.id)
              //             );
              //           }
              //         }}
              //       />
              //     );
              //   },
              // },
              {
                id: 'fullName',
                label: 'Name',
                minWidth: '12vw',
                sticky: true,
                align: 'left',
                render(value, row) {
                  return (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        alt={value}
                        src={convertBase64Format(row.profilePicture)}
                        sx={{
                          height: 32,
                          width: 32,
                          border: (theme) => `1px solid ${theme.vars.palette.grey[400]}`,
                        }}
                      />{' '}
                      {value}
                    </Box>
                  );
                },
              },
              { id: 'employeeCode', label: 'Employee Code', minWidth: '150px', align: 'left' },

              {
                id: 'dob',
                label: 'Date of Birth',
                minWidth: '8vw',
                filterType: 'date',
                align: 'left',
              },
              {
                id: 'genderValue',
                label: 'Gender',
                align: 'left',
                filterType: 'enum',
                enumOptions: [
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                ],
              },
              {
                id: 'doi',
                label: 'Date of Joining',
                minWidth: 150,
                filterType: 'date',
                align: 'left',
              },
              { id: 'email', label: 'Email', align: 'left' },
              { id: 'mobileNo', label: 'Mobile No.', minWidth: 150, align: 'left' },
              {
                id: 'employeeGroup',
                label: 'Employee Group',
                minWidth: '10vw',
                align: 'left',
                filterType: 'enum',
                enumOptions: EmployeeGroupTypeFilter,
                render(value, row) {
                  return EmployeeGroupType[row?.employeeGroup];
                },
              },
              { id: 'shiftName', label: 'Shift', align: 'left', minWidth: '12vw' },
              { id: 'organization', label: 'Organization', align: 'left' },
              {
                id: 'roleValue',
                label: 'Role',
                align: 'left',
                render(value, row) {
                  return <Label variant="soft">{value}</Label>;
                },
              },
              {
                id: 'statusValue',
                label: 'Status',
                filterType: 'enum',
                enumOptions: EmployeeStatusTypeOptions,
                minWidth: '90px',
                align: 'left',
                sticky: true,
                render(value, row) {
                  const color = EmployeeStatusTypeColor[
                    row.employeeStatusType as EmployeeStatusType
                  ] as LabelColor;
                  return <Label color={color}>{EmployeeStatusType[value]}</Label>;
                },
              },
              {
                id: 'actions',
                label: 'Actions',
                isSort: false,
                sticky: true,
                isFilter: false,

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
                      // showThreeDots={false}
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
            title={
              <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                <Typography variant="h5">Change Status</Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title="You can update the employee's current status to reflect their employment situation, such as active, inactive, left or retired"
                >
                  <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
                </CustomTooltip>
              </Box>
            }
          >
            <ChangeStatusForm
              handleClose={handleCloseStatus}
              employeeId={editData?.id}
              employeeName={editData?.fullName}
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
            paperProps={{ sx: { maxHeight: '70vh' } }}
          >
            <Box bgcolor="background.neutral" p={2}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Sections
                    title="Earning"
                    organization={editData?.educationMediumStageId}
                    data={[]}
                    type={0}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
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
        </>
      ) : (
        <EmployeeView searchParams={searchParams} setSearchParams={setSearchParams} />
      )}
    </Box>
  );
};
export default HrEmployee;
