import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { Box, Chip, Stack, Button, Divider, Tooltip, TextField, Typography } from '@mui/material';

import type { IExamFormValues } from '../type';

// ---------------------------------------------------------------------------
// ApplyToAllBar — NON-BREAKING helper toolbar for bulk-filling schedule rows
// ---------------------------------------------------------------------------
const ApplyToAllBar = ({ formik }: { formik: any }) => {
  const [bulkStartTime, setBulkStartTime] = useState<any>(null);
  const [bulkEndTime, setBulkEndTime] = useState<any>(null);
  const [bulkTotalMarks, setBulkTotalMarks] = useState<string>('');
  const [bulkPassingMarks, setBulkPassingMarks] = useState<string>('');

  if (!formik.values.subjects?.length) return null;

  const applyToAll = (field: string, value: any) => {
    const updated = formik.values.subjects.map((sub: any) => ({ ...sub, [field]: value }));
    formik.setFieldValue('subjects', updated);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      divider={<Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto', mx: 0.5 }} />}
      sx={{
        px: 2,
        py: 1.25,
        mb: 1.5,
        gap: 0.5,
        borderRadius: 1.5,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
      }}
    >
      {/* Section label */}
      <Box sx={{ pr: 1.5, flexShrink: 0 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap', letterSpacing: '0.01em' }}
        >
          Apply to all rows
        </Typography>
      </Box>

      {/* Bulk Start Time */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 1 }}>
        <TimePicker
          value={bulkStartTime}
          label="Start Time"
          format="hh:mm a"
          onChange={(t) => setBulkStartTime(t)}
          viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
          slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
        />
        <Tooltip title="Set this start time for all subjects" arrow>
          <span>
            <Button
              size="small"
              variant="soft"
              color="primary"
              disabled={!bulkStartTime}
              onClick={() => {
                applyToAll('startTime', bulkStartTime);
                setBulkStartTime(null);
              }}
              sx={{ minWidth: 64, fontWeight: 600, fontSize: '0.72rem' }}
            >
              Apply
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* Bulk End Time */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 1 }}>
        <TimePicker
          value={bulkEndTime}
          label="End Time"
          format="hh:mm a"
          onChange={(t) => setBulkEndTime(t)}
          viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
          slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
        />
        <Tooltip title="Set this end time for all subjects" arrow>
          <span>
            <Button
              size="small"
              variant="soft"
              color="primary"
              disabled={!bulkEndTime}
              onClick={() => {
                applyToAll('endTime', bulkEndTime);
                setBulkEndTime(null);
              }}
              sx={{ minWidth: 64, fontWeight: 600, fontSize: '0.72rem' }}
            >
              Apply
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* Bulk Total Marks */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 1 }}>
        <TextField
          value={bulkTotalMarks}
          label="Total Marks"
          type="number"
          size="small"
          sx={{ width: 115 }}
          inputProps={{ min: 0 }}
          onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
          onChange={(e) => setBulkTotalMarks(e.target.value)}
        />
        <Tooltip title="Set total marks for all subjects" arrow>
          <span>
            <Button
              size="small"
              variant="soft"
              color="primary"
              disabled={!bulkTotalMarks}
              onClick={() => {
                applyToAll('totalMarks', bulkTotalMarks);
                setBulkTotalMarks('');
              }}
              sx={{ minWidth: 64, fontWeight: 600, fontSize: '0.72rem' }}
            >
              Apply
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* Bulk Passing Marks */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 1 }}>
        <TextField
          value={bulkPassingMarks}
          label="Passing Marks"
          type="number"
          size="small"
          sx={{ width: 125 }}
          inputProps={{ min: 0 }}
          onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
          onChange={(e) => setBulkPassingMarks(e.target.value)}
        />
        <Tooltip title="Set passing marks for all subjects" arrow>
          <span>
            <Button
              size="small"
              variant="soft"
              color="primary"
              disabled={!bulkPassingMarks}
              onClick={() => {
                applyToAll('passingMarks', bulkPassingMarks);
                setBulkPassingMarks('');
              }}
              sx={{ minWidth: 64, fontWeight: 600, fontSize: '0.72rem' }}
            >
              Apply
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

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
      {/* NON-BREAKING: Apply-to-all bulk helper bar */}
      <ApplyToAllBar formik={formik} />
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
            minWidth: 155,
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
                        sx: { width: 145 },
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
            minWidth: 150,
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
                        sx: { width: 140 },
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
                          sx: { lineHeight: '1.2em', width: '80%' },
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
                        sx: { width: 140 },
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
          // NON-BREAKING: Duration badge column — calculated from start/end time, display only
          {
            id: 'duration',
            label: 'Duration',
            isFilter: false,
            isSort: false,
            align: 'left',
            minWidth: 90,
            render(_value: any, row: any) {
              if (!row.startTime || !row.endTime) {
                return (
                  <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    &mdash;
                  </Typography>
                );
              }
              const diffMins = dayjs(row.endTime).diff(dayjs(row.startTime), 'minute');
              if (diffMins <= 0) {
                return (
                  <Chip
                    label="Invalid"
                    size="small"
                    color="error"
                    variant="soft"
                    sx={{ fontSize: '0.68rem', height: 20 }}
                  />
                );
              }
              const hrs = Math.floor(diffMins / 60);
              const mins = diffMins % 60;
              return (
                <Chip
                  label={hrs > 0 ? `${hrs}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`}
                  size="small"
                  color="info"
                  variant="soft"
                  sx={{ fontSize: '0.68rem', height: 22, fontWeight: 600 }}
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
              // NON-BREAKING: inline UI-only warning when passing > total
              const totalVal = Number(formik.values.subjects?.[row.index]?.totalMarks);
              const passingVal = Number(value);
              const exceedsTotal =
                !Number.isNaN(totalVal) &&
                !Number.isNaN(passingVal) &&
                totalVal > 0 &&
                passingVal > totalVal;

              return (
                <Box>
                  <ShakingTextField
                    error={
                      (typeof formik.errors.subjects?.[row.index] === 'object' &&
                        !!(formik.errors.subjects?.[row.index] as any)?.passingMarks &&
                        !!formik.touched.subjects?.[row.index]?.passingMarks) ||
                      exceedsTotal
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
                        (Boolean(formik.touched.subjects?.[row.index]?.passingMarks) &&
                          !!(formik.errors.subjects?.[row.index] as any)?.passingMarks) ||
                        exceedsTotal
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
                  {/* NON-BREAKING: UI-only inline warning chip */}
                  {exceedsTotal && (
                    <Chip
                      label="Exceeds total"
                      size="small"
                      color="warning"
                      variant="soft"
                      sx={{ fontSize: '0.65rem', height: 18, mt: 0.25 }}
                    />
                  )}
                </Box>
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
                  rows={1}
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
