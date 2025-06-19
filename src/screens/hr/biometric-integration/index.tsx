'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { DatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { EmployeeAttendanceStatusOptions } from 'src/enums/employee-attendance-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const BiometricIntegrationScreen = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const isDownLoadingTemplate = useBoolean();

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
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Import Attendance"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave', href: '/hr/biometric-integration/' },
          { name: 'Import Attendance' },
        ]}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1, pl: 1, mt: 2 }}>
        <DatePicker
          label="Date"
          value={date}
          onChange={(newValue) => {
            setDate(newValue);
          }}
          format="DD-MM-YYYY"
          disableFuture
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />

        <Box display="flex" gap={2} justifyContent="flex-end" mb={2}>
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
        noDataText={<>No Biometric Integration Data Found </>}
        tableId="biometric-integration-table"
        columns={[
          { id: 'employeeName', label: 'Name', minWidth: '12vw', align: 'left', sticky: true },
          { id: 'employeeCode', label: 'Employee Code', align: 'left', minWidth: '10vw' },
          { id: 'contactNo', label: 'Mobile No.', align: 'left', minWidth: '8vw' },
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
          { id: 'hoursWorked', label: 'Hours Worked', minWidth: '10vw', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            sticky: true,
            align: 'left',
            minWidth: '6vw',
            enumOptions: EmployeeAttendanceStatusOptions,
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
        title="Update Attendance"
        open={open.value}
        handleClose={() => {
          open.onFalse();
          setEditData(null);
        }}
      >
        <BiometricForm
          handleClose={() => {
            open.onFalse();
            setEditData(null);
          }}
          editData={editData}
        />
      </CustomDialog>
    </Box>
  );
};

export default BiometricIntegrationScreen;

const BiometricForm = ({ handleClose, editData }: { handleClose: () => void; editData: any }) => {
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
      console.log(values);
      handleClose();
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
    <Box>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 2 }}>
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
            <MobileTimePicker
              label="In Time"
              value={formik.values.inTime}
              onChange={(value) => formik.setFieldValue('inTime', value)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: formik.touched.inTime && Boolean(formik.errors.inTime),
                  helperText: formik.touched.inTime && formik.errors.inTime,
                },
              }}
            />
          </ShakingTextField>

          <ShakingTextField error={formik.touched.outTime && Boolean(formik.errors.outTime)}>
            <MobileTimePicker
              label="Out Time"
              value={formik.values.outTime}
              onChange={(value) => formik.setFieldValue('outTime', value)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: formik.touched.outTime && Boolean(formik.errors.outTime),
                  helperText: formik.touched.outTime && formik.errors.outTime,
                },
              }}
            />
          </ShakingTextField>

          <DialogActions sx={{ p: 0 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              size="small"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              size="small"
            >
              Submit
            </Button>
          </DialogActions>
        </Stack>
      </Box>
    </Box>
  );
};
