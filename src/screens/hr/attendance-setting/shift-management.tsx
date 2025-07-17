import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
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

import { useBoolean, type UseBooleanReturn } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';

import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { SectionCard } from '../employee/employee-form-fields/InformationFields';

const ShiftManagement = ({
  shiftManagementDialog: dialog,
}: {
  shiftManagementDialog: UseBooleanReturn;
}) => {
  const confirm = useBoolean();
  const [editData, setEditData] = useState(null);
  const [deleteInformation, setDeleteInformation] = useState<any>(null);

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
      dialog.onFalse();
      resetState();
    } else if (!isChanges) {
      dialog.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };

  return (
    <>
      <CustomizableTable
        noDataText={
          <>
            No Shift Management Data Found{' '}
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
                    dialog.onTrue();
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
            startTime: '09:00',
            endTime: '17:00',
            weekStartDay: 'Monday',
          },
          {
            id: 2,
            shiftName: 'Evening Shift',
            startTime: '17:00',
            endTime: '01:00',
            weekStartDay: 'Monday',
          },
          {
            id: 3,
            shiftName: 'Night Shift',
            startTime: '22:00',
            endTime: '06:00',
            weekStartDay: 'Sunday',
          },
          {
            id: 4,
            shiftName: 'Weekend Shift',
            startTime: '10:00',
            endTime: '18:00',
            weekStartDay: 'Saturday',
          },
          {
            id: 5,
            shiftName: 'Afternoon Shift',
            startTime: '13:00',
            endTime: '21:00',
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
          dialog.onFalse();
          setTimeout(() => {
            setEditData(null);
          }, 200);
        }}
        open={dialog.value}
      >
        <ShiftManagementForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </>
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
        { day: 'Monday', dayType: 'full', startTime: null, endTime: null },
        { day: 'Tuesday', dayType: 'full', startTime: null, endTime: null },
        { day: 'Wednesday', dayType: 'full', startTime: null, endTime: null },
        { day: 'Thursday', dayType: 'full', startTime: null, endTime: null },
        { day: 'Friday', dayType: 'full', startTime: null, endTime: null },
        { day: 'Saturday', dayType: 'full', startTime: null, endTime: null },
        { day: 'Sunday', dayType: 'full', startTime: null, endTime: null },
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
        <Stack spacing={1}>
          <Box>
            <SectionCard title="Shift Details">
              <Grid item xs={12} sm={6}>
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Shift *"
                        // placeholder="Search Shift *"
                        size="small"
                        fullWidth
                        sx={{ width: '100%', minWidth: '200px' }}
                        error={formik.touched.shiftName && Boolean(formik.errors.shiftName)}
                        helperText={(formik.touched.shiftName && formik.errors.shiftName) as string}
                      />
                    )}
                    onChange={(e, value) => {
                      formik.setFieldValue('shiftName', value?.id);
                    }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
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
                      (formik.touched.weekStartDay && formik.errors.weekStartDay) as string
                    }
                  >
                    <MenuItem value="monday">Monday</MenuItem>
                    <MenuItem value="tuesday">Tuesday</MenuItem>
                    <MenuItem value="wednesday">Wednesday</MenuItem>
                    <MenuItem value="thursday">Thursday</MenuItem>
                    <MenuItem value="friday">Friday</MenuItem>
                    <MenuItem value="saturday">Saturday</MenuItem>
                    <MenuItem value="sunday">Sunday</MenuItem>
                  </TextField>
                </ShakingTextField>
              </Grid>
            </SectionCard>
          </Box>
          {/* <TextField
            size="small"
            select
            name="shiftName"
            label="Shift Name"
            value={formik.values.shiftName}
            onChange={formik.handleChange}
            error={formik.touched.shiftName && Boolean(formik.errors.shiftName)}
            helperText={formik.touched.shiftName && formik.errors.shiftName}
          >
            <MenuItem value="morning">Morning Shift</MenuItem>
            <MenuItem value="afternoon">Afternoon Shift</MenuItem>
            <MenuItem value="evening">Evening Shift</MenuItem>
          </TextField> */}

          <SectionCard title="Working Days & Timing">
            <Grid item xs={12}>
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
          </SectionCard>

          {/* <TextField
            size="small"
            select
            name="weekStartDay"
            label="Week Start Day"
            value={formik.values.weekStartDay}
            onChange={formik.handleChange}
            error={formik.touched.weekStartDay && Boolean(formik.errors.weekStartDay)}
            helperText={formik.touched.weekStartDay && formik.errors.weekStartDay}
          >
            {Object.keys(formik.values.workingDays).map((day) => (
              <MenuItem key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </MenuItem>
            ))}
          </TextField> */}

          <SectionCard title="Day Wise Timing">
            {formik?.values?.daySchedule.map((schedule: any, index: number) => (
              <>
                <Grid item xs={3}>
                  <Typography variant="body2">{schedule.day}</Typography>
                </Grid>
                <Grid item xs={3}>
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
                <Grid item xs={3}>
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
                <Grid item xs={3}>
                  <TimePicker
                    label="End Time"
                    value={schedule.endTime}
                    format="HH:mm"
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                    onChange={(date) => formik.setFieldValue(`daySchedule.${index}.endTime`, date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        name: `daySchedule.${index}.endTime`,
                      },
                    }}
                  />
                </Grid>
              </>
            ))}
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
