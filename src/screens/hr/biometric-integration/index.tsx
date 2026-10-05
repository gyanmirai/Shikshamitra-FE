'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Card, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useUpdateAttendanceMutation,
  usePreviewAttendanceMutation,
  useConfirmAttendanceMutation,
  useDownloadAttendanceTemplateMutation,
} from 'src/redux/hr/attendanceApi';

const BiometricIntegrationScreen = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const isDownLoadingTemplate = useBoolean();
  const isUploadingFile = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [importResults, setImportResults] = useState<any>(null);

  const [previewAttendance, { isLoading: isPreviewing, isFetching: isPreviewingFetching }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: usePreviewAttendanceMutation,
    });

  const [confirmAttendance, { isLoading: isConfirming, isFetching: isConfirmingFetching }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useConfirmAttendanceMutation,
    });

  const [downloadAttendanceTemplate] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDownloadAttendanceTemplateMutation,
  });

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const open = useBoolean();
  const [editData, setEditData] = useState<any>(null);

  const handleDownloadTemplate = async () => {
    try {
      isDownLoadingTemplate.onTrue();
      const blob: any = await downloadAttendanceTemplate({}).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Employee_import_attendance.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download attendance template:', error);
      shikshaMitraToast.error({
        message: 'Failed to download template. Please try again.',
      });
    } finally {
      isDownLoadingTemplate.onFalse();
    }
  };

  const handleUploadClick = () => {
    if (!date) {
      shikshaMitraToast.error({
        message: 'Please select a date first',
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validTypes.includes(file.type)) {
      shikshaMitraToast.error({
        message: 'Please upload a valid Excel file (.xls or .xlsx)',
      });
      return;
    }

    isUploadingFile.onTrue();
    try {
      const formData = new FormData();
      formData.append('File', file);

      // Step 1: Preview
      const previewResponse = await previewAttendance(formData).unwrap();

      if (previewResponse?.previewToken) {
        // Step 2: Confirm
        const confirmResponse = await confirmAttendance({
          previewToken: previewResponse.previewToken,
        }).unwrap();

        setImportResults(previewResponse);

        shikshaMitraToast.success({
          message: `Attendance data has been imported successfully (${confirmResponse?.summary?.totalRows || 0} rows)`,
        });
      }
    } catch (error: any) {
      console.error('Failed to import attendance:', error);
      shikshaMitraToast.error({
        message: `Failed to import attendance: ${error?.data?.error?.message || 'Unknown error'}`,
      });
    } finally {
      isUploadingFile.onFalse();
      // Always reset the file input so the same file can be re-uploaded if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'rowNumber', label: 'Row', minWidth: '4vw', align: 'left' },
      { id: 'employeeName', label: 'Name', minWidth: '12vw', align: 'left', sticky: true },
      { id: 'employeeCode', label: 'Staff Code', align: 'left', minWidth: '10vw' },
      { id: 'attendanceDate', label: 'Date', align: 'left', minWidth: '8vw' },
      { id: 'timeIn', label: 'In-Time', align: 'left', minWidth: '6vw' },
      { id: 'timeOut', label: 'Out-Time', align: 'left', minWidth: '6vw' },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        minWidth: '6vw',
        render(value) {
          return (
            <Label
              color={value === 'Present' ? 'success' : value === 'Absent' ? 'error' : 'warning'}
            >
              {value}
            </Label>
          );
        },
      },
      { id: 'remarks', label: 'Remarks', align: 'left', minWidth: '10vw' },
      {
        id: 'errors',
        label: 'Errors',
        align: 'left',
        minWidth: '3vw',
        render(value) {
          return value?.length > 0 ? (
            <CustomTooltip title={value.join(', ')}>
              <Iconify icon="material-symbols:error-outline" color="error.main" />
            </CustomTooltip>
          ) : (
            '-'
          );
        },
      },
      {
        id: 'warnings',
        label: 'Warnings',
        align: 'left',
        minWidth: '3vw',
        render(value) {
          return value?.length > 0 ? (
            <CustomTooltip title={value.join(', ')}>
              <Iconify icon="material-symbols:warning-outline" color="warning.main" />
            </CustomTooltip>
          ) : (
            '-'
          );
        },
      },
    ],
    []
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Import Attendance"
        description="Configure Attendance Types, Leave Policies, and Late Arrival Rules for accurate tracking and enforcement."
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance Management', href: '/hr/biometric-integration/' },
          { name: 'Import Attendance' },
        ]}
      />

      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: 2,
          pl: 1,
          flexWrap: 'wrap',
          mb: 1,
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
            sx={{ px: '32px' }}
          >
            Download Sample File
          </LoadingButton>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <LoadingButton
            loading={isUploadingFile.value}
            variant="contained"
            size="small"
            startIcon={<Iconify icon="eva:upload-fill" />}
            onClick={handleUploadClick}
            sx={{ px: '32px' }}
          >
            Upload File
          </LoadingButton>
        </Box>
      </Card>

      {importResults && (
        <Card sx={{ p: 2, mb: 1, display: 'flex', gap: 3, bgcolor: 'background.neutral' }}>
          {/* <Box>
            <Typography variant="overline" color="text.secondary">
              Total Rows
            </Typography>
            <Typography variant="h6">{importResults.summary.totalRows}</Typography>
          </Box> */}
          <Box>
            <Typography variant="overline" color="success.main">
              Valid Rows
            </Typography>
            <Typography variant="h6">{importResults.summary.validRows}</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="error.main">
              Invalid Rows
            </Typography>
            <Typography variant="h6">{importResults.summary.invalidRows}</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="info.main">
              New Records
            </Typography>
            <Typography variant="h6">{importResults.summary.createCount}</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="warning.main">
              Replaced Records
            </Typography>
            <Typography variant="h6">{importResults.summary.replaceCount}</Typography>
          </Box>
        </Card>
      )}

      <CustomizableTable
        isLoading={isPreviewing || isConfirming || isPreviewingFetching || isConfirmingFetching}
        noDataText={<>No Import Attendance Data Found </>}
        tableId="biometric-integration-table"
        columns={columns}
        data={importResults?.rows || []}
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Update Attendance</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Edit and update a staff member’s in-time and out-time for the selected date."
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
  const [updateAttendanceEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAttendanceMutation,
  });

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
    onSubmit: async (values) => {
      try {
        const payload = {
          employeeId: editData?.employeeId,
          date: editData?.date,
          inTime: values.inTime?.format('hh:mm A'),
          outTime: values.outTime?.format('hh:mm A'),
        };

        await updateAttendanceEmployee(payload).unwrap();

        shikshaMitraToast.success({
          message: `Attendance for ${editData?.employeeName} has been updated successfully`,
        });

        handleClose(null, true);
      } catch (error: any) {
        console.error('Attendance submit failed:', error);
        shikshaMitraToast.error({
          message: `Failed to update attendance: ${error?.data?.error?.message || 'Unknown error'}`,
        });
      }
    },
  });

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
