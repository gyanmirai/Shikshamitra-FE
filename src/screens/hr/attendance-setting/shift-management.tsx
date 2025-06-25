import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Stack,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { SectionCard } from '../employee/employee-form-fields/InformationFields';

const ShiftManagement = ({
  shiftManagementDialog: dialog,
}: {
  shiftManagementDialog: UseBooleanReturn;
}) => {
  const [editData, setEditData] = useState(null);
  return (
    <>
      <CustomizableTable
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
            label: 'Action',
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
                    setEditData(row as any);
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
      <CustomDialog
        maxWidth="md"
        title={editData ? 'Update Shift Rule' : 'Add Shift Rule'}
        handleClose={() => {
          setEditData(null);
          dialog.onFalse();
        }}
        open={dialog.value}
      >
        <ShiftManagementForm
          handleClose={() => {
            setEditData(null);
            dialog.onFalse();
          }}
          editData={editData}
        />
      </CustomDialog>
    </>
  );
};

export default ShiftManagement;

const ShiftManagementForm = ({
  handleClose,
  editData,
}: {
  handleClose: () => void;
  editData: any;
}) => {
  const formik = useFormik({
    initialValues: {
      shiftName: editData?.shiftName || '',
      weekStartDay: editData?.weekStartDay || '',
      workingDays: {
        monday: editData?.workingDays?.monday || false,
        tuesday: editData?.workingDays?.monday || false,
        wednesday: editData?.workingDays?.wednesday || false,
        thursday: editData?.workingDays?.thursday || false,
        friday: editData?.workingDays?.friday || false,
        saturday: editData?.workingDays?.saturday || false,
        sunday: editData?.workingDays?.sunday || false,
      },
      daySchedule: editData?.daySchedule || [
        { day: 'Monday', dayType: '', startTime: '', endTime: '' },
        { day: 'Tuesday', dayType: '', startTime: '', endTime: '' },
        { day: 'Wednesday', dayType: '', startTime: '', endTime: '' },
        { day: 'Thursday', dayType: '', startTime: '', endTime: '' },
        { day: 'Friday', dayType: '', startTime: '', endTime: '' },
        { day: 'Saturday', dayType: '', startTime: '', endTime: '' },
        { day: 'Sunday', dayType: '', startTime: '', endTime: '' },
      ],
    },
    validationSchema: Yup.object({
      shiftName: Yup.string().required('Shift name is required'),
      weekStartDay: Yup.string().required('Week start day is required'),
    }),
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <>
      <DialogScrollContent>
        <Stack spacing={1}>
          <Box>
            <SectionCard title="Shift Details">
              <Grid item xs={12} sm={6}>
                <ShakingTextField
                  error={formik.touched.shiftName && Boolean(formik.errors.shiftName)}
                >
                  <TextField
                    size="small"
                    fullWidth
                    label="Shift Name *"
                    name="shiftName"
                    value={formik.values.shiftName}
                    onChange={formik.handleChange}
                    error={formik.touched.shiftName && Boolean(formik.errors.shiftName)}
                    helperText={(formik.touched.shiftName && formik.errors.shiftName) as string}
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
            {Object.entries(formik.values.workingDays).map(([day, checked]) => (
              <Grid item xs={6} sm={3} md={1.5} key={day}>
                <FormControlLabel
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
              </Grid>
            ))}
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

          <SectionCard title="Day wise timing">
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
                  <TextField
                    size="small"
                    type="time"
                    fullWidth
                    name={`daySchedule.${index}.startTime`}
                    value={schedule.startTime}
                    onChange={formik.handleChange}
                    label="Start Time"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    size="small"
                    type="time"
                    fullWidth
                    name={`daySchedule.${index}.endTime`}
                    value={schedule.endTime}
                    onChange={formik.handleChange}
                    label="End Time"
                    InputLabelProps={{ shrink: true }}
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
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          size="small"
          variant="contained"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
