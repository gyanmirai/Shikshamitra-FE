'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import Add from '@mui/icons-material/Add';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import { getRoleColor } from 'src/utils/role-colors';
import { useDispatch, useSelector } from 'react-redux';
import CustomTooltip from 'src/components/custom-tooltip';
import { convertBase64Format } from 'src/utils/base64Formate';
import { LoadingScreen } from 'src/components/loading-screen';
import UserHoverProfile from 'src/components/student-popover';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { RoleColorIndicator } from 'src/components/role-color/RoleColorIndicator';
import { EmployeeGroupType, EmployeeGroupTypeFilter } from 'src/enums/employee-group';
import {
  EmployeeStatusType,
  EmployeeStatusTypeColor,
  EmployeeStatusTypeOptions,
} from 'src/enums/employee-status-type';
import {
  useGetEmployeeSalaryStructureQuery,
  useUpdateEmployeeSalaryStructureMutation,
} from 'src/redux/hr/employee-salary-structure-api';
import {
  Box,
  Card,
  Grid,
  Paper,
  Button,
  Avatar,
  MenuList,
  MenuItem,
  Typography,
  DialogActions,
} from '@mui/material';

import EmployeeView from './employee-view';
// eslint-disable-next-line import/no-named-as-default
import EmployeeFrom from './employee-form';
import ChangeStatusForm from './chnage-status-form';
import { RenderComponents } from './employee-form-fields/PayrollFields';
import { isSalaryComponentFixed, getSalaryComponentPayloadAmount } from './salary-utils';

