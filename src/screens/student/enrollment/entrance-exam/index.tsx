'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useCallback } from 'react';

import { Upload } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Paper,
  Button,
  MenuItem,
  Checkbox,
  MenuList,
  TextField,
  Typography,
  ButtonGroup,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CalendarView } from 'src/sections/calendar/view';

const EntranceExamScreen = () => {
  // const [view, setView] = React.useState('calender');
  const [searchParams, setSearchParam] = useSearchParam({ view: 'calender' });
  const dialog = useBoolean();
  const resultDialog = useBoolean();
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
            dialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [dialog, resultDialog]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Entrance Exam"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Entrance Exam' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Upload />} variant="contained" size="small">
            Upload Results
          </Button>
        }
      />
      {/* <EntranceExamDashboard /> */}
      {/* <Card> */}
      {/* <CommonCalender data={[]} /> */}
      {/* </Card> */}

      <ButtonGroup>
        <Button
          variant={searchParams.view === 'calender' ? 'contained' : 'outlined'}
          color="inherit"
          onClick={() => setSearchParam({ view: 'calender' })}
        >
          <Iconify icon="uis:calender" />
        </Button>
        <Button
          color="inherit"
          variant={searchParams.view === 'table' ? 'contained' : 'outlined'}
          onClick={() => setSearchParam({ view: 'table' })}
        >
          <Iconify icon="lucide:layout-list" />
        </Button>
      </ButtonGroup>
      {searchParams.view === 'calender' && <CalendarView />}

      {searchParams.view === 'table' && (
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
              id: 'percentage',
              label: 'Percentage',
              render(value, row) {
                return `${typeof row.obtainedMarks === 'string' ? 0 : ((row.obtainedMarks / row.totalMarks) * 100).toFixed(2)}%`;
              },
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
                  <Button variant="soft" size="small" color="primary">
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
      )}
      <CustomDialog title="Result" handleClose={resultDialog.onFalse} open={resultDialog.value}>
        <ResultForm />
      </CustomDialog>
    </Box>
  );
};

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

const ResultForm = () => (
  <Box>
    <Scrollbar
      sx={{
        p: 3,
        bgcolor: 'background.neutral',
        //   height: 'calc(100vh - 150px)',
      }}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField label="Obtained Marks" size="small" fullWidth />
        <TextField label="Total Marks" size="small" fullWidth />
      </Box>
    </Scrollbar>
    <DialogActions sx={{ flexShrink: 0 }}>
      <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem' }}>
        Submit
      </Button>
    </DialogActions>
  </Box>
);
