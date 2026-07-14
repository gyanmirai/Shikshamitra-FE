'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IInquiryData } from 'src/types/student-enrollment';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import FileUploader from 'src/components/custom-upload';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import React, { useMemo, useState, useEffect } from 'react';
import { editorClasses } from 'src/components/editor/classes';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { Add, Cancel, CheckCircleOutline } from '@mui/icons-material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLazyGetStudentsByDivisionQuery } from 'src/redux/student';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useGetStudentAttendanceTypeQuery } from 'src/redux/student/attendance-type/attendance-type-api';
import {
  getLeaveStatusColor,
  getLeaveStatusLabel,
} from 'src/screens/hr/leave-request/leave-status.utils';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetStudentLeaveQuery,
  useAddStudentLeaveMutation,
  useRejectStudentLeaveMutation,
  useApproveStudentLeaveMutation,
} from 'src/redux/student/student-leave/student-leave-api';

import { AttendanceTypeForm } from '../setting/attendance-type';

import type { IFormValues } from './type';

const LeaveAndAbsentScreen = () => {
  // State to control the dialog visibility
  // Dialog control for add/edit form
  const dialog = useBoolean();
  // Dialog control for reject confirmation
  const confirmRejectDialog = useBoolean();
  // Dialog control for view leave details
  const viewDialog = useBoolean();
  const [viewData, setViewData] = useState<any>(null);

  const [whichStatus, setWhichStatus] = useState<EmployeeLeaveStatusType | null>(null);

  const [leaveId, setLeaveId] = useState<string>('');

  // State to store selected students for notifications
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStudent, setSelectedStudent] = useState<any>([]);

  // Boolean state to control instant notification dialog visibility
  const sendInstantNotificationDialogValue = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Handler to open the instant notification dialog when students are selected
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });
  const { data: leaveData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentLeaveQuery,
    params: query,
  });

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setWhichStatus(null);
        setLeaveId('');
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dialog.onFalse();
      confirmRejectDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      dialog.onFalse();
      confirmRejectDialog.onFalse();
    }
  };

  const tableData = useMemo(
    () =>
      leaveData?.items?.map((item: any) => ({
        ...item,
        // Use backend's totalDays value directly
        totalDays: item.totalDays,
        // Format leaveDate properly
        formattedLeaveDate: item.leaveDate ? dayjs(item.leaveDate).format('DD-MM-YYYY') : '-',
        // Format endDate with null handling
        formattedEndDate: item.endDate ? dayjs(item.endDate).format('DD-MM-YYYY') : '-',
        // Strip HTML tags from description for display
        plainDescription: item.description ? item.description.replace(/<[^>]*>/g, '').trim() : '-',
      })),
    [leaveData]
  );

  const columns: IColumn[] = useMemo(
    () => [
      // {
      //   id: 'checkBox',
      //   label: ' ',
      //   isSort: false,
      //   isFilter: false,
      //   minWidth: '60px',
      //   sticky: true,
      //   renderColumn: (value) => (
      //     <Checkbox
      //       checked={tableData?.length === selectedStudent?.length}
      //       onChange={(e) => {
      //         if (e.target.checked) {
      //           setSelectedStudent(tableData);
      //         } else {
      //           setSelectedStudent([]);
      //         }
      //       }}
      //     />
      //   ),
      //   render(value, row) {
      //     return (
      //       <Checkbox
      //         checked={selectedStudent.some((student: any) => student.id === row.id)}
      //         onChange={(e) => {
      //           if (!e.target.checked) {
      //             setSelectedStudent(
      //               selectedStudent.filter((student: any) => student.id !== row.id)
      //             );
      //           } else {
      //             setSelectedStudent([...selectedStudent, row]);
      //           }
      //         }}
      //       />
      //     );
      //   },
      // },
      {
        id: 'studentName',
        label: 'Student',
        sticky: true,
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              {value}
            </Box>
          );
        },
      },
      { id: 'organizationName', label: 'Organization' },
      { id: 'className', label: 'Class' },
      { id: 'divisionName', label: 'Division' },
      { id: 'leaveTypeName', label: 'Leave Type', minWidth: '120px', align: 'left' },
      {
        id: 'formattedLeaveDate',
        label: 'Start Date',
        filterType: 'date',
        minWidth: '120px',
        align: 'left',
      },
      {
        id: 'formattedEndDate',
        label: 'End Date',
        filterType: 'date',
        minWidth: '120px',
        align: 'left',
        render(value, row) {
          return row.isHalfDay ? dayjs(row.leaveDate).format('DD-MM-YYYY') : value;
        },
      },
      {
        id: 'totalDays',
        label: 'Total Days',
        minWidth: '120px',
        filterType: 'number',
        align: 'left',
        render(value, row) {
          if (value === null || value === undefined || Number.isNaN(value)) return '-';
          const days = parseFloat(value);
          if (days === 0.5) return 'Half Day';
          return days === 1 ? '1 Day' : `${days} Days`;
        },
      },
      {
        id: 'plainDescription',
        label: 'Description',
        minWidth: '200px',
        render(value, row) {
          return (
            <Box
              sx={{
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={value}
            >
              {value || '-'}
            </Box>
          );
        },
      },
      { id: 'remarks', label: 'Remarks' },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        sticky: true,
        enumOptions: EmployeeLeaveStatusOptions,
        render(value, row) {
          const color = EmployeeLeaveStatusTypeColor[
            value as EmployeeLeaveStatusType
          ] as LabelColor;

          return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
        },
      },
      {
        id: 'action',
        label: 'Actions',
        sticky: true,
        minWidth: 80,
        isSort: false,
        isFilter: false,
        align: 'left',
        render(value, row) {
          return (
            <Box display="flex" gap={1} alignItems="center">
              {/* View button – always visible */}
              <IconButton
                size="small"
                color="default"
                onClick={() => {
                  setViewData(row);
                  viewDialog.onTrue();
                }}
              >
                <Iconify icon="carbon:view-filled" width={18} />
              </IconButton>
              {row.status === EmployeeLeaveStatusType.Pending && (
                <>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => {
                      setWhichStatus(EmployeeLeaveStatusType.Approved);
                      setLeaveId(row.id);
                      confirmRejectDialog.onTrue();
                    }}
                  >
                    <CheckCircleOutline />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setWhichStatus(EmployeeLeaveStatusType.Rejected);
                      setLeaveId(row.id);
                      confirmRejectDialog.onTrue();
                    }}
                  >
                    <Cancel />
                  </IconButton>
                </>
              )}
            </Box>
          );
        },
      },
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Leave and Absent"
        links={[
          { name: 'Student', href: '/student/dashboard/' },
          { name: 'Attendance', href: '/student/dashboard/' },
          { name: 'Leave and Absent' },
        ]}
        action={
          <Button
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={dialog.onTrue}
            sx={{ px: '32px' }}
          >
            Leave Request
          </Button>
        }
        description="Submit a new leave request by clicking 'add leave request', manage requests in 'Actions'."
      />
      <CustomizableTable
        tableTitle="Leave and Absent"
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudent?.length !== 0}
        tableId="leave-absent-table"
        noDataText={
          <>
            No Leave And Absent Data Found{' '}
            <Box
              onClick={() => {
                dialog.onTrue();
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
              Add Leave Request
            </Box>
          </>
        }
        columns={columns}
        data={tableData || []}
        serverSide
        serverSidePagination
        serverSideSort
        totalCount={leaveData?.totalCount || 0}
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
            skipCount: 0,
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: (page - 1) * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
        isLoading={isLoading}
      />{' '}
      <CustomDialog
        maxWidth="md"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Leave Request</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Create a student leave request here by filling below fields."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <LeaveRequestForm handleClose={handleClose} isLoading={isLoading} />
      </CustomDialog>
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {whichStatus === EmployeeLeaveStatusType.Rejected ? 'Reject Leave' : 'Approve Leave'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                whichStatus === EmployeeLeaveStatusType.Rejected
                  ? 'Reject the leave request with reason'
                  : 'Approve the leave request'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={confirmRejectDialog.value}
        handleClose={() => {
          setWhichStatus(null);
          confirmRejectDialog.onFalse();
          setLeaveId('');
        }}
      >
        <LeaveAbsent handleClose={handleClose} leaveId={leaveId} status={whichStatus} />
      </CustomDialog>
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudent}
        />
      )}
      {/* View Leave Details Dialog */}
      <CustomDialog
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setViewData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Leave Request Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Displays detailed information about the student's leave request, including type, dates, reason, and approval status."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <StudentLeaveViewDetail data={viewData} />
      </CustomDialog>
    </Box>
  );
};

