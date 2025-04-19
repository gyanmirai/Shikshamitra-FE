'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Division, Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { Form, Field, Formik, useFormik } from 'formik';
import React, { useMemo, useState, useEffect } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
import { Add, Cancel, CheckCircleOutline } from '@mui/icons-material';
import {
  Box,
  Grid,
  Stack,
  Button,
  Avatar,
  Tooltip,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

import { Label } from 'src/components/label';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import { AttendanceTypeForm } from '../setting/attendance-type';

const LeaveAndAbsentScreen = () => {
  // State to control the dialog visibility
  // Dialog control for add/edit form
  const dialog = useBoolean();
  // Dialog control for reject confirmation
  const confirmRejectDialog = useBoolean();

  // Mock data for leave requests table
  const [tableData, setTableData] = useState([
    {
      medium: 'English',
      organization: 'Primary',
      class: '10th',
      division: 'A',
      student: 'John Doe',
      leaveType: 'Sick Leave',
      id: '1',
      startDate: '01-05-2023',
      endDate: '03-05-2023',
      description: 'Fever and cold',
      status: 'Approved',
    },
    {
      medium: 'Spanish',
      organization: 'Secondary',
      class: '9th',
      division: 'B',
      student: 'Jane Smith',
      leaveType: 'Personal Leave',
      id: '2',
      startDate: '10-05-2023',
      endDate: '12-05-2023',
      description: 'Family event',
      status: 'Pending',
    },
    {
      medium: 'French',
      organization: 'Primary',
      class: '11th',
      division: 'C',
      student: 'Alice Johnson',
      leaveType: 'Vacation',
      id: '3',
      startDate: '01-06-2023',
      endDate: '07-06-2023',
      description: 'Summer vacation',
      status: 'Approved',
    },
  ]);

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

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Leave and Absent"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Leave and Absent' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Add />} variant="contained" size="small" onClick={dialog.onTrue}>
            Add Leave Request
          </Button>
        }
        description="On this page, you can create new leave requests. All previously created requests are listed below, where you can approve or reject them as needed."
      />
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudent.length !== 0}
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
        searchFieldProps={{
          placeholder: 'Search by Student, Medium, Organization, Class...',
          label: 'Search by Student, Medium, Organization, Class...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        columns={[
          {
            id: 'checkBox',
            label: ' ',
            isSort: false,
            isFilter: false,
            minWidth: '60px',
            sticky: true,
            renderColumn: (value) => (
              <Checkbox
                checked={tableData.length === selectedStudent.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudent(tableData);
                  } else {
                    setSelectedStudent([]);
                  }
                }}
              />
            ),
            render(value, row) {
              return (
                <Checkbox
                  checked={selectedStudent.some((student: any) => student.id === row.id)}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setSelectedStudent(
                        selectedStudent.filter((student: any) => student.id !== row.id)
                      );
                    } else {
                      setSelectedStudent([...selectedStudent, row]);
                    }
                  }}
                />
              );
            },
          },
          {
            id: 'student',
            label: 'Student',
            render(value, row) {
              return (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 30, height: 30 }} alt={value} title={value} />
                  {value}
                </Box>
              );
            },
          },
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'Organization' },
          { id: 'class', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'leaveType', label: 'Leave Type', minWidth: '120px', align: 'left' },
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
          { id: 'description', label: 'Description' },
          { id: 'remarks', label: 'Remarks' },
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
            render(value, row) {
              return (
                <Box display="flex" gap={1}>
                  {row.status === 'Pending' ? (
                    <>
                      <IconButton size="small" color="success" onClick={confirmRejectDialog.onTrue}>
                        <CheckCircleOutline />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={confirmRejectDialog.onTrue}>
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
        data={tableData}
      />{' '}
      <CustomDialog
        maxWidth="md"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Leave Request</Typography>
            <Tooltip
              arrow
              placement="right"
              title="From here, you can create a leave request by selecting the student and providing the necessary details such as leave dates, reason, and any additional notes."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
      >
        <LeaveRequestForm />
      </CustomDialog>
      <CustomDialog
        title="Remarks"
        open={confirmRejectDialog.value}
        handleClose={confirmRejectDialog.onFalse}
      >
        <LeaveAbsent handleClose={confirmRejectDialog.onFalse} />
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

const leaveTypes = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
];

const LeaveRequestForm = () => {
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
  const [student, setStudent] = useState('');
  // Selector to get the current board from Redux store
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Query hook for fetching filtered student data
  // Returns getStudents function, StudentsData response and loading state
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
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

  // Transform students data to include full name
  const studentOptions = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        id: item.id,
        name: `${item.firstName} ${item.lastName}`,
      })) || [],
    [StudentsData?.items]
  );

  // Memoized validation schema for the form
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        leaveType: Yup.string().required('Leave type is required'),
        isHalfDay: Yup.boolean(),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.date().when('isHalfDay', (isHalfDay, schema) =>
          isHalfDay ? schema : schema.required('End date is required')
        ),
        description: Yup.string().required('Description is required'),
      }),
    []
  );

  return (
    <Box p={2}>
      <Box display="flex" my={2} gap={2} flexWrap="wrap">
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
        <Autocomplete
          loading={false}
          noOptionsText="No Student Found"
          sx={{ maxWidth: '250px', width: '100%' }}
          value={studentOptions.find((s: Record<string, string>) => s.id === student) || null}
          onChange={(e, value: any) => {
            setStudent(value?.id);
          }}
          options={studentOptions || []}
          getOptionLabel={(option: any) => option?.name || ''}
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
              {option.name}
            </li>
          )}
        />
      </Box>

      {student && (
        <Formik
          initialValues={{
            leaveType: '',
            description: '',
            startDate: null,
            endDate: null,
            isHalfDay: false,
            rejectionReason: '',
            status: null,
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {}}
        >
          {({ errors, touched, setFieldValue, values, submitForm }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    name="leaveType"
                    as={TextField}
                    select
                    fullWidth
                    label="Leave Type"
                    size="small"
                    error={touched.leaveType && errors.leaveType}
                    helperText={touched.leaveType && errors.leaveType}
                  >
                    {leaveTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    textAlign="right"
                    color="primary.main"
                    fontSize={12}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      dialog.onTrue();
                    }}
                  >
                    Add Leave Type ?
                  </Typography>
                  <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Leave Type">
                    <AttendanceTypeForm handleClose={dialog.onFalse} editData={null} />
                  </CustomDialog>
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Field
                        name="isHalfDay"
                        as={Checkbox}
                        onChange={(e: any) => {
                          setFieldValue('isHalfDay', e.target.checked);
                          if (e.target.checked) {
                            setFieldValue('endDate', null);
                          }
                        }}
                      />
                    }
                    label="Half Day"
                  />
                </Grid>
                <Grid item xs={4}>
                  <DateTimePicker
                    label={values.isHalfDay ? 'Date and Time' : 'Start Date and Time'}
                    onChange={(value) => setFieldValue('startDate', value)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        helperText: touched.startDate && errors.startDate,
                        error: touched.startDate && Boolean(errors.startDate),
                      },
                    }}
                  />
                </Grid>
                {!values.isHalfDay && (
                  <Grid item xs={4}>
                    <DateTimePicker
                      label="End Date and Time"
                      onChange={(value) => setFieldValue('endDate', value)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          helperText: touched.endDate && errors.endDate,
                          error: touched.endDate && Boolean(errors.endDate),
                        },
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Editor
                    onChange={(value) => {
                      setFieldValue('description', value);
                    }}
                    placeholder="Leave description"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  <Button
                    startIcon={<Iconify icon={GlobalIcons.submit} />}
                    type="submit"
                    variant="contained"
                    size="small"
                    color="primary"
                  >
                    RequestSubmit Leave
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      )}
    </Box>
  );
};

const LeaveAbsent = ({ handleClose }: any) => {
  // Initialize form state and handlers using Formik
  // values: contains form field values
  // handleChange: handles input field changes
  // handleSubmit: handles form submission
  const { values, handleChange, handleSubmit } = useFormik({
    // Set initial form values
    initialValues: {
      remarks: '',
    },
    // Empty submit handler - to be implemented
    onSubmit() {},
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
