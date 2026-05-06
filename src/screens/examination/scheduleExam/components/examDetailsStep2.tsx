import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Box, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

import type { IExamFormValues } from '../type';

const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik: any = props;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      sx={{ height: '100%' }}
    >
      <CustomizableTable
        isFilter={false}
        isPagination={false}
        isScrollbar={false}
        isShowedDense={false}
        isSearch={false}
        wrapperProps={{
          sx: {
            height: '100%',
          },
        }}
        tableId="examschedule-table"
        columns={[
          {
            id: 'subjectName',
            label: 'Subject',
            minWidth: '200px',
            align: 'left',
            isFilter: false,
            isSort: false,
            sticky: true,
            render(value, row) {
              return (
                <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 5,
                      height: 18,
                      borderRadius: 1,
                      backgroundColor: row.subjectColor,
                    }}
                  />
                  <Typography variant="caption" fontWeight="13px">
                    {value} {row.subjectCode && `(${row.subjectCode})`}
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
            minWidth: 100,
            render(value, row) {
              return (
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.index] === 'object' &&
                    !!(formik.errors.subjects?.[row.index] as any)?.examDate &&
                    !!formik.touched.subjects?.[row.index]?.examDate
                  }
                >
                  <DatePicker
                    value={row.examDate || null}
                    format="DD/MM/YYYY"
                    label="Date *"
                    onChange={(newTime) => {
                      formik.setFieldValue(`subjects.${row.index}.examDate`, newTime);
                      formik.setFieldTouched(`subjects.${row.index}.examDate`, false, false);
                    }}
                    minDate={dayjs()}
                    maxDate={dayjs(currentYear?.endDate)}
                    slotProps={{
                      textField: {
                        size: 'small',

                        error:
                          typeof formik.errors.subjects?.[row.index] === 'object' &&
                          !!(formik.errors.subjects?.[row.index] as any)?.examDate &&
                          !!formik.touched.subjects?.[row.index]?.examDate,
                        helperText:
                          formik.touched.subjects?.[row.index]?.examDate &&
                          typeof formik.errors.subjects?.[row.index] === 'object'
                            ? (formik.errors.subjects?.[row.index] as any)?.examDate
                            : ' ',
                        FormHelperTextProps: {
                          sx: {
                            // minHeight: '20px', // prevents jump by reserving height
                            margin: 0,
                            position: 'static',
                            // lineHeight: '1.25rem',
                            whiteSpace: 'normal',
                            width: '100%',
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
            id: 'startTime',
            label: 'Start Time',
            isFilter: false,
            isSort: false,
            align: 'left',
            render(value, row) {
              return (
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.index] === 'object' &&
                    !!(formik.errors.subjects?.[row.index] as any)?.startTime &&
                    !!formik.touched.subjects?.[row.index]?.startTime
                  }
                >
                  <TimePicker
                    value={row.startTime || null}
                    format="hh:mm a"
                    label="Start Time *"
                    onChange={(newTime) => {
                      formik.setFieldValue(`subjects.${row.index}.startTime`, newTime);
                      formik.setFieldTouched(`subjects.${row.index}.startTime`, false, false);
                    }}
                    viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
                    slotProps={{
                      textField: {
                        size: 'small',

                        error:
                          typeof formik.errors.subjects?.[row.index] === 'object' &&
                          !!(formik.errors.subjects?.[row.index] as any)?.startTime &&
                          !!formik.touched.subjects?.[row.index]?.startTime,
                        helperText:
                          formik.touched.subjects?.[row.index]?.startTime &&
                          typeof formik.errors.subjects?.[row.index] === 'object'
                            ? (formik.errors.subjects?.[row.index] as any)?.startTime
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
                    typeof formik.errors.subjects?.[row.index] === 'object' &&
                    !!(formik.errors.subjects?.[row.index] as any)?.endTime &&
                    !!formik.touched.subjects?.[row.index]?.endTime
                  }
                >
                  <TimePicker
                    value={row.endTime || null}
                    format="hh:mm a"
                    label="End Time *"
                    onChange={(newTime) => {
                      formik.setFieldValue(`subjects.${row.index}.endTime`, newTime);
                      formik.setFieldTouched(`subjects.${row.index}.endTime`, false, false);
                    }}
                    viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        error:
                          typeof formik.errors.subjects?.[row.index] === 'object' &&
                          !!(formik.errors.subjects?.[row.index] as any)?.endTime &&
                          !!formik.touched.subjects?.[row.index]?.endTime,
                        helperText:
                          formik.touched.subjects?.[row.index]?.endTime &&
                          typeof formik.errors.subjects?.[row.index] === 'object'
                            ? (formik.errors.subjects?.[row.index] as any)?.endTime
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
            minWidth: 150,
            render(value, row) {
              return (
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.index] === 'object' &&
                    !!(formik.errors.subjects?.[row.index] as any)?.totalMarks &&
                    !!formik.touched.subjects?.[row.index]?.totalMarks
                  }
                >
                  <TextField
                    value={value}
                    type="number"
                    label="Total Marks *"
                    onChange={(e) => {
                      formik.setFieldValue(`subjects.${row.index}.totalMarks`, e.target.value);
                      formik.setFieldTouched(`subjects.${row.index}.totalMarks`, false, false);
                    }}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    size="small"
                    error={
                      Boolean(formik.touched.subjects?.[row.index]?.totalMarks) &&
                      !!(formik.errors.subjects?.[row.index] as any)?.totalMarks
                    }
                    helperText={
                      formik.touched.subjects?.[row.index]?.totalMarks &&
                      (formik.errors.subjects?.[row.index] as any)?.totalMarks
                        ? (formik.errors.subjects?.[row.index] as any)?.totalMarks
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
            minWidth: 150,
            render(value, row) {
              return (
                <ShakingTextField
                  error={
                    typeof formik.errors.subjects?.[row.index] === 'object' &&
                    !!(formik.errors.subjects?.[row.index] as any)?.passingMarks &&
                    !!formik.touched.subjects?.[row.index]?.passingMarks
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
                      formik.setFieldValue(`subjects.${row.index}.passingMarks`, e.target.value);
                      formik.setFieldTouched(`subjects.${row.index}.passingMarks`, false, false);
                    }}
                    size="small"
                    error={
                      Boolean(formik.touched.subjects?.[row.index]?.passingMarks) &&
                      !!(formik.errors.subjects?.[row.index] as any)?.passingMarks
                    }
                    helperText={
                      formik.touched.subjects?.[row.index]?.passingMarks &&
                      (formik.errors.subjects?.[row.index] as any)?.passingMarks
                        ? (formik.errors.subjects?.[row.index] as any)?.passingMarks
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
            minWidth: 250,
            render(value, row) {
              return (
                <TextField
                  value={value}
                  multiline
                  rows={2}
                  label="Notes"
                  onChange={(e) => {
                    formik.setFieldValue(`subjects.${row.index}.notes`, e.target.value);
                  }}
                  size="small"
                  error={
                    Boolean(formik.touched.subjects?.[row.index]?.notes) &&
                    !!(formik.errors.subjects?.[row.index] as any)?.notes
                  }
                  helperText={
                    formik.touched.subjects?.[row.index]?.notes &&
                    (formik.errors.subjects?.[row.index] as any)?.notes
                      ? (formik.errors.subjects?.[row.index] as any)?.notes
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
        data={formik.values.subjects.map((s: any, i: number) => ({ ...s, index: i }))}
      />
    </Box>
  );
};
export default ExamDetails;
