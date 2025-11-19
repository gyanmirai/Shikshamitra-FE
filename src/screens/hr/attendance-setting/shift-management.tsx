'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';
import {
  Box,
  Grid,
  Stack,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from '../employee/employee-form-fields/InformationFields';

const ShiftManagement = () => {
  const confirm = useBoolean();
  const [editData, setEditData] = useState(null);
  const [deleteInformation, setDeleteInformation] = useState<any>(null);
  const shiftManagementDialog = useBoolean();

  // const [deleteRule] = useQueryAndMutation({
  //   type: 'mutation',
  //   currentQueryAndMutation: useDeleteEmployeeCustomAttendanceRuleMutation,
  // });
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditData(null);
        dispatch(setIsChanges(false));
      }, 200); // optional delay to allow dialog closing animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      shiftManagementDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      shiftManagementDialog.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Shift Management"
        description="
        Configure and manage shift rules to optimize workforce scheduling and ensure efficient attendance tracking."
        links={[
          { name: 'Hr', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave' },
          { name: 'Setting' },
          { name: 'Shift Management' },
        ]}
        action={
          <Button
            sx={{ width: '160px' }}
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={shiftManagementDialog.onTrue}
          >
            Shift Rule
          </Button>
        }
      />

      <CustomizableTable
        noDataText={
          <>
            No Shift Management Data Found{' '}
            <Box
              onClick={() => {
                shiftManagementDialog.onTrue();
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
              Shift
            </Box>
          </>
        }
        tableId="shift-management"
        columns={[
          { id: 'shiftName', label: 'Shift Name' },
          { id: 'startTime', label: 'Start Time' },
          { id: 'endTime', label: 'End Time' },
          { id: 'weekStartDay', label: 'Week Start Day' },
          {
            id: 'action',
            isSort: false,
            isFilter: false,
            sticky: true,
            align: 'left',
            label: 'Actions',
            minWidth: '70px',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {
                    setEditData(row as any);
                    shiftManagementDialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setDeleteInformation(row);
                    confirm.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            shiftName: 'Morning Shift',
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            weekStartDay: 'Monday',
          },
          {
            id: 2,
            shiftName: 'Evening Shift',
            startTime: '05:00 AM',
            endTime: '01:00 PM',
            weekStartDay: 'Monday',
          },
          {
            id: 3,
            shiftName: 'Night Shift',
            startTime: '10:00 AM',
            endTime: '06:00 PM',
            weekStartDay: 'Sunday',
          },
          {
            id: 4,
            shiftName: 'Weekend Shift',
            startTime: '10:00 AM',
            endTime: '06:00 PM',
            weekStartDay: 'Saturday',
          },
          {
            id: 5,
            shiftName: 'Afternoon Shift',
            startTime: '01:00 PM',
            endTime: '09:00 PM',
            weekStartDay: 'Monday',
          },
        ]}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>{deleteInformation?.shiftName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              confirm.onFalse();
            }}
          >
            Yes
          </Button>
        }
      />
      <CustomDialog
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Update Shift Rule' : 'Add Shift Rule'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                editData
                  ? 'Define shift name, week start day, working days, and set day-wise timing here.'
                  : 'Define shift name, week start day, working days, and set day-wise timing here.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          shiftManagementDialog.onFalse();
          setTimeout(() => {
            setEditData(null);
          }, 200);
        }}
        open={shiftManagementDialog.value}
      >
        <ShiftManagementForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default ShiftManagement;

const ShiftManagementForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit: boolean) => void;
  editData: any;
}) => {
  const formik = useFormik({
    initialValues: {
      shiftName: editData?.shiftName || '',
      weekStartDay: editData?.weekStartDay || '',
      workingDays: {
        monday: editData?.workingDays?.monday || true,
        tuesday: editData?.workingDays?.monday || true,
        wednesday: editData?.workingDays?.wednesday || true,
        thursday: editData?.workingDays?.thursday || true,
        friday: editData?.workingDays?.friday || true,
        saturday: editData?.workingDays?.saturday || true,
        sunday: editData?.workingDays?.sunday || false,
      },
      daySchedule: [
        {
          day: 'Monday',
          dayType: 'full',
          startTime: editData?.startTime ? dayjs(editData.startTime) : dayjs('2024-01-01T09:00:00'),
          endTime: editData?.endTime ? dayjs(editData.endTime) : dayjs('2024-01-01T17:00:00'),
        },
        {
          day: 'Tuesday',
          dayType: 'full',
          startTime: editData?.startTime ? dayjs(editData.startTime) : dayjs('2024-01-01T09:00:00'),
          endTime: editData?.endTime ? dayjs(editData.endTime) : dayjs('2024-01-01T17:00:00'),
        },
        {
          day: 'Wednesday',
          dayType: 'full',
          startTime: editData?.startTime ? dayjs(editData.startTime) : dayjs('2024-01-01T09:00:00'),
          endTime: editData?.endTime ? dayjs(editData.endTime) : dayjs('2024-01-01T17:00:00'),
        },
        {
          day: 'Thursday',
          dayType: 'full',
          startTime: editData?.startTime ? dayjs(editData.startTime) : dayjs('2024-01-01T09:00:00'),
          endTime: editData?.endTime ? dayjs(editData.endTime) : dayjs('2024-01-01T17:00:00'),
        },
        {
          day: 'Friday',
          dayType: 'full',
          startTime: editData?.startTime ? dayjs(editData.startTime) : dayjs('2024-01-01T09:00:00'),
          endTime: editData?.endTime ? dayjs(editData.endTime) : dayjs('2024-01-01T17:00:00'),
        },
        {
          day: 'Saturday',
          dayType: 'full',
          startTime: editData?.startTime ? dayjs(editData.startTime) : dayjs('2024-01-01T09:00:00'),
          endTime: editData?.endTime ? dayjs(editData.endTime) : dayjs('2024-01-01T17:00:00'),
        },
        {
          day: 'Sunday',
          dayType: 'full',
          startTime: editData?.startTime ? dayjs(editData.startTime) : dayjs('2024-01-01T09:00:00'),
          endTime: editData?.endTime ? dayjs(editData.endTime) : dayjs('2024-01-01T17:00:00'),
        },
      ],
    },
    validationSchema: Yup.object({
      shiftName: Yup.string().required('Shift name is required'),
      weekStartDay: Yup.string().required('Week start day is required'),
    }),
    onSubmit: (values) => {
      console.log(values);
      handleClose(null, true);
      shikshaMitraToast.success({ message: 'Shift rule updated successfully' });
    },
  });
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetShiftsQuery,
  });

  const shiftValue =
    data?.items?.find((shift: any) => shift.id === formik.values.shiftName) || null;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Stack spacing={2}>
          {/* Shift Details */}
          <SectionCard title="Shift Details">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.shiftName && Boolean(formik.errors.shiftName)}
                >
                  <Autocomplete
                    loading={isLoading}
                    options={data?.items || []}
                    value={shiftValue}
                    getOptionLabel={(option: any) => {
                      const startTime = dayjs(option.startTime, 'HH:mm:ss').format('hh:mm A');
                      const endTime = dayjs(option.endTime, 'HH:mm:ss').format('hh:mm A');
                      return `${option.shiftName} (${startTime}-${endTime})`;
                    }}
                    onChange={(e, value) => formik.setFieldValue('shiftName', value?.id)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Shift *"
                        size="small"
                        fullWidth
                        error={formik.touched.shiftName && Boolean(formik.errors.shiftName)}
                        helperText={
                          formik.touched.shiftName && typeof formik.errors.shiftName === 'string'
                            ? formik.errors.shiftName
                            : undefined
                        }
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.weekStartDay && Boolean(formik.errors.weekStartDay)}
                >
                  <TextField
                    size="small"
                    select
                    fullWidth
                    label="Week Start Day *"
                    name="weekStartDay"
                    value={formik.values.weekStartDay}
                    onChange={formik.handleChange}
                    error={formik.touched.weekStartDay && Boolean(formik.errors.weekStartDay)}
                    helperText={
                      formik.touched.weekStartDay && typeof formik.errors.weekStartDay === 'string'
                        ? formik.errors.weekStartDay
                        : undefined
                    }
                  >
                    {[
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                      'saturday',
                      'sunday',
                    ].map((day) => (
                      <MenuItem key={day} value={day}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </ShakingTextField>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Working Days */}
          <SectionCard title="Working Days & Timing">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                  {Object.entries(formik.values.workingDays).map(([day, checked]) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={formik.handleChange}
                          name={`workingDays.${day}`}
                        />
                      }
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Day Wise Timing */}
          <SectionCard title="Day Wise Timing">
            <Grid container spacing={2}>
              {formik.values.daySchedule.map((schedule: any, index: number) => (
                <React.Fragment key={schedule.day}>
                  <Grid size={{ xs: 3 }}>
                    <Typography variant="body2">{schedule.day}</Typography>
                  </Grid>

                  <Grid size={{ xs: 3 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      name={`daySchedule.${index}.dayType`}
                      value={schedule.dayType}
                      onChange={formik.handleChange}
                      label="Day Type"
                    >
                      <MenuItem value="full">Full Day</MenuItem>
                      <MenuItem value="half">Half Day</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 3 }}>
                    <TimePicker
                      label="Start Time"
                      value={schedule.startTime}
                      format="HH:mm"
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      onChange={(date) =>
                        formik.setFieldValue(`daySchedule.${index}.startTime`, date)
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          name: `daySchedule.${index}.startTime`,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 3 }}>
                    <TimePicker
                      label="End Time"
                      value={schedule.endTime}
                      format="HH:mm"
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      onChange={(date) =>
                        formik.setFieldValue(`daySchedule.${index}.endTime`, date)
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          name: `daySchedule.${index}.endTime`,
                        },
                      }}
                    />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </SectionCard>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          onClick={() => {
            handleClose(null, false);
          }}
        >
          Cancel
        </Button>
        <LoadingButton
          form="dialog-form"
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          size="small"
          variant="contained"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
