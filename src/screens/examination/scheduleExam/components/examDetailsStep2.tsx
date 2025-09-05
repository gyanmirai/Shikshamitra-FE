import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { Box, TextField, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

import type { IExamFormValues, ISubjectRoomDetail } from '../type';

const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik = props;

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
          align: 'left',
          minWidth: 150,
          render(value, row) {
            return (
              <DatePicker
                value={value ? dayjs(value) : null}
                format="DD-MM-YYYY"
                label="Date *"
                onChange={(newTime) => {
                  formik.setFieldValue(`subjects.${row.id}.examDate`, newTime);
                  formik.setFieldTouched(`subjects.${row.id}.examDate`, true, false);
                  const updatedRoomDetails = {
                    ...(formik.values.roomDetails as unknown as Record<string, ISubjectRoomDetail>),
                  };
                  updatedRoomDetails[row.subjectName] = {
                    ...updatedRoomDetails[row.subjectName],
                    examDate: newTime || null,
                  };
                  formik.setFieldValue('roomDetails', updatedRoomDetails);
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
                        : ' ',
                    FormHelperTextProps: {
                      sx: {
                        // minHeight: '20px', // prevents jump by reserving height
                        margin: 0,
                        position: 'static',
                        // lineHeight: '1.25rem',
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
          align: 'left',
          minWidth: 150,
          render(value, row) {
            return (
              <TimePicker
                value={value ? dayjs(value) : null}
                format="hh:mm a"
                label="Start Time *"
                onChange={(newTime) => {
                  formik.setFieldValue(`subjects.${row.id}.startTime`, newTime);
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
                        : ' ',
                    FormHelperTextProps: {
                      sx: {
                        margin: 0,
                        position: 'static',
                        whiteSpace: 'normal',
                      },
                    },
                    InputLabelProps: {
                      sx: { lineHeight: '1.2em' },
                    },
                  },
                }}
              />
            );
          },
        },
        {
          id: 'endTime',
          label: 'End Time',
          isFilter: false,
          isSort: false,
          align: 'left',
          minWidth: 150,
          render(value, row) {
            return (
              <TimePicker
                value={value ? dayjs(value) : null}
                format="hh:mm a"
                label="End Time *"
                onChange={(newTime) => {
                  formik.setFieldValue(`subjects.${row.id}.endTime`, newTime);
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
                        : ' ',
                    FormHelperTextProps: {
                      sx: {
                        margin: 0,
                        position: 'static',
                        whiteSpace: 'normal',
                      },
                    },
                    InputLabelProps: {
                      sx: { lineHeight: '1.2em' },
                    },
                  },
                }}
              />
            );
          },
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          isFilter: false,
          isSort: false,
          align: 'left',
          minWidth: 150,
          render(value, row) {
            return (
              <TextField
                value={value}
                type="number"
                label="Total Marks *"
                onChange={(e) => {
                  formik.setFieldValue(`subjects.${row.id}.totalMarks`, Number(e.target.value));
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
                    : ' '
                }
                FormHelperTextProps={{
                  sx: {
                    margin: 0,
                    position: 'static',
                    whiteSpace: 'normal',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    lineHeight: '1.2em',
                  },
                }}
              />
            );
          },
        },
        {
          id: 'passingMarks',
          label: 'Passing Marks',
          isFilter: false,
          isSort: false,
          align: 'left',
          minWidth: 150,
          render(value, row) {
            return (
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
                  formik.setFieldValue(`subjects.${row.id}.passingMarks`, e.target.value);
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
                    : ' '
                }
                FormHelperTextProps={{
                  sx: {
                    margin: 0,
                    position: 'static',
                    whiteSpace: 'normal',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    lineHeight: '1.2em',
                  },
                }}
              />
            );
          },
        },
        {
          id: 'notes',
          label: 'Notes',
          isFilter: false,
          isSort: false,
          align: 'left',
          minWidth: 150,
          render(value, row) {
            return (
              <TextField
                value={value}
                label="Notes"
                onChange={(e) => {
                  formik.setFieldValue(`subjects.${row.id}.notes`, e.target.value);
                }}
                size="small"
                error={
                  Boolean(formik.touched.subjects?.[row.id]?.notes) &&
                  !!(formik.errors.subjects?.[row.id] as any)?.notes
                }
                helperText={
                  formik.touched.subjects?.[row.id]?.notes &&
                  (formik.errors.subjects?.[row.id] as any)?.notes
                    ? (formik.errors.subjects?.[row.id] as any)?.notes
                    : ' '
                }
                FormHelperTextProps={{
                  sx: {
                    margin: 0,
                    position: 'static',
                    whiteSpace: 'normal',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    lineHeight: '1.2em',
                  },
                }}
              />
            );
          },
        },
      ]}
      data={formik.values.subjects}
    />
  );
};
export default ExamDetails;
