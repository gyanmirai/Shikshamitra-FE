'use client';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useMemo, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
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

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ScheduleType, scheduleTypeOptions } from 'src/enums/schedule-type';
import { useGetEntranceExamSlotQuery } from 'src/redux/student/entrance-exam-slot/entrance-exam-slot-api';
import {
  useGetEntranceExamQuery,
  useAddEntranceExamMutation,
} from 'src/redux/student/entrance-exam/entrance-exam-api';

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
  const { data: entranceExamData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamQuery,
  });

  const tableData = useMemo(
    () =>
      entranceExamData?.items?.map((item: any) => ({
        ...item,
        date: dayjs(item.examDate).format('DD-MM-YYYY'),
        examTime: `${dayjs(item.entranceExamSlot.startDate).format('hh:mm A')} to ${dayjs(
          item.entranceExamSlot.endDate
        ).format('hh:mm A')}`,
        name: `${item.studentEnrollment.firstName} ${item.studentEnrollment.lastName}`,
        medium: item.studentEnrollment.educationMedium.name,
        class: item.studentEnrollment.standard.name,
        status: item?.obtainedMarks ? 'Pass' : 'Pending',
      })),
    [entranceExamData]
  );

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
      {searchParams.view === 'calender' && (
        <Box display="flex" height="700px">
          <CalendarView />
        </Box>
      )}

      {searchParams.view === 'table' && (
        <CustomizableTable
          tableId="entrance-exam-table"
          columns={[
            { id: 'date', label: 'Date' },
            { id: 'examTime', label: 'Exam Time' },
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
                return `${typeof row.obtainedMarks === 'string' ? 0 : ((row.obtainedMarks / row.totalMarks) * 100 || 0).toFixed(2)}%`;
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
          data={tableData || []}
        />
      )}
      <CustomDialog title="Result" handleClose={resultDialog.onFalse} open={resultDialog.value}>
        <ResultForm />
      </CustomDialog>
    </Box>
  );
};

export default EntranceExamScreen;

export const ExamForm = ({
  studentEnrollmentId,
  handleClose,
}: {
  studentEnrollmentId: string;
  handleClose: () => void;
}) => {
  const validationSchema = Yup.object({
    // examDate: Yup.date().required('Exam date is required'),
    // selectedStudents: Yup.string().required('Students are required'),
  });

  const { data: slots } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamSlotQuery,
  });

  const [scheduleExam, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEntranceExamMutation,
  });

  const allSlots = useMemo(
    () =>
      slots?.items?.map((slot: any) => ({
        ...slot,
        label: `${dayjs(slot.startDate).format('hh:mm A')} to ${dayjs(slot.endDate).format('hh:mm A')}`,
        value: slot.id,
      })),
    [slots]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      examDate: null,
      examType: '',
      scheduleType: ScheduleType.Individual,
      totalMarks: 0,
      isConfirmed: false,
      slots: allSlots || [],
      slot: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await scheduleExam({
          entranceExamSlotId: values.slot,
          studentEnrollmentId,
          examDate: dateConvertor(dayjs(values.examDate).format(dateFormat)),
          examType: values.examType,
          totalMarks: values.totalMarks,
          examScheduleType: values.scheduleType,
        }).unwrap();
        handleClose();
      } catch (error) {
        console.log(error);
      }
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
                  <TextField
                    name="examType"
                    value={formik.values.examType}
                    onChange={formik.handleChange}
                    label="Exam Type"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid xs={4}>
                  <TextField
                    name="totalMarks"
                    type="number"
                    value={formik.values.totalMarks}
                    onChange={formik.handleChange}
                    label="Total Marks"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid xs={4}>
                  <CustomSelect
                    options={scheduleTypeOptions}
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
                      {formik.values.slots.map((slot: any, index: number) => (
                        <Grid xs={6} key={index}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={slot.value === formik.values.slot}
                                size="small"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    formik.setFieldValue('slot', slot.value);
                                  } else {
                                    formik.setFieldValue('slot', '');
                                  }
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
        <LoadingButton
          loading={isAddLoading}
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: '1rem' }}
        >
          Submit
        </LoadingButton>
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
