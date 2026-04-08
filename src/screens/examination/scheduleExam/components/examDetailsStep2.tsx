import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Box, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

import type { IExamFormValues, ISubjectRoomDetail } from '../type';

const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik = props;
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
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
            minWidth: '200px',
            align: 'left',
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <Box key={value.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 5,
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
            render(value, row) {
              return (
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.id] === 'object' &&
                    !!(formik.errors.subjects?.[row.id] as any)?.examDate &&
                    !!formik.touched.subjects?.[row.id]?.examDate
                  }
                >
                  <DatePicker
                    value={row.examDate || null}
                    format="DD/MM/YYYY"
                    label="Date *"
                    onChange={(newTime) => {
                      formik.setFieldValue(`subjects.${row.id}.examDate`, newTime);
                      formik.setFieldTouched(`subjects.${row.id}.examDate`, false, false);

                      const updatedRoomDetails = {
                        ...(formik.values.roomDetails as unknown as Record<
                          string,
                          ISubjectRoomDetail
                        >),
                      };
                      updatedRoomDetails[row.subjectName] = {
                        ...updatedRoomDetails[row.subjectName],
                        examDate: newTime || null,
                      };
                      formik.setFieldValue('roomDetails', updatedRoomDetails);
                    }}
                    minDate={dayjs()}
                    maxDate={dayjs(currentYear?.endDate)}
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
                </ShakingTextField>
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
            render(value, row) {
              return (
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.id] === 'object' &&
                    !!(formik.errors.subjects?.[row.id] as any)?.startTime &&
                    !!formik.touched.subjects?.[row.id]?.startTime
                  }
                >
                  <TimePicker
                    value={row.startTime || null}
                    format="hh:mm a"
                    label="Start Time *"
                    onChange={(newTime) => {
                      formik.setFieldValue(`subjects.${row.id}.startTime`, newTime);
                      formik.setFieldTouched(`subjects.${row.id}.startTime`, false, false);

                      // formik.validateField(`subjects.${row.id}.startTime`);
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
                </ShakingTextField>
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
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.id] === 'object' &&
                    !!(formik.errors.subjects?.[row.id] as any)?.endTime &&
                    !!formik.touched.subjects?.[row.id]?.endTime
                  }
                >
                  <TimePicker
                    value={row.endTime || null}
                    format="hh:mm a"
                    label="End Time *"
                    onChange={(newTime) => {
                      formik.setFieldValue(`subjects.${row.id}.endTime`, newTime);
                      formik.setFieldTouched(`subjects.${row.id}.endTime`, false, false);
                      // formik.validateField(`subjects.${row.id}.endTime`);
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
                </ShakingTextField>
              );
            },
          },
          {
            id: 'totalMarks',
            label: 'Total Marks',
            isFilter: false,
            isSort: false,
            align: 'left',
            render(value, row) {
              return (
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.id] === 'object' &&
                    !!(formik.errors.subjects?.[row.id] as any)?.totalMarks &&
                    !!formik.touched.subjects?.[row.id]?.totalMarks
                  }
                >
                  <TextField
                    value={value}
                    type="number"
                    label="Total Marks *"
                    onChange={(e) => {
                      formik.setFieldValue(`subjects.${row.id}.totalMarks`, e.target.value);
                      formik.setFieldTouched(`subjects.${row.id}.totalMarks`, false, false);
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
                        width: '100%',
                      },
                    }}
                  />
                </ShakingTextField>
              );
            },
          },
          {
            id: 'passingMarks',
            label: 'Passing Marks',
            isFilter: false,
            isSort: false,
            align: 'left',
            minWidth: 100,
            render(value, row) {
              return (
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.id] === 'object' &&
                    !!(formik.errors.subjects?.[row.id] as any)?.passingMarks &&
                    !!formik.touched.subjects?.[row.id]?.passingMarks
                  }
                >
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
                      formik.setFieldTouched(`subjects.${row.id}.passingMarks`, false, false);
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
                </ShakingTextField>
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
    </motion.div>
  );
};
export default ExamDetails;
