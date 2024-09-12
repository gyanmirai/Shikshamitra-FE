'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Upload, CalendarMonth } from '@mui/icons-material';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Paper,
  Button,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const EntranceExamScreen = () => {
  const dialog = useBoolean();
  const resultDialog = useBoolean();
  const confirm = useBoolean(false);

  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      class: '10th',
      medium: 'English',
      date: '2023-06-01',
      totalMarks: 100,
      obtainedMarks: 85,
      status: 'Pass',
    },
    {
      id: 2,
      name: 'Jane Smith',
      class: '11th',
      medium: 'Spanish',
      date: '2023-06-02',
      totalMarks: 100,
      obtainedMarks: 92,
      status: 'Pass',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      class: '9th',
      medium: 'French',
      date: '2023-06-03',
      totalMarks: 100,
      obtainedMarks: '-',
      status: 'Pending',
    },
    {
      id: 4,
      name: 'Alice Williams',
      class: '12th',
      medium: 'German',
      date: '2023-06-04',
      totalMarks: 100,
      obtainedMarks: 95,
      status: 'Pass',
    },
    {
      id: 5,
      name: 'Charlie Brown',
      class: '8th',
      medium: 'Mandarin',
      date: '2023-06-05',
      totalMarks: 100,
      obtainedMarks: 68,
      status: 'Fail',
    },
  ];
  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            resultDialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:result" sx={{ height: '16px', width: '16px' }} />
          Upload Result
        </MenuItem>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            dialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [confirm, dialog, resultDialog]
  );

  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {}}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton variant="contained" loading={false} color="error" onClick={async () => {}}>
            Delete
          </LoadingButton>
        }
      />
      <CustomBreadcrumbs
        heading="Entrance Exam"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Entrance Exam' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <>
            <Button startIcon={<Upload />} variant="contained" onClick={dialog.onTrue}>
              Upload Result
            </Button>
            &nbsp;
            <Button startIcon={<CalendarMonth />} variant="contained" onClick={dialog.onTrue}>
              Schedule Exam
            </Button>
          </>
        }
      />
      <CustomDialog
        maxWidth="md"
        title="Schedule Exam"
        handleClose={dialog.onFalse}
        open={dialog.value}
      >
        <ExamForm />
      </CustomDialog>
      <CustomDialog title="Result" handleClose={resultDialog.onFalse} open={resultDialog.value}>
        <ResultForm />
      </CustomDialog>
      <CustomizableTable
        columns={[
          { id: 'date', label: 'Date' },
          {
            id: 'name',
            label: 'Student',
          },
          {
            id: 'medium',
            label: 'Medium',
          },
          {
            id: 'class',
            label: 'Class',
          },
          {
            id: 'totalMarks',
            label: 'Total Marks',
          },
          {
            id: 'obtainedMarks',
            label: 'Obtained Marks',
          },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  color={value === 'Pass' ? 'success' : value === 'Pending' ? 'warning' : 'error'}
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'admission',
            label: '',
            isSort: false,
            render(value, row) {
              return (
                <Button variant="contained" size="small" color="primary">
                  Admission
                </Button>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render: (value, row) => <ThreeDotsActions placement="right-top" actions={actions} />,
          },
        ]}
        data={dummyData}
      />
    </Box>
  );
};

export default EntranceExamScreen;

const ExamForm = () => {
  const students = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' },
  ];

  const validationSchema = Yup.object({
    examDate: Yup.date().required('Exam date is required'),
    selectedStudents: Yup.string().required('Students are required'),
  });

  const formik = useFormik({
    initialValues: {
      examDate: null,
      scheduleType: '',
      selectedStudents: '',
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
                  <CustomSelect
                    label="Students"
                    options={students}
                    value={formik.values.selectedStudents}
                    onChange={(val) => formik.setFieldValue('selectedStudents', val)}
                    error={
                      formik.touched.selectedStudents && Boolean(formik.errors.selectedStudents)
                    }
                    helperText={
                      (formik.touched.selectedStudents && formik.errors.selectedStudents) as string
                    }
                    formControlProps={{
                      fullWidth: true,
                    }}
                    labelKey="name"
                    valueKey="id"
                  />
                </Grid>
                <Grid xs={4}>
                  <TextField label="Exam Type" size="small" fullWidth />
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

const ResultForm = () => {
  const a = null;
  return (
    <Box>
      <Scrollbar
        sx={{
          p: 3,
          bgcolor: 'background.neutral',
          //   height: 'calc(100vh - 150px)',
        }}
      >
        <TextField label="Obtained Marks" size="small" fullWidth />
      </Scrollbar>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem' }}>
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
};
