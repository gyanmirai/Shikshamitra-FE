'use client';

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useMemo, useState, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add, Upload } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Paper,
  Button,
  Divider,
  MenuItem,
  Checkbox,
  MenuList,
  useTheme,
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
  useUpdateEntranceExamMutation,
} from 'src/redux/student/entrance-exam/entrance-exam-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SlotsForm } from '../setting/entrance-exam-slots';

const EntranceExamScreen = () => {
  // const [view, setView] = React.useState('calender');
  const [searchParams, setSearchParam] = useSearchParam({ view: 'calender' });
  const [editData, setEditData] = useState(null);

  const resultDialog = useBoolean();
  const { data: entranceExamData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamQuery,
  });
  const theme = useTheme();

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
        status:
          item.marksObtained === null
            ? 'Pending'
            : item.marksObtained >= item.passingMark
              ? 'Pass'
              : 'Fail',
        percentage:
          item.marksObtained === null
            ? 0
            : +((item.marksObtained / item.totalMarks) * 100 || 0).toFixed(2),
        obtainMarks: item.marksObtained ?? '-',
      })),
    [entranceExamData]
  );

  const calendarData = useMemo(
    () =>
      entranceExamData?.items.map((i: any) => ({
        ...i,
        start: i.examDate,
        color: theme.palette.success.main,
        end: i.examDate,
        allDay: false,
        textColor: theme.palette.success.main,
        title: `${i.studentEnrollment.firstName} ${i.studentEnrollment.lastName}`,
        description: i.reason,
      })) || [],
    [entranceExamData?.items, theme.palette.success.main]
  );

  const actions = useCallback(
    ({ popover }: any, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            setEditData(row);
            resultDialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:result" sx={{ height: '16px', width: '16px' }} />
          Upload Result
        </MenuItem>

        <MenuItem
          onClick={() => {
            // dialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Move To Admission
        </MenuItem>
      </MenuList>
    ),
    [resultDialog]
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
      <Box mt={2}>
        {searchParams.view === 'calender' && (
          <Box display="flex" height="700px">
            <CommonCalender
              data={calendarData}
              // showCalendarToolbar={false}
              // onDateClick={(e) => {
              //   console.log(e);
              //   setCurrentDateClick(e);
              // }}
            />
          </Box>
        )}

        {searchParams.view === 'table' && (
          <CustomizableTable
            tableId="entrance-exam-table"
            isLoading={isLoading}
            columns={[
              { id: 'date', label: 'Date', filterType: 'date' },
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
                id: 'passingMark',
                label: 'Passing Marks',
                filterType: 'number',
              },
              {
                id: 'totalMarks',
                label: 'Total Marks',
                filterType: 'number',
              },
              {
                id: 'obtainMarks',
                label: 'Obtained Marks',
                filterType: 'number',
              },
              {
                id: 'percentage',
                label: 'Percentage',
                filterType: 'number',
                render(value, row) {
                  return `${value}%`;
                },
              },
              {
                id: 'status',
                label: 'Status',
                render(value, row) {
                  let color: LabelColor = 'error';
                  if (value === 'Pending') {
                    color = 'warning';
                  } else if (value === 'Pass') {
                    color = 'success';
                  } else {
                    color = 'error';
                  }
                  return <Label color={color}>{value}</Label>;
                },
              },

              {
                id: 'action',
                label: 'Action',
                isFilter: false,
                render: (value, row) => (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={(props) => actions(props, row)}
                  />
                ),
              },
            ]}
            data={tableData || []}
          />
        )}
      </Box>
      <CustomDialog
        title="Result"
        handleClose={() => {
          setEditData(null);
          resultDialog.onFalse();
        }}
        open={resultDialog.value}
      >
        <ResultForm
          handleClose={() => {
            setEditData(null);
            resultDialog.onFalse();
          }}
          editData={editData}
        />
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
  const dialog = useBoolean();
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
      passingMarks: null,
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
          passingMark: values.passingMarks,
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
                <Grid xs={4}>
                  <TextField
                    name="passingMarks"
                    type="number"
                    value={formik.values.passingMarks}
                    onChange={formik.handleChange}
                    label="Passing Marks"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid>
                <Grid xs={12}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">Slots</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={dialog.onTrue}
                      >
                        Slot
                      </Button>
                    </Box>

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
      <CustomDialog title="Slots" open={dialog.value} handleClose={dialog.onFalse}>
        <SlotsForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>
    </form>
  );
};

const ResultForm = ({ editData, handleClose }: { editData: any; handleClose: () => void }) => {
  const formik = useFormik({
    initialValues: {
      obtainedMarks: editData?.marksObtained ?? null,
      totalMarks: editData?.totalMarks,
    },
    onSubmit: async (values) => {
      console.log(values);
      try {
        await updateMarks({
          id: editData.id,
          body: {
            entranceExamSlotId: editData.entranceExamSlotId,
            studentEnrollmentId: editData.studentEnrollmentId,
            examDate: editData.examDate,
            examType: editData.examType,
            marksObtained: values.obtainedMarks,
            totalMarks: values.totalMarks,
            examScheduleType: editData.examScheduleType,
            passingMark: editData.passingMarks,
          },
        }).unwrap();
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  const [updateMarks, { isLoading }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useUpdateEntranceExamMutation,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar
        sx={{
          p: 3,
          bgcolor: 'background.neutral',
          //   height: 'calc(100vh - 150px)',
        }}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Obtained Marks"
            size="small"
            fullWidth
            name="obtainedMarks"
            value={formik.values.obtainedMarks}
            onChange={formik.handleChange}
          />
          <TextField
            label="Total Marks"
            disabled
            size="small"
            fullWidth
            name="totalMarks"
            value={formik.values.totalMarks}
            onChange={formik.handleChange}
          />
        </Box>
      </Scrollbar>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button onClick={handleClose} style={{ marginTop: '1rem' }}>
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading}
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: '1rem' }}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
