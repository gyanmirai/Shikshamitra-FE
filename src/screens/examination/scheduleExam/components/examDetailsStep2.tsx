import type { FormikProps } from 'formik';
import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { Box, Chip, Stack, Button, Divider, Tooltip, TextField, Typography } from '@mui/material';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';

import type { IExamFormValues } from '../type';

// ---------------------------------------------------------------------------
// ApplyToAllBar — bulk-fill helper toolbar for schedule rows
// ---------------------------------------------------------------------------
interface ApplyToAllBarProps {
  formik: any;
}

const ApplyToAllBar = ({ formik }: ApplyToAllBarProps) => {
  const [bulkStartTime, setBulkStartTime] = useState<any>(null);
  const [bulkEndTime, setBulkEndTime] = useState<any>(null);
  const [bulkTotalMarks, setBulkTotalMarks] = useState<string>('');
  const [bulkPassingMarks, setBulkPassingMarks] = useState<string>('');

  if (!formik.values.subjects?.length) return null;

  const hasAnyValue = !!(bulkStartTime || bulkEndTime || bulkTotalMarks || bulkPassingMarks);

  const handleApplyAll = () => {
    // Collect all filled bulk values into a single update object.
    // This prevents the stale-closure bug where multiple sequential
    // setFieldValue('subjects', ...) calls each read the same snapshot
    // and overwrite one another — causing only the last field to apply.
    const updates: Record<string, any> = {};

    if (bulkStartTime !== null) updates.startTime = bulkStartTime;
    if (bulkEndTime !== null) updates.endTime = bulkEndTime;

    // Explicit totalMarks
    if (bulkTotalMarks !== '') updates.totalMarks = bulkTotalMarks;
    if (bulkPassingMarks !== '') updates.passingMarks = bulkPassingMarks;

    if (Object.keys(updates).length === 0) return;

    // Single atomic update — setValues with shouldValidate=true forces immediate
    // re-validation so errors for fields that now have valid values are cleared,
    // preventing stale error messages after bulk apply.
    const updated = formik.values.subjects.map((sub: any) => ({ ...sub, ...updates }));
    formik.setValues({ ...formik.values, subjects: updated }, true);

    // Reset all bulk inputs after applying
    setBulkStartTime(null);
    setBulkEndTime(null);
    setBulkTotalMarks('');
    setBulkPassingMarks('');
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      sx={{
        px: 2,
        py: 1.25,
        mb: 1.5,
        gap: 1,
        borderRadius: 1.5,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
      }}
    >
      {/* Section label */}
      <Box sx={{ pr: 1, flexShrink: 0 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap', letterSpacing: '0.01em' }}
        >
          Apply to all rows
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto' }} />

      {/* Bulk Start Time */}
      <TimePicker
        value={bulkStartTime}
        label="Start Time"
        format="hh:mm a"
        onChange={(t) => setBulkStartTime(t)}
        viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
      />

      {/* Bulk End Time */}
      <TimePicker
        value={bulkEndTime}
        label="End Time"
        format="hh:mm a"
        onChange={(t) => setBulkEndTime(t)}
        viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
      />

      <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto' }} />

      {/* Bulk Total Marks */}
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

      {/* Bulk Passing Marks */}
      <TextField
        value={bulkPassingMarks}
        label="Passing Marks"
        type="number"
        size="small"
        sx={{ width: 115 }}
        inputProps={{ min: 0 }}
        onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
        onChange={(e) => setBulkPassingMarks(e.target.value)}
      />

      {/* Single Apply button */}
      <Box sx={{ ml: 'auto', flexShrink: 0 }}>
        <Tooltip title="Apply filled values to all subjects" arrow>
          <span>
            <Button
              size="small"
              variant="soft"
              color="primary"
              disabled={!hasAnyValue}
              onClick={handleApplyAll}
              sx={{ minWidth: 72, fontWeight: 600, fontSize: '0.72rem' }}
            >
              Apply
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
};

const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik: any = props;
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: gradeScalings, isLoading: isGradeScalingsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      sx={{ height: '100%' }}
    >
      {/* Bulk apply helper bar */}
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
            id: 'gradeScalingId',
            label: 'Grade Scale',
            isFilter: false,
            isSort: false,
            align: 'left',
            minWidth: 180,
            render(value, row) {
              return (
                <Box sx={{ pb: '20px' }}>
                  <CustomSelect
                    label="Grade Scale"
                    options={gradeScalings?.data ?? []}
                    value={value}
                    labelKey="name"
                    valueKey="id"
                    isLoading={isGradeScalingsLoading}
                    formControlProps={{ sx: { width: 165 } }}
                    onChange={(selectedId) => {
                      formik.setFieldValue(
                        `subjects.${row.index}.gradeScalingId`,
                        selectedId || null
                      );
                      const selectedScale = (gradeScalings?.data ?? []).find(
                        (s: any) => s.id === selectedId
                      );
                      formik.setFieldValue(
                        `subjects.${row.index}.totalMarks`,
                        selectedScale?.totalMarks ?? ''
                      );
                    }}
                  />
                </Box>
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
            minWidth: 160,
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
                      exceedsTotal
                        ? 'Exceeds total marks'
                        : formik.touched.subjects?.[row.index]?.passingMarks &&
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
            minWidth: '250px',
            cellSx: { verticalAlign: 'top', minWidth: '200px' },
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