export default LeaveAndAbsentScreen;

const LeaveRequestForm = ({
  handleClose,
  isLoading,
}: {
  handleClose: (e: any, isSubmit: boolean) => void;
  isLoading: boolean;
}) => {
  // State to store all available organizations
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  // State to store the selected organization
  const [organization, setOrganization] = useState<string>('');
  const dialog = useBoolean();
  // State to store all available classes
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store the selected class
  const [classes, setClass] = useState<string>('');
  // State to store all available divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store the selected division
  const [division, setDivision] = useState<string>('');
  // State to store the selected student
  const [student, setStudent] = useState<IInquiryData | null>(null);
  // Selector to get the current board from Redux store
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Effect to update all organizations and set default organization when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  // Effect to update all classes and set default class when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  // Effect to update all divisions and set default division when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Returns getStudents function and loading state
  const [getStudents, { isLoading: isStudentsLoading }] = useQueryAndMutation({
    type: 'mutation',
    params: { divisionId: division },
    currentQueryAndMutation: useLazyGetStudentsByDivisionQuery,
  });

  // Fetch all attendance types
  const { data: attendanceTypes } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentAttendanceTypeQuery,
  });

  const [addLeaveRequest, { isLoading: addStudentLeaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentLeaveMutation,
  });

  const { initialValues, errors, touched, setFieldValue, values, handleSubmit } =
    useFormik<IFormValues>({
      initialValues: {
        leaveType: '',
        description: '',
        startDate: null,
        endDate: null,
        isHalfDay: false,
        rejectionReason: '',
        status: null,
        docs: '',
      },
      validationSchema: Yup.object({
        leaveType: Yup.string().required('Leave Type is required'),
        isHalfDay: Yup.boolean(),
        startDate: Yup.mixed()
          .required('Start Date is required')
          .test(
            'is-valid-dayjs',
            'Start Date must be a valid date',
            (value) => value && dayjs(value as any).isValid()
          ),
        endDate: Yup.mixed()
          .nullable()
          .test(
            'is-valid-dayjs',
            'End Date must be a valid date',
            (value) => !value || dayjs(value as any).isValid()
          )
          .test('endDate', '', (value, context) => {
            const { isHalfDay } = context.parent;
            const { startDate } = context.parent;
            if (isHalfDay) return true;
            if (startDate && value) {
              const fullStartDate = dayjs(startDate);
              const endDate = dayjs(value as any);

              const isSameOrAfter =
                endDate.isSame(fullStartDate, 'day') || endDate.isAfter(fullStartDate, 'day');

              return (
                isSameOrAfter ||
                context.createError({ message: 'End date must be same or after start date' })
              );
            }
            if (!value && !isHalfDay) {
              return context.createError({ message: 'End Date is required' });
            }
            return true;
          }),
        description: Yup.string().required('Leave Description is required'),
        status: Yup.string().nullable(),
        rejectionReason: Yup.string().test(
          'rejectionReason',
          'Rejection reason is required',
          (value, context) => {
            const { status } = context.parent;
            if (status === EmployeeLeaveStatusType.Rejected) {
              return !!value || context.createError({ message: 'Rejection reason is required' });
            }
            return true;
          }
        ),
      }),
      onSubmit: async (val) => {
        try {
          // this will after so, i'm commenting this code
          const res = await addLeaveRequest({
            studentId: student?.studentId,
            studentLeaveTypeId: val.leaveType,
            isHalfDay: val.isHalfDay,
            description: val.description,
            attachment: val.docs.replace(/^data:\w+\/\w+;base64,/, '') || undefined,
            attachmentFileName: `${student?.firstName} ${student?.lastName} ${val.leaveType} ${val.startDate?.format(dateFormat)}`,
            attachmentContentType: 'string',

            leaveDate: dateConvertor(val?.startDate?.format(dateFormat) || ''),
            ...(!val.isHalfDay
              ? {
                  endDate: dateConvertor(val?.endDate?.format(dateFormat) || ''),
                }
              : {}),
          }).unwrap();
          shikshaMitraToast.success({
            message: `Leave request added by ${student?.firstName} ${student?.lastName} for ${values.startDate?.format('')}`,
          });
          handleClose(null, true);
        } catch (err) {
          console.error(err);
        }
      },
    });

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              label="Organization"
              disabled={!medium}
              options={allOrganization || []}
              value={organization}
              labelKey="name"
              valueKey="id"
              onChange={(value: any) => {
                setOrganization(value || '');
                setStudent(null);
              }}
              formControlProps={{ sx: { width: '100%' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              label="Class"
              disabled={!organization}
              options={allClass || []}
              value={classes}
              labelKey="name"
              valueKey="id"
              onChange={(value: any) => {
                setClass(value || '');
                setStudent(null);
              }}
              formControlProps={{ sx: { width: '100%' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              label="Division"
              disabled={!classes}
              options={allDivision || []}
              value={division}
              labelKey="name"
              valueKey="id"
              onChange={(value: any) => {
                setDivision(value || '');
                setStudent(null);
              }}
              formControlProps={{ sx: { width: '100%' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomTooltip
              placement="top"
              title={
                student
                  ? `${student?.firstName || ''} ${student?.lastName || ''}`.trim()
                  : undefined
              }
            >
              <PaginatedSearchSelect
                key={`${organization}-${classes}-${division}`}
                label="Student"
                isLoading={isStudentsLoading}
                noOptionsText="No Student Found"
                disabled={!division}
                fetchOptions={async (query: string, page: number) => {
                  if (!division) return { data: [], hasMore: false };
                  try {
                    const res = await getStudents(division).unwrap();

                    let filteredItems = res?.items || [];
                    if (query) {
                      const lowerQuery = query.toLowerCase();
                      filteredItems = filteredItems.filter((item: any) =>
                        `${item.firstName || ''} ${item.lastName || ''} ${item.middleName || ''}`
                          .toLowerCase()
                          .includes(lowerQuery)
                      );
                    }

                    return {
                      data: filteredItems?.map((item: any) => ({
                        label: `${item?.firstName || ''} ${item?.lastName || ''}`,
                        id: item.studentId,
                        originalData: item,
                      })),
                      hasMore: false,
                    };
                  } catch {
                    return { data: [], hasMore: false };
                  }
                }}
                value={
                  student
                    ? {
                        label: `${student.firstName || ''} ${student.lastName || ''}`,
                        id: student.studentId as string,
                      }
                    : null
                }
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={(option: any) => option?.label || ''}
                renderOption={(prop, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.label}
                  </li>
                )}
                minChars={0}
                onChange={(_, value: any) => {
                  setStudent(value?.originalData || null);
                }}
                fullWidth
                sx={{ width: '100%' }}
                size="small"
              />
            </CustomTooltip>
          </Grid>
        </Grid>

        {student?.studentId && (
          <Box component="form" mt={3}>
            <Grid container spacing={3}>
              {/* Row 1: Leave Type and Half Day Button */}
              <Grid size={{ xs: 12, sm: values.isHalfDay ? 4 : 3 }}>
                <ShakingTextField error={!!(touched.leaveType && errors.leaveType)}>
                  <CustomSelect
                    label="Leave Type *"
                    options={attendanceTypes?.items || []}
                    value={values.leaveType}
                    labelKey="leaveTypeName"
                    valueKey="id"
                    onChange={(value: any) => {
                      setFieldValue('leaveType', value || '');
                    }}
                    error={!!(touched.leaveType && errors.leaveType)}
                    helperText={(touched.leaveType && errors.leaveType) as string}
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </ShakingTextField>

                <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Leave Type">
                  <AttendanceTypeForm handleClose={dialog.onFalse} editData={null} />
                </CustomDialog>
              </Grid>

              <Grid size={{ xs: 12, sm: values.isHalfDay ? 4 : 3 }}>
                <Button
                  variant={values.isHalfDay ? 'contained' : 'outlined'}
                  color={values.isHalfDay ? 'primary' : 'inherit'}
                  size="small"
                  fullWidth
                  onClick={() => {
                    setFieldValue('isHalfDay', !values.isHalfDay);
                    if (!values.isHalfDay) setFieldValue('endDate', null);
                  }}
                  sx={{
                    height: '36px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    border: values.isHalfDay ? 'none' : '1px solid #e0e0e0',
                    '&:hover': {
                      backgroundColor: values.isHalfDay ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  Half Day
                </Button>
              </Grid>

              {/* Row 2: Date Fields */}
              <Grid size={{ xs: 12, sm: values.isHalfDay ? 4 : 3 }}>
                <ShakingTextField error={touched.startDate && Boolean(errors.startDate)}>
                  <DatePicker
                    label={values.isHalfDay ? 'Date *' : 'Start Date *'}
                    onChange={(value) => setFieldValue('startDate', value)}
                    format="DD-MM-YYYY"
                    minDate={dayjs(currentYear?.startDate)}
                    maxDate={dayjs(currentYear?.endDate)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        helperText: touched.startDate && errors.startDate,
                        error: touched.startDate && Boolean(errors.startDate),
                      },
                    }}
                    disablePast
                  />
                </ShakingTextField>
              </Grid>

              {!values.isHalfDay && (
                <Grid size={{ xs: 12, sm: values.isHalfDay ? 4 : 3 }}>
                  <ShakingTextField error={touched.endDate && Boolean(errors.endDate)}>
                    <DatePicker
                      label="End Date *"
                      format="DD-MM-YYYY"
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      onChange={(value) => setFieldValue('endDate', value)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          helperText: touched.endDate && errors.endDate,
                          error: touched.endDate && Boolean(errors.endDate),
                        },
                      }}
                      disablePast
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Row 3: Description and Upload */}
              <Grid size={{ xs: 12 }} mb={-2}>
                <Typography variant="subtitle2">Leave Description</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ShakingTextField error={touched.description && Boolean(errors.description)}>
                  <Editor
                    onChange={(value) => setFieldValue('description', value)}
                    placeholder="Leave description *"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      [`& .${editorClasses.content.root}`]: {
                        minHeight: '200px',
                        height: '100%',
                        flex: 1,
                        '& .tiptap': {
                          '&.ProseMirror': {
                            padding: '16px',
                            paddingBottom: '24px',
                            minHeight: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                          },
                        },
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FileUploader
                  value={typeof values.docs === 'string' ? undefined : values.docs}
                  multiple={false}
                  onChange={(value) => setFieldValue('docs', value)}
                  primaryText="Please Upload Your File"
                  secondaryText="Maximum file size is 5MB"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          onClick={() => {
            handleClose(null, false);
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={(e: any) => handleSubmit(e)}
          variant="contained"
          size="small"
          loading={addStudentLeaveLoading}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

const LeaveAbsent = ({
  handleClose,
  status,
  leaveId,
}: {
  handleClose: (e: any, isSubmit: boolean) => void;
  status: EmployeeLeaveStatusType | null;
  leaveId: string;
}) => {
  /**
   * Custom hook for managing leave status changes
   * Uses mutation to update leave request status in the backend
   * @returns {Array} - Array containing the mutation function
   */
  const [approveStudentLeave, { isLoading: isApproveLeaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveStudentLeaveMutation,
  });
  const [rejectStudentLeave, { isLoading: isRejectLeaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectStudentLeaveMutation,
  });

  const { initialValues, values, errors, touched, handleChange, handleSubmit } = useFormik({
    initialValues: {
      remarks: '',
    },
    validationSchema: Yup.object({
      remarks:
        status === EmployeeLeaveStatusType.Rejected
          ? Yup.string().required('Remarks is required')
          : Yup.string(),
    }),
    async onSubmit() {
      try {
        if (status === EmployeeLeaveStatusType.Approved) {
          await approveStudentLeave({
            id: leaveId,
            data: {
              status,
              remarks: values.remarks,
              rejectionReason: values.remarks,
            },
          }).unwrap();
        } else if (status === EmployeeLeaveStatusType.Rejected) {
          await rejectStudentLeave({
            id: leaveId,
            data: {
              status,
              remarks: values.remarks,
              rejectionReason: values.remarks,
            },
          }).unwrap();
        }
        handleClose(null, true);
        shikshaMitraToast.success({
          message: `Leave Request ${EmployeeLeaveStatusType[status as EmployeeLeaveStatusType]} successfully`,
        });
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogScrollContent>
          <TextField
            value={values.remarks}
            onChange={handleChange}
            name="remarks"
            label={status === EmployeeLeaveStatusType.Rejected ? 'Remarks *' : 'Remarks'}
            multiline
            fullWidth
            rows={4}
            error={touched.remarks && !!errors.remarks}
            helperText={touched.remarks && (errors.remarks as string)}
            sx={{ mb: 2 }}
          />
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={() => {
              handleClose(null, false);
            }}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            startIcon={
              <Iconify
                icon={
                  status === EmployeeLeaveStatusType.Rejected
                    ? GlobalIcons.reject
                    : GlobalIcons.approvedIcon
                }
              />
            }
            onClick={(e: any) => handleSubmit(e)}
            variant="contained"
            size="small"
            loading={isApproveLeaveLoading || isRejectLeaveLoading}
          >
            {status === EmployeeLeaveStatusType.Rejected ? 'Reject' : 'Approve'}
          </LoadingButton>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

// ---------------------------------------------------------------------------
// StudentLeaveViewDetail
// Renders all fields of a student leave request in a read-only detail panel,
// mirroring the HR LeaveRequestForm from leave-calender.tsx.
// ---------------------------------------------------------------------------
const StudentLeaveViewDetail = ({ data }: { data: any }) => {
  const theme = useTheme();

  if (!data) return null;

  // eslint-disable-next-line react/no-unstable-nested-components
  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, mr: 2 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value}
      </Typography>
    </Box>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const SectionHeader = ({ icon, label }: { icon: string; label: string }) => (
    <Stack direction="row" alignItems="center" spacing={0.75} mb={2}>
      <Iconify icon={icon} width={15} color="text.disabled" />
      <Typography
        variant="overline"
        sx={{ color: 'text.disabled', letterSpacing: 1.2, lineHeight: 1, fontSize: '0.68rem' }}
      >
        {label}
      </Typography>
    </Stack>
  );

  const isHalfDay = data.isHalfDay ?? data.halfDay ?? false;
  const startDate = data.leaveDate || data.startDate;
  const { endDate } = data;
  const { totalDays } = data;
  const plainDescription = data.description
    ? data.description.replace(/<[^>]*>/g, '').trim()
    : null;

  return (
    <Scrollbar sx={{ maxHeight: 520 }}>
      {/* ── Header ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box minWidth={0}>
            <Typography variant="h5" fontWeight={700} mb={0.5}>
              {data.studentName || '-'}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {data.className || data.class || ''}
                {data.divisionName ? ` · ${data.divisionName}` : ''}
              </Typography>
              {data.organizationName && (
                <>
                  <Box
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      bgcolor: 'text.disabled',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {data.organizationName}
                  </Typography>
                </>
              )}
            </Stack>
          </Box>
          <Label color={getLeaveStatusColor(data.status)} sx={{ flexShrink: 0, mt: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'currentColor',
                mr: 0.75,
                display: 'inline-block',
                opacity: 0.85,
              }}
            />
            {getLeaveStatusLabel(data.status)}
          </Label>
        </Box>
      </Box>

      <Divider />

      {/* ── Section: Student Information ── */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <SectionHeader icon="mdi:account-outline" label="Student Information" />
        <Stack spacing={1.5}>
          <InfoRow label="Organization" value={data.organizationName || '-'} />
          <InfoRow label="Class" value={data.className || '-'} />
          <InfoRow label="Division" value={data.divisionName || '-'} />
        </Stack>
      </Box>

      <Divider />

      {/* ── Section: Leave Details ── */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <SectionHeader icon="mdi:calendar-outline" label="Leave Details" />
        <Stack spacing={1.5}>
          <InfoRow label="Leave type" value={data.leaveTypeName || '-'} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, mr: 2 }}>
              Duration
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography variant="body2" fontWeight={600}>
                {startDate ? dayjs(startDate).format('DD MMM YYYY') : '-'}
              </Typography>
              {!isHalfDay && endDate && (
                <>
                  <Iconify icon="mdi:arrow-right" width={14} color="text.disabled" />
                  <Typography variant="body2" fontWeight={600}>
                    {dayjs(endDate).format('DD MMM YYYY')}
                  </Typography>
                </>
              )}
              {totalDays != null && (
                <Chip
                  label={`${totalDays} ${totalDays === 1 || totalDays === 0.5 ? 'day' : 'days'}`}
                  size="small"
                  sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
                />
              )}
            </Stack>
          </Box>
          <InfoRow label="Session" value={isHalfDay ? 'Half day' : 'Full day'} />
        </Stack>
      </Box>

      {/* ── Section: Description ── */}
      {plainDescription && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 2.5 }}>
            <SectionHeader icon="mdi:format-list-text" label="Description" />
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
              }}
            >
              <Typography variant="body2" lineHeight={1.85}>
                {plainDescription}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* ── Section: Remarks ── */}
      {data.remarks && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 2.5 }}>
            <SectionHeader icon="mdi:comment-text-outline" label="Remarks" />
            <Typography variant="body2" color="text.secondary" lineHeight={1.75}>
              {data.remarks}
            </Typography>
          </Box>
        </>
      )}

      {/* ── Section: Attachment ── */}
      {data.attachmentUrl && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 2.5 }}>
            <SectionHeader icon="mdi:paperclip" label="Attachment" />
            <Box
              component="button"
              onClick={() => window.open(data.attachmentUrl, '_blank')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.875,
                borderRadius: 5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  borderColor: 'primary.main',
                },
              }}
            >
              <Iconify icon="mdi:file-document-outline" width={14} color="primary.main" />
              <Typography variant="body2" fontWeight={500} color="text.primary">
                {data.attachmentUrl.split('/').pop() || 'View Document'}
              </Typography>
              <Iconify icon="mdi:arrow-right" width={14} color="text.disabled" />
            </Box>
          </Box>
        </>
      )}
    </Scrollbar>
  );
};
