'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

const BiometricIntegrationScreen = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const isDownLoadingTemplate = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const open = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const handleDownloadTemplate = () => {
    isDownLoadingTemplate.onTrue();
    const link = document.createElement('a');
    link.href = '/templates/Employee_import_attendance.xlsx'; // relative path to public folder
    link.download = 'Employee_import_attendance.xlsx'; // filename for download
    link.click();
    isDownLoadingTemplate.onFalse();
  };
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      open.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      open.onFalse();
      setEditData(null);
    }
  };
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Import Attendance"
        description="Configure Attendance Types, Leave Policies, and Late Arrival Rules for accurate tracking and enforcement."
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave', href: '/hr/biometric-integration/' },
          { name: 'Import Attendance' },
        ]}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
          pl: 1,
          mt: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Date Picker */}
        <Box>
          <DatePicker
            label="Date"
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            value={date}
            onChange={(newValue) => setDate(newValue)}
            format="DD-MM-YYYY"
            views={['year', 'month', 'day']}
            disableFuture
            slotProps={{
              textField: {
                size: 'small',
              },
            }}
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LoadingButton
            loading={isDownLoadingTemplate.value}
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="eva:download-fill" />}
            onClick={handleDownloadTemplate}
          >
            Download Sample File
          </LoadingButton>

          <Button variant="contained" size="small" startIcon={<Iconify icon="eva:upload-fill" />}>
            Upload File
          </Button>
        </Box>
      </Box>

      <CustomizableTable
        // isLoading={isLoading}
        noDataText={<>No Import Attendance Data Found </>}
        tableId="biometric-integration-table"
        columns={[
          { id: 'employeeName', label: 'Name', minWidth: '12vw', align: 'left', sticky: true },
          { id: 'employeeCode', label: 'Employee Code', align: 'left', minWidth: '10vw' },
          {
            id: 'contactNo',
            label: 'Mobile No.',
            align: 'left',
            minWidth: '8vw',
          },
          {
            id: 'timeIn',
            label: 'In-Time',
            align: 'left',
            minWidth: '6vw',
            render(value, row) {
              return value || `__ __`;
            },
          },
          {
            id: 'timeOut',
            label: 'Out-Time',
            align: 'left',
            minWidth: '7vw',
            render(value, row) {
              return value || `__ __`;
            },
          },
          { id: 'hoursWorked', label: 'Hours Worked', minWidth: '9vw', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            sticky: true,
            align: 'left',
            minWidth: '6vw',
            enumOptions: [
              {
                label: 'Present',
                // value: EmployeeAttendanceStatus.Present,
                value: 'Present',
              },
              {
                label: 'Half Day',
                // value: EmployeeAttendanceStatus.HalfDayLeave,
                value: 'Half Day',
              },
              {
                label: 'Leave',
                // value: EmployeeAttendanceStatus.HalfDayLeave,
                value: 'Leave',
              },
            ],
            render(value, row) {
              return (
                <Label
                  color={value === 'Present' ? 'success' : value === 'Leave' ? 'error' : 'warning'}
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            minWidth: '3vw',
            align: 'left',
            sticky: true,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  handleEditClick={() => {
                    setEditData(row);
                    open.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
          // {
          //   id: 'empty',
          //   label: ' ',
          //   isFilter: false,
          //   align: 'left',
          //   render(value, row) {
          //     return ' ';
          //   },
          // },
        ]}
        data={[
          {
            employeeName: 'Kumar Rajesh Prakash',
            hoursWorked: '08H 30M',
            timeIn: '09:00 AM',
            timeOut: '05:30 PM',
            status: 'Present',
            employeeCode: 'EMP001',
            contactNo: '+91 98765 43210',
          },
          {
            employeeName: 'Sharma Priya Rajesh',
            hoursWorked: '07H 30M',
            timeIn: '09:30 AM',
            timeOut: '05:00 PM',
            status: 'Present',
            employeeCode: 'EMP002',
            contactNo: '+91 98765 43211',
          },
          {
            employeeName: 'Patel Amit Naresh',
            hoursWorked: '__ __',
            timeIn: '',
            timeOut: '',
            status: 'Leave',
            employeeCode: 'EMP003',
            contactNo: '+91 98765 43212',
          },
          {
            employeeName: 'Gupta Neha Ramesh',
            hoursWorked: '04H 20M',
            timeIn: '09:00 AM',
            timeOut: '01:00 PM',
            status: 'Half Day',
            employeeCode: 'EMP004',
            contactNo: '+91 98765 43213',
          },
          {
            employeeName: 'Verma Suresh Kumar',
            hoursWorked: '08H 10M',
            timeIn: '09:15 AM',
            timeOut: '05:15 PM',
            status: 'Present',
            employeeCode: 'EMP005',
            contactNo: '+91 98765 43214',
          },
          {
            employeeName: 'Singh Anita Raj',
            hoursWorked: '08H 15M',
            timeIn: '09:00 AM',
            timeOut: '05:15 PM',
            status: 'Present',
            employeeCode: 'EMP006',
            contactNo: '+91 98765 43215',
          },
          {
            employeeName: 'Mishra Deepak Shyam',
            hoursWorked: '__ __',
            timeIn: '',
            timeOut: '',
            status: 'Leave',
            employeeCode: 'EMP007',
            contactNo: '+91 98765 43216',
          },
          {
            employeeName: 'Reddy Meera Krishna',
            hoursWorked: '04H 30M',
            timeIn: '09:00 AM',
            timeOut: '01:30 PM',
            status: 'Half Day',
            employeeCode: 'EMP008',
            contactNo: '+91 98765 43217',
          },
          {
            employeeName: 'Malhotra Vikram Singh',
            hoursWorked: '08H 30M',
            timeIn: '09:00 AM',
            timeOut: '05:30 PM',
            status: 'Present',
            employeeCode: 'EMP009',
            contactNo: '+91 98765 43218',
          },
          {
            employeeName: 'Iyer Pooja Venkat',
            hoursWorked: '08H 00M',
            timeIn: '09:30 AM',
            timeOut: '05:30 PM',
            status: 'Present',
            employeeCode: 'EMP010',
            contactNo: '+91 98765 43219',
          },
        ]}
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Update Attendance</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Edit and update an employee’s in-time and out-time for the selected date."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={open.value}
        handleClose={(e) => handleClose(e, false)}
      >
        <BiometricForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default BiometricIntegrationScreen;

const BiometricForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit: boolean) => void;
  editData: any;
}) => {
  const formik = useFormik({
    initialValues: {
      name: editData ? editData.employeeName : '',

      inTime: editData ? dayjs(editData.timeIn, 'hh:mm A') : null,
      outTime: editData ? dayjs(editData.timeOut, 'hh:mm A') : null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      inTime: Yup.mixed().required('In time is required'),
      outTime: Yup.mixed().required('Out time is required'),
    }),
    onSubmit: (values) => {
      handleClose(null, true);
    },
  });

  // React.useEffect(() => {
  //   if (formik.values.inTime && formik.values.outTime) {
  //     const inTime = dayjs(formik.values.inTime);
  //     const outTime = dayjs(formik.values.outTime);
  //     const diff = outTime.diff(inTime, 'hour', true);
  //     formik.setFieldValue('hoursWorked', diff.toFixed(2));
  //   }
  // }, [formik, formik.values.inTime, formik.values.outTime]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* // <form onSubmit={formik.handleSubmit}> */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={3}>
          <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
            <TextField
              fullWidth
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={(formik.touched.name && formik.errors.name) as string}
              size="small"
              disabled
            />
          </ShakingTextField>
          <ShakingTextField error={formik.touched.inTime && Boolean(formik.errors.inTime)}>
            <TimePicker
              label="In Time *"
              value={formik.values.inTime}
              format="hh:mm"
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              onChange={(date) => formik.setFieldValue('inTime', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  name: 'inTime',
                  helperText:
                    formik.touched.inTime && formik.errors.inTime
                      ? String(formik.errors.inTime)
                      : undefined,
                  error: !!formik.errors.inTime && formik.touched.inTime,
                },
              }}
            />
          </ShakingTextField>

          <ShakingTextField error={formik.touched.outTime && Boolean(formik.errors.outTime)}>
            <TimePicker
              label="Out Time *"
              value={formik.values.outTime}
              format="hh:mm"
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              onChange={(date) => formik.setFieldValue('outTime', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  name: 'outTime',
                  helperText:
                    formik.touched.outTime && formik.errors.outTime
                      ? String(formik.errors.outTime)
                      : undefined,
                  error: !!formik.errors.outTime && formik.touched.outTime,
                },
              }}
            />
          </ShakingTextField>
        </Stack>
        {/* </DialogScrollContent> */}
      </Box>
      <DialogActions>
        <Button
          onClick={() => handleClose(null, false)}
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          size="small"
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
      {/* // </form> */}
    </BackPopUpChecked>
  );
};
