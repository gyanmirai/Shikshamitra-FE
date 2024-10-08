'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Paper,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EntranceExamDashboard from './dashboard';

const EntranceExamScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Entrance Exam"
      links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Entrance Exam' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <EntranceExamDashboard />
  </Box>
);

export default EntranceExamScreen;

export const ExamForm = () => {
  const validationSchema = Yup.object({
    examDate: Yup.date().required('Exam date is required'),
    selectedStudents: Yup.string().required('Students are required'),
  });

  const formik = useFormik({
    initialValues: {
      examDate: null,
      scheduleType: '',
      totalMarks: '',
      isConfirmed: false,
      slots: [
        { label: '8:00 to 9:00 (6)', value: false },
        { label: '9:00 to 10:00 (10)', value: false },
        { label: '10:00 to 11:00 (5)', value: false },
        { label: '11:00 to 12:00 (2)', value: false },
        { label: '14:00 to 15:00 (6)', value: false },
        { label: '15:00 to 16:00 (4)', value: false },
      ],
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar
        sx={{
          p: 3,
          bgcolor: 'background.neutral',
          //   height: 'calc(100vh - 150px)',
        }}
      >
        <Grid container spacing={2}>
          <Grid xs={5}>
            <Paper>
              <DateCalendar
                value={formik.values.examDate}
                onChange={(value) => formik.setFieldValue('examDate', value)}
                disablePast
                slots={{
                  day: (props: any) => {
                    const { day } = props;
                    const absent = day.format('DD-MM-YYYY') === '11-09-2024';
                    return (
                      <PickersDay
                        {...props}
                        sx={absent ? { bgcolor: 'error.main', color: 'white' } : {}}
                      />
                    );
                  },
                }}
              />
            </Paper>
          </Grid>
          <Grid xs={7}>
            <Paper sx={{ p: 1, height: '100%' }}>
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <TextField name="examType" label="Exam Type" size="small" fullWidth />
                </Grid>
                <Grid xs={4}>
                  <TextField name="totalMarks" label="Total Marks" size="small" fullWidth />
                </Grid>
                <Grid xs={4}>
                  <CustomSelect
                    options={[
                      { name: 'Individual', id: 'individual' },
                      { name: 'Group', id: 'group' },
                    ]}
                    label="Schedule Type"
                    labelKey="name"
                    valueKey="id"
                    value={formik.values.scheduleType}
                    onChange={(val) => formik.setFieldValue('scheduleType', val)}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid xs={12}>
                  <Box>
                    <Typography variant="subtitle1">Slots</Typography>
                    <Grid container spacing={2}>
                      {formik.values.slots.map((slot, index) => (
                        <Grid xs={6} key={index}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={slot.value}
                                size="small"
                                onChange={(e) => {
                                  const updatedSlots = [...formik.values.slots];
                                  updatedSlots[index].value = e.target.checked;
                                  formik.setFieldValue('slots', updatedSlots);
                                }}
                              />
                            }
                            label={slot.label}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem' }}>
          Submit
        </Button>
      </DialogActions>
    </form>
  );
};
