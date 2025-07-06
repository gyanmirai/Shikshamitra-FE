import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { useState } from 'react';

import { Box, TextField, Typography } from '@mui/material';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

import CustomizableTable from 'src/components/customizabaleTable';

import type { IExamFormValues } from '../type';

const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik = props;
  // State to store and manage exam schedules data for each subject, initialized with subjects from formik values
  const [examSchedules, setExamSchedules] = useState(formik.values.subjects);
  return (
    <CustomizableTable
      isFilter={false}
      isPagination={false}
      isScrollbar={false}
      isShowedDense={false}
      isSearch={false}
      tableId="examschedule-table"
      columns={[
        {
          id: 'subjectName',
          label: 'Subject',
          minWidth: '130px',
          align: 'left',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              <Box key={value.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 18,
                    borderRadius: 1,
                    backgroundColor: row.subjectColor,
                  }}
                />
                <Typography variant="caption" fontWeight="13px">
                  {value} ({row.subjectCode})
                </Typography>
              </Box>
            );
          },
        },
        {
          id: 'examDate',
          label: 'Date',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              // <Box
              //   sx={{
              //     display: 'flex',
              //     flexDirection: 'column',
              //     minWidth: '150px',
              //     width: '100%',
              //     mb: 1,
              //   }}
              // >
              <DatePicker
                value={value ? dayjs(value) : null}
                format="DD-MM-YYYY"
                label="Date *"
                onChange={(newTime) => {
                  // const updated = [...examSchedules];
                  // updated[row.id].examDate = newTime;
                  formik.setFieldValue(`subjects.${row.id}.examDate`, newTime);
                  // formik.setFieldTouched(`subjects.${row.id}.startTime`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.endTime`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.totalMarks`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.passingMarks`, false);
                }}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    size: 'small',
                    error:
                      typeof formik.errors.subjects?.[row.id] === 'object' &&
                      !!(formik.errors.subjects?.[row.id] as any)?.examDate &&
                      !!formik.touched.subjects?.[row.id]?.examDate,
                    helperText:
                      formik.touched.subjects?.[row.id]?.examDate &&
                      typeof formik.errors.subjects?.[row.id] === 'object'
                        ? (formik.errors.subjects?.[row.id] as any)?.examDate
                        : '',
                    FormHelperTextProps: {
                      sx: {
                        margin: 0,
                        // marginTop: '4px',
                        position: 'static',
                        lineHeight: '1.25rem',
                        whiteSpace: 'normal',
                      },
                    },
                    InputLabelProps: {
                      sx: { lineHeight: '1.2em' },
                    },
                  },
                }}
              />
              // </Box>
            );
          },
        },
        {
          id: 'startTime',
          label: 'Start Time',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              // <Box
              //   sx={{
              //     display: 'flex',
              //     flexDirection: 'column',
              //     minWidth: '150px',
              //     width: '100%',
              //     mb: 1,
              //   }}
              // >
              <TimePicker
                value={value ? dayjs(value) : null}
                format="hh:mm a"
                label="Start Time *"
                onChange={(newTime) => {
                  // const updated = [...examSchedules];
                  // updated[row.id].startTime = newTime;
                  // formik.setFieldValue('subjects', updated);
                  formik.setFieldValue(`subjects.${row.id}.startTime`, newTime);
                  // formik.setFieldTouched(`subjects.${row.id}.examDate`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.endTime`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.totalMarks`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.passingMarks`, false);
                }}
                viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
                slotProps={{
                  textField: {
                    size: 'small',
                    error:
                      typeof formik.errors.subjects?.[row.id] === 'object' &&
                      !!(formik.errors.subjects?.[row.id] as any)?.startTime &&
                      !!formik.touched.subjects?.[row.id]?.startTime,
                    helperText:
                      formik.touched.subjects?.[row.id]?.startTime &&
                      typeof formik.errors.subjects?.[row.id] === 'object'
                        ? (formik.errors.subjects?.[row.id] as any)?.startTime
                        : '',
                    FormHelperTextProps: {
                      sx: {
                        margin: 0,
                        position: 'static', // ✅ override default absolute
                        // marginTop: '4px',
                        whiteSpace: 'normal',
                      },
                    },
                    InputLabelProps: {
                      sx: { lineHeight: '1.2em' },
                    },
                  },
                }}
              />
              // </Box>
            );
          },
        },
        {
          id: 'endTime',
          label: 'End Time',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              // <Box
              //   sx={{
              //     display: 'flex',
              //     flexDirection: 'column',
              //     minWidth: '150px',
              //     width: '100%',
              //     mb: 1,
              //   }}
              // >
              <TimePicker
                value={value ? dayjs(value) : null}
                format="hh:mm a"
                label="End Time *"
                onChange={(newTime) => {
                  // const updated = [...examSchedules];
                  // updated[row.id].endTime = newTime;
                  formik.setFieldValue(`subjects.${row.id}.endTime`, newTime);
                  // formik.setFieldTouched(`subjects.${row.id}.examDate`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.startTime`, false);
                  // // formik.setFieldTouched(`subjects.${row.id}.endTime`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.totalMarks`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.passingMarks`, false);
                }}
                viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
                slotProps={{
                  textField: {
                    size: 'small',
                    error:
                      typeof formik.errors.subjects?.[row.id] === 'object' &&
                      !!(formik.errors.subjects?.[row.id] as any)?.endTime &&
                      !!formik.touched.subjects?.[row.id]?.endTime,
                    helperText:
                      formik.touched.subjects?.[row.id]?.endTime &&
                      typeof formik.errors.subjects?.[row.id] === 'object'
                        ? (formik.errors.subjects?.[row.id] as any)?.endTime
                        : '',
                    FormHelperTextProps: {
                      sx: {
                        margin: 0,
                        position: 'static', // ✅ override default absolute
                        // marginTop: '4px',
                        whiteSpace: 'normal',
                      },
                    },
                    InputLabelProps: {
                      sx: { lineHeight: '1.2em' },
                    },
                  },
                }}
              />
              // </Box>
            );
          },
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              // <Box
              //   sx={{
              //     display: 'flex',
              //     flexDirection: 'column',
              //     minWidth: '150px',
              //     width: '100%',
              //     mb: 1,
              //   }}
              // >
              <TextField
                value={value}
                type="number"
                label="Total Marks *"
                onChange={(e) => {
                  // const updated = [...examSchedules];
                  // updated[row.id].totalMarks = Number(e.target.value);
                  // updated[row.id].totalMarks = e.target.value;
                  formik.setFieldValue(`subjects.${row.id}.totalMarks`, Number(e.target.value));
                  // formik.setFieldTouched(`subjects.${row.id}.examDate`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.startTime`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.endTime`, false);
                  // // formik.setFieldTouched(`subjects.${row.id}.totalMarks`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.passingMarks`, false);
                }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                size="small"
                error={
                  Boolean(formik.touched.subjects?.[row.id]?.totalMarks) &&
                  !!(formik.errors.subjects?.[row.id] as any)?.totalMarks
                }
                helperText={
                  formik.touched.subjects?.[row.id]?.totalMarks &&
                  (formik.errors.subjects?.[row.id] as any)?.totalMarks
                    ? (formik.errors.subjects?.[row.id] as any)?.totalMarks
                    : ''
                }
                FormHelperTextProps={{
                  sx: {
                    margin: 0,
                    position: 'static', // ✅ override default absolute
                    // marginTop: '4px',
                    whiteSpace: 'normal',
                  },
                }}
                InputLabelProps={{
                  sx: { lineHeight: '1.2em' },
                }}
              />
              // </Box>
            );
          },
        },
        {
          id: 'passingMarks',
          label: 'Passing Marks',
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              // <Box
              //   sx={{
              //     display: 'flex',
              //     flexDirection: 'column',
              //     minWidth: '150px',
              //     width: '100%',
              //     mb: 1,
              //   }}
              // >
              <TextField
                value={value}
                type="number"
                label="Passing Marks *"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  // const updated = [...examSchedules];
                  // updated[row.id].passingMarks = Number(e.target.value);
                  // updated[row.id].passingMarks = e.target.value;
                  // formik.setFieldValue('subjects', updated);
                  formik.setFieldValue(`subjects.${row.id}.passingMarks`, e.target.value);
                  formik.setFieldTouched(`subjects.${row.id}.examDate`, false);
                  formik.setFieldTouched(`subjects.${row.id}.startTime`, false);
                  formik.setFieldTouched(`subjects.${row.id}.endTime`, false);
                  formik.setFieldTouched(`subjects.${row.id}.totalMarks`, false);
                  // formik.setFieldTouched(`subjects.${row.id}.passingMarks`, false);
                }}
                size="small"
                error={
                  Boolean(formik.touched.subjects?.[row.id]?.passingMarks) &&
                  !!(formik.errors.subjects?.[row.id] as any)?.passingMarks
                }
                helperText={
                  formik.touched.subjects?.[row.id]?.passingMarks &&
                  (formik.errors.subjects?.[row.id] as any)?.passingMarks
                    ? (formik.errors.subjects?.[row.id] as any)?.passingMarks
                    : ''
                }
                FormHelperTextProps={{
                  sx: {
                    margin: 0,
                    position: 'static', // ✅ override default absolute
                    // marginTop: '4px',
                    whiteSpace: 'normal',
                  },
                }}
                InputLabelProps={{
                  sx: { lineHeight: '1.2em' },
                }}
              />
              // </Box>
            );
          },
        },
      ]}
      data={formik.values.subjects}
    />
  );
};
export default ExamDetails;