const HrEmployee = () => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const statusDialog = useBoolean();

  const { getAllParams, setParam: setSearchParams } = useCustomSearchParams({ employee: '' });
  const searchParams = getAllParams();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [employeeParams, setEmployeeParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
  });

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
            Salary Structure
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payrollDialog.onTrue, statusDialog.onTrue]
  );

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setEmployeeParams((pre) => ({ ...pre, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setEmployeeParams((pre) => ({ ...pre, page: 1, search }));
  }, []);

  const {
    data: employee,
    isLoading,
    refetch,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
    params: employeeParams,
  });
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
  };

  const tableData = useMemo(
    () =>
      employee?.items?.map((item: any) => ({
        ...item,
        dob: dayjs(item?.dob).format('DD-MM-YYYY'),
        genderValue: item?.gender,
        doi: dayjs(item?.doj).format('DD-MM-YYYY'),
        roleValue: item?.roleName || 'Not Assigned',
        statusValue: EmployeeStatusType[item?.status],
        shiftName: `${item?.shift.name} (${dayjs(item?.shift?.startTime, 'HH:mm:ss').format('hh:mm A')} - ${dayjs(item?.shift?.endTime, 'HH:mm:ss').format('hh:mm A')})`,
        organization: item?.educationMediumStage?.name,
      })),
    [employee?.items]
  );
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'roleValue',
        label: 'Role',
        align: 'left',
        sticky: true,
        render(value, row) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <RoleColorIndicator color={getRoleColor(value)} />
              <Label variant="soft">{value}</Label>
            </Box>
          );
        },
      },
      {
        id: 'fullName',
        label: 'Name',
        minWidth: '16vw',
        sticky: true,
        align: 'left',
        render(value, row) {
          return (
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              onClick={() => setSearchParams('employee', row?.id)}
              sx={{
                cursor: 'pointer',
                '&:hover': { color: 'primary.main', textDecoration: 'underline' },
              }}
            >
              <UserHoverProfile
                user={{
                  name: value,
                  email: row.email,
                  role: row.roleValue,
                  avatarUrl: convertBase64Format(row.profilePicture),
                  organization: row.organization,
                  mobileNo: row.mobileNo,
                  department: row.department,
                  shift: row.shiftName,
                  joinDate: row.doi,
                  employeeId: row.employeeIdentifier,
                }}
                onViewProfile={() => setSearchParams('employee', row?.id)}
                avatarComp={
                  <Avatar
                    alt={value}
                    src={convertBase64Format(row.profilePicture)}
                    sx={{
                      height: 32,
                      width: 32,
                      border: (theme) => `1px solid ${theme.vars.palette.grey[400]}`,
                    }}
                  />
                }
              />{' '}
              {value} ({row.employeeIdentifier})
            </Box>
          );
        },
      },
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
        id: 'isTeaching',
        label: 'Employee Group',
        minWidth: '10vw',
        align: 'left',
        filterType: 'enum',
        enumOptions: EmployeeGroupTypeFilter,
        render(value, row) {
          return EmployeeGroupType[value === true ? 0 : 1];
        },
      },
      { id: 'shiftName', label: 'Shift', align: 'left', minWidth: 350 },
      // { id: 'organization', label: 'Organization', align: 'left' },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        enumOptions: EmployeeStatusTypeOptions,
        minWidth: '70px',
        align: 'left',
        sticky: true,
        render(value, row) {
          const color = EmployeeStatusTypeColor[row.status as EmployeeStatusType] as LabelColor;
          return <Label color={color}>{EmployeeStatusType[value]}</Label>;
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        sticky: true,
        isFilter: false,
        minWidth: '80px',
        render(value, row) {
          return (
            <ThreeDotsActions
              actions={(props) => actions({ ...props, row })}
              placement="right-top"
              showViewIcon
              showEditIcon
              handleViewClick={() => {
                setSearchParams('employee', row?.id);
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
    ],
    [actions, setSearchParams]
  );
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {open ? (
        <Box display="flex" flexDirection="column" height="100%">
          <CustomBreadcrumbs
            heading={`${editData?.id ? 'Update' : 'Add'} Employee ${editData?.fullName ? `(${editData?.fullName})` : ''}`}
            links={[
              { name: 'HR/Staff', href: hrPaths.dashboard },
              { name: 'Employee', onClick: () => handleClose() },
              { name: 'Employee List', onClick: () => handleClose() },
              {
                name: `${editData?.id ? 'Update' : 'Add'} Employee ${editData?.fullName ? `(${editData?.fullName})` : ''}`,
              },
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
              { name: 'HR/Staff', href: hrPaths.dashboard },
              { name: 'Employee', href: hrPaths.employee.list },
              { name: 'Employee List', href: hrPaths.employee.list },
            ]}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setOpen(true)}
                sx={{ px: '32px' }}
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
            isLoading={isLoading || isFetching}
            tableId="employee-table"
            serverSidePagination
            totalCount={employee?.totalCount}
            maxServerRowsPerPage={500}
            onServerPagination={handleServerPagination}
            serverSideSearch
            onServerSearch={handleServerSearch}
            columns={columns}
            data={tableData || []}
          />
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
              status={editData?.status}
            />
          </CustomDialog>
          {/* <CustomDialog maxWidth="xl" open={open} handleClose={handleClose} title="Add Employee"> */}
          {/*  <EmployeeFrom editData={editData} handleClose={handleClose} /> */}
          {/* </CustomDialog> */}
          <CustomDialog
            maxWidth="lg"
            open={payrollDialog.value}
            handleClose={handleClosePayroll}
            title="Salary Structure"
            paperProps={{ sx: { maxHeight: '70vh' } }}
          >
            {payrollDialog.value && editData && (
              <SalaryStructure handleClose={handleClosePayroll} editData={editData} />
            )}
          </CustomDialog>
        </>
      ) : (
        <EmployeeView searchParams={searchParams} setSearchParams={setSearchParams} />
      )}
    </Box>
  );
};
export default HrEmployee;

const SalaryStructure = ({ handleClose, editData }: { handleClose: () => void; editData: any }) => {
  const { data: salaryStructure, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeSalaryStructureQuery,
    params: { employeeId: editData?.id },
    options: { skip: !editData?.id },
  });

  const [updateSalaryStructure, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeSalaryStructureMutation,
  });
  const formik = useFormik({
    initialValues: {
      earningComponents: [],
      deductionComponents: [],
    },
    validationSchema: Yup.object({
      earningComponents: Yup.array().of(
        Yup.object({
          name: Yup.string(),
          componentType: Yup.string(),
          // eslint-disable-next-line func-names
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
          // eslint-disable-next-line func-names
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
        await updateSalaryStructure({
          employeeId: editData?.id,
          data,
        }).unwrap();
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (salaryStructure) {
      formik.setValues({
        earningComponents: salaryStructure?.earningComponents,
        deductionComponents: salaryStructure?.deductionComponents,
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
          onClick={() => handleClose()}
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
