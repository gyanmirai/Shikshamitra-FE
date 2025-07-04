'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Add, Cancel, CheckCircleOutline } from '@mui/icons-material';
import {
  Box,
  Grid,
  Stack,
  Button,
  Avatar,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentAttendanceTypeQuery } from 'src/redux/student/attendance-type/attendance-type-api';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';
import {
  useGetStudentLeaveQuery,
  useAddStudentLeaveMutation,
  useChangeLeaveStatusMutation,
} from 'src/redux/student/student-leave/student-leave-api';

import { Label } from 'src/components/label';
import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { editorClasses } from 'src/components/editor/classes';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import { AttendanceTypeForm } from '../setting/attendance-type';

import type { IFormValues, ILeaveAbsent } from './type';
import type { IInquiryData } from '../../enrollment/Inquiry';

const LeaveAndAbsentScreen = () => {
  // State to control the dialog visibility
  // Dialog control for add/edit form
  const dialog = useBoolean();
  // Dialog control for reject confirmation
  const confirmRejectDialog = useBoolean();

  const [whichStatus, setWhichStatus] = useState<EmployeeLeaveStatusType | null>(null);

  const [leaveId, setLeaveId] = useState<string>('');

  // State to store selected students for notifications
  const [selectedStudent, setSelectedStudent] = useState<any>([]);

  // Boolean state to control instant notification dialog visibility
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler to open the instant notification dialog when students are selected
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const { leaveData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentLeaveQuery,
  });

  const tableData = useMemo(
    () =>
      leaveData?.items?.map((item: any) => ({
        ...item,
        startDate: dayjs(item.startDate).format('DD/MM/YYYY'),
        endDate: dayjs(item.endDate).format('DD/MM/YYYY'),
        name: `${item.student?.lastName} ${item.student?.firstName} ${
          item.student?.middleName ? item.student?.middleName : ''
        }`,
        totalDays: dayjs(item.endDate).diff(item.startDate, 'day'),
      })),
    [leaveData]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Leave and Absent"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '/student/attendance/dashboard/' },
          { name: 'Leave and Absent' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Add />} variant="contained" size="small" onClick={dialog.onTrue}>
            Leave Request
          </Button>
        }
        description="Submit a new leave request by clicking 'add leave request', manage requests in 'Actions'."
      />
      <CustomizableTable
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
        columns={[
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
            id: 'name',
            label: 'Student',
            sticky: true,
            render(value, row) {
              return (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 30, height: 30 }} alt={value} title={value} />
                  {value}
                </Box>
              );
            },
          },
          { id: 'student.educationMedium.name', label: 'Medium' },
          { id: 'student.educationMediumStage.name', label: 'Organization' },
          { id: 'student.standard.name', label: 'Class' },
          { id: 'student.division.name', label: 'Division' },
          { id: 'leavePolicy.cleaveType', label: 'Leave Type', minWidth: '120px', align: 'left' },
          {
            id: 'startDate',
            label: 'Start Date',
            filterType: 'date',
            minWidth: '120px',
            align: 'left',
          },
          {
            id: 'endDate',
            label: 'End Date',
            filterType: 'date',
            minWidth: '120px',
            align: 'left',
          },
          {
            id: 'totalDays',
            label: 'Total Days',
            minWidth: '10vw',
            filterType: 'number',
            align: 'left',
          },
          { id: 'description', label: 'Description' },
          { id: 'rejectionReason', label: 'Remarks' },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: EmployeeLeaveStatusOptions,
            render(value, row) {
              const color = EmployeeLeaveStatusTypeColor[
                value as EmployeeLeaveStatusType
              ] as LabelColor;

              return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            sticky: true,
            minWidth: 80,
            isSort: false,
            isFilter: false,
            align: 'left',
            render(value, row) {
              return (
                <Box display="flex" gap={1}>
                  {row.status === 'Pending' ? (
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
                  ) : (
                    '-'
                  )}
                </Box>
              );
            },
          },
        ]}
        data={tableData || []}
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
        <LeaveRequestForm handleClose={dialog.onFalse} />
      </CustomDialog>
      <CustomDialog
        title="Remarks"
        open={confirmRejectDialog.value}
        handleClose={() => {
          setWhichStatus(null);
          confirmRejectDialog.onFalse();
          setLeaveId('');
        }}
      >
        <LeaveAbsent
          handleClose={() => {
            setWhichStatus(null);
            confirmRejectDialog.onFalse();
            setLeaveId('');
          }}
          leaveId={leaveId}
          status={whichStatus}
        />
      </CustomDialog>
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudent}
        />
      )}
    </Box>
  );
};

export default LeaveAndAbsentScreen;

// Configuration for file upload component
const uploadProps = {
  multiple: true,
  accept: { 'image/*': [] },
};
const LeaveRequestForm = ({ handleClose }: { handleClose: () => void }) => {
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

  // Returns getStudents function, StudentsData response and loading state
  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Effect to fetch students when division, class and organization are selected
  useEffect(() => {
    if (division && classes && organization) {
      getStudents({
        educationMediumStageId: organization,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, organization, getStudents]);

  const [addLeaveRequest] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentLeaveMutation,
  });
  // Fetch all attendance types
  const { data: attendanceTypes, isLoading: isAttandanceTypeLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentAttendanceTypeQuery,
  });
  // Handler to remove a single file attachment
  const handleRemoveFile = useCallback(
    (
      inputFile: File | string,
      values: IFormValues,
      setFieldValue: (field: string, value: any) => void
    ) => {
      setFieldValue('docs', '');
    },
    []
  );

  // Handler to remove all file attachments
  const handleRemoveAllFiles = useCallback(
    (values: IFormValues, setFieldValue: (field: string, value: any) => void) => {
      setFieldValue('docs', '');
    },
    []
  );

  const { errors, touched, setFieldValue, values, submitForm, handleSubmit } =
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
        leaveType: Yup.string().required('Leave type is required'),
        isHalfDay: Yup.boolean(),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.string()
          .nullable()
          .test('endDate', '', (value, context) => {
            const { isHalfDay } = context.parent;
            const { startDate } = context.parent;
            if (isHalfDay) return true;
            if (startDate && value) {
              const fullStartDate = dayjs(startDate);
              const endDate = dayjs(value);

              const isAfter = endDate.isAfter(fullStartDate);

              return (
                isAfter || context.createError({ message: 'End date must be after start date' })
              );
            }
            if (!value && !isHalfDay) {
              return context.createError({ message: 'End date is required' });
            }
            return true;
          }),
        description: Yup.string().required('Description is required'),
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
          const res = await addLeaveRequest({
            studentId: student?.id,
            leaveTypeId: val.leaveType,
            halfDay: val.isHalfDay,
            startDate: dateConvertor(val?.startDate?.format(dateFormat) || ''),
            ...(!val.isHalfDay
              ? {
                  endDate: dateConvertor(val?.endDate?.format(dateFormat) || ''),
                }
              : {}),
            description: val.description,
            attachment: val.docs.replace(/^data:\w+\/[\w-]+;base64,/, ''),
          }).unwrap();
          handleClose();
        } catch (err) {
          console.log(err);
        }
      },
    });
  return (
    <>
      <DialogScrollContent>
        <Grid container spacing={2} sx={{ my: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSelect
              options={allOrganization}
              label="Organization"
              value={organization}
              onChange={(val) => setOrganization(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '100%' } }}
              disabled={!medium}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClass(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '100%' } }}
              disabled={!organization}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '100%' } }}
              disabled={!classes}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              loading={false}
              noOptionsText="No Student Found"
              sx={{ width: '100%' }}
              value={student}
              onChange={(e, value: any) => {
                setStudent(value);
              }}
              options={StudentsData?.items || []}
              getOptionLabel={(option: any) =>
                `${option?.firstName || ''} ${option?.lastName || ''}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Student"
                  placeholder="Search  Student"
                  fullWidth
                />
              )}
              renderOption={(prop: any, option: any) => (
                <li {...prop} key={option.id}>
                  {option.firstName || ''} {option.lastName || ''}
                </li>
              )}
            />
          </Grid>
        </Grid>

        {student?.id && (
          <Box component="form">
            <Grid container spacing={2}>
              {/* Row 1: Leave Type and Half Day Button */}
              <Grid item xs={8}>
                <TextField
                  name="leaveType"
                  select
                  fullWidth
                  label="Leave Type"
                  size="small"
                  value={values.leaveType}
                  onChange={(e) => setFieldValue('leaveType', e.target.value)}
                  error={touched.leaveType && Boolean(errors.leaveType)}
                  helperText={touched.leaveType && errors.leaveType}
                >
                  {attendanceTypes?.items?.map((option: ILeaveAbsent) => (
                    <MenuItem
                      key={option.type}
                      value={option.id}
                      sx={{ bgcolor: `${option.color}20` }}
                    >
                      {option.type}
                    </MenuItem>
                  ))}
                </TextField>
                <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Leave Type">
                  <AttendanceTypeForm handleClose={dialog.onFalse} editData={null} />
                </CustomDialog>
              </Grid>
              <Grid
                item
                xs={4}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Button
                  variant={values.isHalfDay ? 'contained' : 'outlined'}
                  color={values.isHalfDay ? 'primary' : 'inherit'}
                  size="small"
                  fullWidth
                  onClick={() => {
                    setFieldValue('isHalfDay', !values.isHalfDay);
                    if (!values.isHalfDay) {
                      setFieldValue('endDate', null);
                    }
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

              {/* Row 2: Date Fields - Full Width */}
              <Grid item xs={values.isHalfDay ? 12 : 6}>
                <DatePicker
                  label={values.isHalfDay ? 'Date' : 'Start Date'}
                  onChange={(value) => setFieldValue('startDate', value)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      helperText: touched.startDate && errors.startDate,
                      error: touched.startDate && Boolean(errors.startDate),
                    },
                  }}
                />
              </Grid>
              {!values.isHalfDay && (
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    onChange={(value) => setFieldValue('endDate', value)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        helperText: touched.endDate && errors.endDate,
                        error: touched.endDate && Boolean(errors.endDate),
                      },
                    }}
                  />
                </Grid>
              )}

              {/* Row 3: Description and Upload Document */}
              <Grid item xs={9} sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}>
                <Editor
                  onChange={(value) => {
                    setFieldValue('description', value);
                  }}
                  placeholder="Leave description"
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
              </Grid>
              <Grid item xs={3} sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}>
                <Upload
                  {...uploadProps}
                  thumbnail
                  value={values.docs}
                  onDrop={(acceptedFiles) => {
                    const file = acceptedFiles[0];
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      const base64String = reader.result;
                      setFieldValue('docs', base64String);
                    };
                  }}
                  multiple={false}
                  onRemove={(file) => handleRemoveFile(file, values, setFieldValue)}
                  onRemoveAll={() => handleRemoveAllFiles(values, setFieldValue)}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          onClick={handleClose}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={(e: any) => handleSubmit(e)}
          variant="contained"
          size="small"
        >
          Submit
        </Button>
      </DialogActions>
    </>
  );
};

const LeaveAbsent = ({
  handleClose,
  status,
  leaveId,
}: {
  handleClose: () => void;
  status: EmployeeLeaveStatusType | null;
  leaveId: string;
}) => {
  /**
   * Custom hook for managing leave status changes
   * Uses mutation to update leave request status in the backend
   * @returns {Array} - Array containing the mutation function
   */
  const [changeStatus] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeLeaveStatusMutation,
  }); // Initialize form state and handlers using Formik
  // values: contains form field values
  // handleChange: handles input field changes
  // handleSubmit: handles form submission
  const { values, handleChange, handleSubmit } = useFormik({
    // Set initial form values
    initialValues: {
      remarks: '',
    },
    // Empty submit handler - to be implemented
    async onSubmit() {
      try {
        await changeStatus({
          id: leaveId,
          body: {
            status,
            rejectionReason: values.remarks,
          },
        }).unwrap();
        handleClose();
        shikshaMitraToast.success({
          message: `Leave Request ${EmployeeLeaveStatusType[status as EmployeeLeaveStatusType]}  successfully`,
        });
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={3}>
          <TextField
            value={values.remarks}
            onChange={handleChange}
            label="Remarks"
            multiline
            fullWidth
            rows={4}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Box>
  );
};
