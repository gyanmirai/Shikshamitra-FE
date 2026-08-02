import type { FormikProps } from 'formik';
import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { memo, useMemo, useState, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Table,
  Button,
  Switch,
  Divider,
  Tooltip,
  TableRow,
  Accordion,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  Autocomplete,
  TableContainer,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import type { IExamFormValues } from '../type';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function DurationCell({ startTime, endTime }: { startTime: any; endTime: any }) {
  if (!startTime || !endTime) {
    return (
      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
        &mdash;
      </Typography>
    );
  }
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const dummyDate = dayjs('2000-01-01');
  const dStart = dummyDate.hour(start.hour()).minute(start.minute()).second(0).millisecond(0);
  const dEnd = dummyDate.hour(end.hour()).minute(end.minute()).second(0).millisecond(0);
  const diffMins = dEnd.diff(dStart, 'minute');
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
  const label = hrs > 0 ? `${hrs}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;
  return (
    <Chip
      label={label}
      size="small"
      color="info"
      variant="soft"
      sx={{ fontSize: '0.68rem', height: 22, fontWeight: 600 }}
    />
  );
}

const HELPER_TEXT_PROPS = {
  sx: { margin: 0, position: 'static' as const, whiteSpace: 'normal' as const },
};
const LABEL_PROPS = { sx: { lineHeight: '1.2em' } };
const SELECTABLE_SETTING_STATUSES = new Set([0, 2, 'Active', 'SystemDefault']);

const isSelectableSetting = (item: any) =>
  item?.status == null || SELECTABLE_SETTING_STATUSES.has(item.status);

// ---------------------------------------------------------------------------
// ScheduleTableHead
// ---------------------------------------------------------------------------
const COLUMNS = [
  { label: 'Subject', minWidth: 200, sticky: true },
  { label: 'Date', minWidth: 155 },
  { label: 'Start Time', minWidth: 155 },
  { label: 'End Time', minWidth: 155 },
  { label: 'Duration', minWidth: 90 },
  { label: 'Grade Scale', minWidth: 180 },
  { label: 'Total Marks', minWidth: 155 },
  { label: 'Passing Marks', minWidth: 165 },
  { label: 'Notes', minWidth: 200 },
];

const ScheduleTableHead = memo(() => (
  <TableHead>
    <TableRow>
      {COLUMNS.map((col) => (
        <TableCell
          key={col.label}
          sx={{
            minWidth: col.minWidth,
            fontWeight: 700,
            fontSize: '0.68rem',
            letterSpacing: '0.06em',
            color: 'text.secondary',
            textTransform: 'uppercase',
            py: 1,
            px: 1.5,
            bgcolor: (theme: any) => varAlpha(theme.vars.palette.grey['500Channel'], 0.06),
            borderBottom: '2px solid',
            borderColor: 'divider',
            ...(col.sticky
              ? {
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  // Opaque background required so scrolling columns don't bleed through.
                  // background.paper adapts correctly to both light and dark mode.
                  bgcolor: 'background.paper',
                }
              : {}),
          }}
        >
          {col.label}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
));
ScheduleTableHead.displayName = 'ScheduleTableHead';

// ---------------------------------------------------------------------------
// SubjectScheduleRow
// ---------------------------------------------------------------------------
interface SubjectRowValues {
  subjectColor?: string;
  subjectName?: string;
  subjectCode?: string;
  examDate?: any;
  startTime?: any;
  endTime?: any;
  gradeScalingId?: string | null;
  totalMarks?: any;
  passingMarks?: any;
  notes?: string;
  assignedStudentCount?: number;
  isExamSelectionDisabled?: boolean;
}

interface SubjectScheduleRowProps {
  values: SubjectRowValues;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  onFieldChange: (field: string, value: any) => Promise<any> | void;
  onFieldBlur: (field: string) => void;
  gradeScalings: any[];
  isGradeScalingsLoading: boolean;
  currentYear: any;
  standardId?: string | null;
  isReadOnly?: boolean;
  marksEntryRequired?: boolean;
  gradeScaleRequired?: boolean;
}

const SubjectScheduleRow = memo(
  ({
    values,
    errors = {},
    touched = {},
    onFieldChange,
    onFieldBlur,
    gradeScalings,
    isGradeScalingsLoading,
    currentYear,
    standardId,
    isReadOnly = false,
    marksEntryRequired = true,
    gradeScaleRequired = true,
  }: SubjectScheduleRowProps) => (
    <TableRow
      sx={{
        '&:hover': {
          bgcolor: (theme: any) => varAlpha(theme.vars.palette.grey['500Channel'], 0.03),
        },
        '&:last-child td': { borderBottom: 0 },
        opacity: isReadOnly ? 0.55 : 1,
        ...(isReadOnly ? { pointerEvents: 'none', userSelect: 'none' } : {}),
      }}
    >
      {/* Subject */}
      <TableCell
        sx={{
          position: 'sticky',
          left: 0,
          zIndex: 2,
          bgcolor: 'background.paper',
          minWidth: 200,
          py: 1.25,
          px: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 5,
              height: 24,
              borderRadius: '3px',
              flexShrink: 0,
              bgcolor: values.subjectColor || '#9E9E9E',
            }}
          />
          <Box>
            <Typography variant="caption" fontWeight={600} display="block" lineHeight={1.4}>
              {values.subjectName}
            </Typography>
            {values.subjectCode && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {values.subjectCode}
              </Typography>
            )}
            {typeof values.assignedStudentCount === 'number' && (
              <Chip
                label={
                  values.assignedStudentCount === 0
                    ? 'No students'
                    : `${values.assignedStudentCount} student${
                        values.assignedStudentCount === 1 ? '' : 's'
                      }`
                }
                size="small"
                color={values.assignedStudentCount === 0 ? 'default' : 'warning'}
                variant="soft"
                sx={{ mt: 0.5, height: 18, fontSize: '0.62rem', fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
      </TableCell>

      {/* Date */}
      <TableCell sx={{ minWidth: 155, py: 1, px: 1.5, verticalAlign: 'top' }}>
        <ShakingTextField error={!!(touched.examDate && errors.examDate)}>
          <DatePicker
            value={values.examDate || null}
            format="DD/MM/YYYY"
            label="Date *"
            onChange={async (v) => {
              await onFieldChange('examDate', v);
              onFieldBlur('examDate');
            }}
            minDate={dayjs()}
            maxDate={dayjs(currentYear?.endDate)}
            academicYearId={currentYear?.id}
            standardId={standardId}
            validationType="ExamSchedule"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 145 },
                error: !!(touched.examDate && errors.examDate),
                helperText: touched.examDate && errors.examDate ? errors.examDate : ' ',
                FormHelperTextProps: HELPER_TEXT_PROPS,
                InputLabelProps: LABEL_PROPS,
                onBlur: () => onFieldBlur('examDate'),
              },
            }}
          />
        </ShakingTextField>
      </TableCell>

      {/* Start Time */}
      <TableCell sx={{ minWidth: 155, py: 1, px: 1.5, verticalAlign: 'top' }}>
        <ShakingTextField error={!!(touched.startTime && errors.startTime)}>
          <TimePicker
            value={values.startTime || null}
            format="hh:mm a"
            label="Start Time *"
            onChange={async (v) => {
              await onFieldChange('startTime', v);
              onFieldBlur('startTime');
            }}
            viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 140 },
                error: !!(touched.startTime && errors.startTime),
                helperText: touched.startTime && errors.startTime ? errors.startTime : ' ',
                FormHelperTextProps: HELPER_TEXT_PROPS,
                InputLabelProps: { sx: { lineHeight: '1.2em', width: '80%' } },
              },
            }}
          />
        </ShakingTextField>
      </TableCell>

      {/* End Time */}
      <TableCell sx={{ minWidth: 155, py: 1, px: 1.5, verticalAlign: 'top' }}>
        <ShakingTextField error={!!(touched.endTime && errors.endTime)}>
          <TimePicker
            value={values.endTime || null}
            format="hh:mm a"
            label="End Time *"
            onChange={async (v) => {
              await onFieldChange('endTime', v);
              onFieldBlur('endTime');
            }}
            viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 140 },
                error: !!(touched.endTime && errors.endTime),
                helperText: touched.endTime && errors.endTime ? errors.endTime : ' ',
                FormHelperTextProps: HELPER_TEXT_PROPS,
                InputLabelProps: LABEL_PROPS,
              },
            }}
          />
        </ShakingTextField>
      </TableCell>

      {/* Duration */}
      <TableCell sx={{ minWidth: 90, py: 1, px: 1.5 }}>
        <DurationCell startTime={values.startTime} endTime={values.endTime} />
      </TableCell>

      {/* Grade Scale */}
      <TableCell sx={{ minWidth: 200, py: 1, px: 1.5, verticalAlign: 'top' }}>
        <ShakingTextField error={!!(touched.gradeScalingId && errors.gradeScalingId)}>
          <CustomTooltip
            title={
              gradeScalings?.find((g: any) => String(g.id) === String(values.gradeScalingId))
                ?.name || 'Select grade scale for this subject'
            }
            placement="top"
          >
            <Autocomplete
              size="small"
              options={gradeScalings || []}
              loading={isGradeScalingsLoading}
              disabled={!gradeScaleRequired}
              value={
                gradeScalings?.find((g: any) => String(g.id) === String(values.gradeScalingId)) ||
                null
              }
              getOptionLabel={(option: any) => option?.name || ''}
              isOptionEqualToValue={(option: any, value: any) =>
                String(option?.id) === String(value?.id)
              }
              onChange={async (_event, selectedOption: any) => {
                const selectedId = selectedOption?.id || null;
                await onFieldChange('gradeScalingId', selectedId);
                onFieldBlur('gradeScalingId');
                if (selectedOption?.totalMarks !== undefined) {
                  await onFieldChange('totalMarks', selectedOption.totalMarks ?? '');
                  onFieldBlur('totalMarks');
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Scale${gradeScaleRequired ? ' *' : ''}`}
                  size="small"
                  sx={{ width: 175 }}
                  error={!!(touched.gradeScalingId && errors.gradeScalingId)}
                  helperText={
                    touched.gradeScalingId && errors.gradeScalingId
                      ? errors.gradeScalingId
                      : gradeScaleRequired
                        ? ' '
                        : 'Not required'
                  }
                  FormHelperTextProps={HELPER_TEXT_PROPS}
                  InputLabelProps={LABEL_PROPS}
                />
              )}
            />
          </CustomTooltip>
        </ShakingTextField>
      </TableCell>

      {/* Total Marks */}
      <TableCell sx={{ minWidth: 155, py: 1, px: 1.5, verticalAlign: 'top' }}>
        <ShakingTextField error={!!(touched.totalMarks && errors.totalMarks)}>
          <TextField
            value={values.totalMarks ?? ''}
            type="number"
            label={`Total Marks${marksEntryRequired ? ' *' : ''}`}
            size="small"
            disabled={!marksEntryRequired}
            onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
            onChange={(e) => {
              onFieldChange('totalMarks', e.target.value);
              onFieldBlur('totalMarks');
            }}
            error={!!(touched.totalMarks && errors.totalMarks)}
            helperText={
              touched.totalMarks && errors.totalMarks
                ? errors.totalMarks
                : marksEntryRequired
                  ? ' '
                  : 'Not required'
            }
            FormHelperTextProps={HELPER_TEXT_PROPS}
            InputLabelProps={LABEL_PROPS}
          />
        </ShakingTextField>
      </TableCell>

      {/* Passing Marks */}
      <TableCell sx={{ minWidth: 165, py: 1, px: 1.5, verticalAlign: 'top' }}>
        {(() => {
          const totalVal = Number(values.totalMarks);
          const passingVal = Number(values.passingMarks);
          const exceedsTotal =
            !Number.isNaN(totalVal) &&
            !Number.isNaN(passingVal) &&
            totalVal > 0 &&
            passingVal > totalVal;
          const hasError = !!(touched.passingMarks && errors.passingMarks) || exceedsTotal;
          return (
            <ShakingTextField error={hasError}>
              <TextField
                value={values.passingMarks ?? ''}
                type="number"
                label={`Passing Marks${marksEntryRequired ? ' *' : ''}`}
                size="small"
                disabled={!marksEntryRequired}
                onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                onChange={(e) => {
                  onFieldChange('passingMarks', e.target.value);
                  onFieldBlur('passingMarks');
                }}
                error={hasError}
                helperText={
                  exceedsTotal
                    ? 'Exceeds total marks'
                    : touched.passingMarks && errors.passingMarks
                      ? errors.passingMarks
                      : marksEntryRequired
                        ? ' '
                        : 'Not required'
                }
                FormHelperTextProps={HELPER_TEXT_PROPS}
                InputLabelProps={LABEL_PROPS}
              />
            </ShakingTextField>
          );
        })()}
      </TableCell>

      {/* Notes */}
      <TableCell sx={{ minWidth: 200, py: 1, px: 1.5, verticalAlign: 'top' }}>
        <TextField
          value={values.notes ?? ''}
          multiline
          rows={1}
          label="Notes"
          size="small"
          onChange={(e) => onFieldChange('notes', e.target.value)}
          helperText=" "
          FormHelperTextProps={HELPER_TEXT_PROPS}
          InputLabelProps={LABEL_PROPS}
        />
      </TableCell>
    </TableRow>
  )
);
SubjectScheduleRow.displayName = 'SubjectScheduleRow';

// ---------------------------------------------------------------------------
// ApplyToAllBar
// ---------------------------------------------------------------------------
interface ApplyToAllValues {
  startTime?: any;
  endTime?: any;
  totalMarks?: string;
  passingMarks?: string;
}

interface ApplyToAllBarProps {
  onApply: (values: ApplyToAllValues) => void;
  marksEntryRequired?: boolean;
}

const ApplyToAllBar = memo(({ onApply, marksEntryRequired = true }: ApplyToAllBarProps) => {
  const [bulkStartTime, setBulkStartTime] = useState<any>(null);
  const [bulkEndTime, setBulkEndTime] = useState<any>(null);
  const [bulkTotalMarks, setBulkTotalMarks] = useState('');
  const [bulkPassingMarks, setBulkPassingMarks] = useState('');

  const hasAnyValue = !!(
    bulkStartTime ||
    bulkEndTime ||
    (marksEntryRequired && (bulkTotalMarks || bulkPassingMarks))
  );

  const handleApply = () => {
    const updates: ApplyToAllValues = {};
    if (bulkStartTime !== null) updates.startTime = bulkStartTime;
    if (bulkEndTime !== null) updates.endTime = bulkEndTime;
    if (marksEntryRequired && bulkTotalMarks !== '') updates.totalMarks = bulkTotalMarks;
    if (marksEntryRequired && bulkPassingMarks !== '') updates.passingMarks = bulkPassingMarks;
    if (!Object.keys(updates).length) return;
    onApply(updates);
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
      gap={1}
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 1.5,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: (theme: any) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ whiteSpace: 'nowrap', letterSpacing: '0.01em', pr: 0.5, flexShrink: 0 }}
      >
        Apply to all
      </Typography>
      <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto' }} />
      <TimePicker
        value={bulkStartTime}
        label="Start Time"
        format="hh:mm a"
        onChange={setBulkStartTime}
        viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
      />
      <TimePicker
        value={bulkEndTime}
        label="End Time"
        format="hh:mm a"
        onChange={setBulkEndTime}
        viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
      />
      {marksEntryRequired && (
        <>
          <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto' }} />
          <TextField
            value={bulkTotalMarks}
            label="Total marks"
            type="number"
            size="small"
            sx={{ width: 120 }}
            inputProps={{ min: 0 }}
            onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
            onChange={(e) => setBulkTotalMarks(e.target.value)}
          />
          <TextField
            value={bulkPassingMarks}
            label="Passing marks"
            type="number"
            size="small"
            sx={{ width: 130 }}
            inputProps={{ min: 0 }}
            onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
            onChange={(e) => setBulkPassingMarks(e.target.value)}
          />
        </>
      )}
      <Box sx={{ ml: 'auto', flexShrink: 0 }}>
        <Tooltip title="Apply filled values to all subjects" arrow>
          <span>
            <Button
              size="small"
              variant="contained"
              color="success"
              disabled={!hasAnyValue}
              onClick={handleApply}
              sx={{ minWidth: 72, fontWeight: 700, fontSize: '0.72rem', borderRadius: 1 }}
            >
              Apply
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
});
ApplyToAllBar.displayName = 'ApplyToAllBar';

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------
interface SectionHeaderProps {
  icon: string;
  accent: 'primary' | 'warning';
  title: string;
  chips: Array<{ label: string; color: 'primary' | 'warning' | 'default' | 'info' }>;
}

const SectionHeader = memo(({ icon, accent, title, chips }: SectionHeaderProps) => (
  <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1.5,
        flexShrink: 0,
        bgcolor: (theme: any) =>
          accent === 'primary'
            ? varAlpha(theme.vars.palette.primary.mainChannel, 0.12)
            : varAlpha(theme.vars.palette.warning.mainChannel, 0.14),
        color: accent === 'primary' ? 'primary.main' : 'warning.main',
      }}
    >
      <Iconify icon={icon} width={20} />
    </Box>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
    {chips.map((chip) => (
      <Chip
        key={chip.label}
        label={chip.label}
        size="small"
        color={chip.color}
        variant="soft"
        sx={{ fontSize: '0.72rem', height: 22, fontWeight: 600 }}
      />
    ))}
  </Stack>
));
SectionHeader.displayName = 'SectionHeader';

// ---------------------------------------------------------------------------
// Helper: Check if two exam slots overlap on same date
// ---------------------------------------------------------------------------
const slotsOverlap = (a: any, b: any) => {
  if (
    !a?.examDate ||
    !b?.examDate ||
    !a?.startTime ||
    !a?.endTime ||
    !b?.startTime ||
    !b?.endTime
  ) {
    return false;
  }
  const dateA = dayjs(a.examDate).format('YYYY-MM-DD');
  const dateB = dayjs(b.examDate).format('YYYY-MM-DD');
  if (dateA !== dateB) return false;

  const tStartA = dayjs(a.startTime);
  const tEndA = dayjs(a.endTime);
  const tStartB = dayjs(b.startTime);
  const tEndB = dayjs(b.endTime);

  const startA = dayjs(a.examDate)
    .hour(tStartA.hour())
    .minute(tStartA.minute())
    .second(0)
    .millisecond(0);
  const endA = dayjs(a.examDate).hour(tEndA.hour()).minute(tEndA.minute()).second(0).millisecond(0);
  const startB = dayjs(b.examDate)
    .hour(tStartB.hour())
    .minute(tStartB.minute())
    .second(0)
    .millisecond(0);
  const endB = dayjs(b.examDate).hour(tEndB.hour()).minute(tEndB.minute()).second(0).millisecond(0);

  return startA.isBefore(endB) && endA.isAfter(startB);
};

// ---------------------------------------------------------------------------
// ElectiveGroupCard
// ---------------------------------------------------------------------------
interface ElectiveGroupCardProps {
  formik: any;
  groupIndex: number;
  gradeScalings: any[];
  isGradeScalingsLoading: boolean;
  currentYear: any;
  standardId?: string | null;
}

const ElectiveGroupCard = memo(
  ({
    formik,
    groupIndex,
    gradeScalings,
    isGradeScalingsLoading,
    currentYear,
    standardId,
  }: ElectiveGroupCardProps) => {
    const group = formik.values.subjects[groupIndex];
    const groupName: string = group?.subjectName || group?.electiveGroupName || 'Elective Group';
    const individualSubjects: any[] = group?.subjects || [];
    const groupSubjectsError = formik.errors.subjects?.[groupIndex]?.subjects;
    const showGroupScheduleError =
      typeof groupSubjectsError === 'string' &&
      (formik.submitCount > 0 || Boolean(formik.touched.subjects?.[groupIndex]?.subjects));

    const handleSubjectFieldChange = useCallback(
      (subjectIdx: number, field: string, value: any) =>
        formik.setFieldValue(`subjects.${groupIndex}.subjects.${subjectIdx}.${field}`, value),
      [formik, groupIndex]
    );

    const handleSepFieldBlur = useCallback(
      (subjectIdx: number, field: string) => {
        formik.setFieldTouched(
          `subjects.${groupIndex}.subjects.${subjectIdx}.${field}`,
          true,
          true
        );
      },
      [formik, groupIndex]
    );

    const handleApplyToGroup = useCallback(
      async (values: ApplyToAllValues) => {
        if (!Object.keys(values).length) return;
        const updated = formik.values.subjects.map((sub: any, idx: number) => {
          if (idx !== groupIndex) return sub;
          return {
            ...sub,
            subjects: (sub.subjects || []).map((s: any) =>
              s.isExamSelectionDisabled ? s : { ...s, ...values }
            ),
          };
        });
        await formik.setValues({ ...formik.values, subjects: updated }, true);

        // Set touched so errors show up immediately
        const updatedTouched = { ...formik.touched };
        if (!updatedTouched.subjects) updatedTouched.subjects = [];
        if (!updatedTouched.subjects[groupIndex]) updatedTouched.subjects[groupIndex] = {};
        if (!updatedTouched.subjects[groupIndex].subjects) {
          updatedTouched.subjects[groupIndex].subjects = [];
        }
        const groupObj = formik.values.subjects[groupIndex];
        (groupObj.subjects || []).forEach((s: any, subjectIdx: number) => {
          if (!updatedTouched.subjects[groupIndex].subjects[subjectIdx]) {
            updatedTouched.subjects[groupIndex].subjects[subjectIdx] = {};
          }
          Object.keys(values).forEach((key) => {
            updatedTouched.subjects[groupIndex].subjects[subjectIdx][key] = true;
          });
        });
        formik.setTouched(updatedTouched);
      },
      [formik, groupIndex]
    );

    return (
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<Iconify icon="eva:chevron-down-fill" width={18} />}
          sx={{
            px: 2,
            minHeight: 44,
            bgcolor: (theme: any) => varAlpha(theme.vars.palette.warning.mainChannel, 0.07),
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&.Mui-expanded': { minHeight: 44 },
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              gap: 1,
              my: 0.75,
              flexWrap: 'wrap',
            },
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 'warning.main',
              flexShrink: 0,
            }}
          />
          <Typography variant="subtitle2" fontWeight={700}>
            {groupName}
          </Typography>
          <Chip
            label={`${individualSubjects.length} subject${individualSubjects.length !== 1 ? 's' : ''}`}
            size="small"
            color="warning"
            variant="soft"
            sx={{ fontSize: '0.7rem', height: 20, fontWeight: 600 }}
          />
        </AccordionSummary>

        <AccordionDetails sx={{ p: 0 }}>
          {/* Per-group apply-to-all bar */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme: any) => varAlpha(theme.vars.palette.warning.mainChannel, 0.03),
            }}
          >
            <ApplyToAllBar
              onApply={handleApplyToGroup}
              marksEntryRequired={formik.values.marksEntryRequired}
            />
            {showGroupScheduleError && (
              <Alert severity="error" variant="outlined" sx={{ mt: 1, py: 0.5 }}>
                {groupSubjectsError}
              </Alert>
            )}
          </Box>

          {/* Schedule table */}
          <TableContainer>
            <Table size="small" sx={{ tableLayout: 'auto' }}>
              <ScheduleTableHead />
              <TableBody>
                {individualSubjects.map((sub: any, j: number) => {
                  const subSchedule = group.subjects?.[j] || sub;
                  const subErrors = formik.errors.subjects?.[groupIndex]?.subjects?.[j] ?? {};
                  const subTouched = formik.touched.subjects?.[groupIndex]?.subjects?.[j] ?? {};
                  return (
                    <SubjectScheduleRow
                      key={`sep-${groupIndex}-${j}-${sub.subjectId || j}`}
                      values={{
                        subjectColor: sub.subjectColor || sub.color || '#9E9E9E',
                        subjectName: sub.subjectName || sub.name || '',
                        subjectCode: sub.subjectCode || sub.code,
                        examDate: subSchedule.examDate || null,
                        startTime: subSchedule.startTime || null,
                        endTime: subSchedule.endTime || null,
                        gradeScalingId: subSchedule.gradeScalingId ?? null,
                        totalMarks: subSchedule.totalMarks ?? '',
                        passingMarks: subSchedule.passingMarks ?? '',
                        notes: subSchedule.notes ?? '',
                        assignedStudentCount: sub.assignedStudentCount,
                        isExamSelectionDisabled: sub.isExamSelectionDisabled,
                      }}
                      errors={subErrors}
                      touched={subTouched}
                      onFieldChange={(field, value) => handleSubjectFieldChange(j, field, value)}
                      onFieldBlur={(field) => handleSepFieldBlur(j, field)}
                      gradeScalings={gradeScalings}
                      isGradeScalingsLoading={isGradeScalingsLoading}
                      currentYear={currentYear}
                      standardId={standardId}
                      isReadOnly={!!sub.isExamSelectionDisabled}
                      marksEntryRequired={formik.values.marksEntryRequired}
                      gradeScaleRequired={formik.values.gradeScaleRequired}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  }
);
ElectiveGroupCard.displayName = 'ElectiveGroupCard';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  const formik: any = props;
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: gradeScalings, isLoading: isGradeScalingsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, includeArchived: false },
    options: { skip: !(currentMedium as Medium)?.id },
  });

  const gradeScalingsList: any[] = useMemo(
    () => (gradeScalings?.data ?? []).filter(isSelectableSetting),
    [gradeScalings?.data]
  );

  const { coreSubjects, electiveGroups } = useMemo(() => {
    const core: Array<{ subject: any; index: number }> = [];
    const elective: Array<{ subject: any; index: number }> = [];
    formik.values.subjects.forEach((sub: any, index: number) => {
      if (sub.electiveGroupId) {
        elective.push({ subject: sub, index });
      } else {
        core.push({ subject: sub, index });
      }
    });
    return { coreSubjects: core, electiveGroups: elective };
  }, [formik.values.subjects]);

  const totalElectiveSubjects = useMemo(
    () => electiveGroups.reduce((acc, { subject }) => acc + (subject.subjects?.length ?? 0), 0),
    [electiveGroups]
  );

  const handleApplyAllCore = useCallback(
    async (values: ApplyToAllValues) => {
      if (!Object.keys(values).length) return;
      const updated = formik.values.subjects.map((sub: any) =>
        sub.electiveGroupId ? sub : { ...sub, ...values }
      );
      await formik.setValues({ ...formik.values, subjects: updated }, true);

      // Set touched so errors show up immediately
      const updatedTouched = { ...formik.touched };
      if (!updatedTouched.subjects) updatedTouched.subjects = [];
      formik.values.subjects.forEach((sub: any, index: number) => {
        if (!sub.electiveGroupId) {
          if (!updatedTouched.subjects[index]) updatedTouched.subjects[index] = {};
          Object.keys(values).forEach((key) => {
            updatedTouched.subjects[index][key] = true;
          });
        }
      });
      formik.setTouched(updatedTouched);
    },
    [formik]
  );

  const hasNoSubjects = coreSubjects.length === 0 && electiveGroups.length === 0;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Paper
        variant="outlined"
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.04),
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Iconify
              icon="solar:calendar-add-bold-duotone"
              width={24}
              sx={{ color: 'info.main', mt: 0.25 }}
            />
            <Box>
              <Typography variant="subtitle2">Add exam dates to academic calendar</Typography>
              <Typography variant="caption" color="text.secondary">
                Creates class-specific exam markers named Exam Name (Subject Name).
              </Typography>
            </Box>
          </Stack>

          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                checked={Boolean(formik.values.syncToAcademicCalendar)}
                onChange={(event) =>
                  formik.setFieldValue('syncToAcademicCalendar', event.target.checked)
                }
                color="primary"
              />
            }
            label={formik.values.syncToAcademicCalendar ? 'Enabled' : 'Disabled'}
          />
        </Stack>
      </Paper>
      {/* ═══════════════════════════════════
          CORE SUBJECTS SECTION
      ═══════════════════════════════════ */}
      {coreSubjects.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            mb: 3,
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ p: 2, pb: 1.5 }}>
            <SectionHeader
              icon="solar:list-bold-duotone"
              accent="primary"
              title="Core subjects"
              chips={[
                {
                  label: `${coreSubjects.length} subject${coreSubjects.length !== 1 ? 's' : ''}`,
                  color: 'primary',
                },
              ]}
            />
            <ApplyToAllBar
              onApply={handleApplyAllCore}
              marksEntryRequired={formik.values.marksEntryRequired}
            />
          </Box>
          <TableContainer>
            <Table size="small" sx={{ tableLayout: 'auto' }}>
              <ScheduleTableHead />
              <TableBody>
                {coreSubjects.map(({ subject, index }) => {
                  const subErrors =
                    typeof formik.errors.subjects?.[index] === 'object'
                      ? (formik.errors.subjects[index] as any)
                      : {};
                  const subTouched = formik.touched.subjects?.[index] ?? {};
                  return (
                    <SubjectScheduleRow
                      key={subject.subjectId || index}
                      values={subject}
                      errors={subErrors}
                      touched={subTouched}
                      onFieldChange={(field, value) =>
                        formik.setFieldValue(`subjects.${index}.${field}`, value)
                      }
                      onFieldBlur={(field) => {
                        formik.setFieldTouched(`subjects.${index}.${field}`, true, true);
                      }}
                      gradeScalings={gradeScalingsList}
                      isGradeScalingsLoading={isGradeScalingsLoading}
                      currentYear={currentYear}
                      standardId={formik.values.className}
                      marksEntryRequired={formik.values.marksEntryRequired}
                      gradeScaleRequired={formik.values.gradeScaleRequired}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ═══════════════════════════════════
          ELECTIVE SUBJECTS SECTION
      ═══════════════════════════════════ */}
      {electiveGroups.length > 0 && (
        <Box>
          <Box sx={{ mb: 2, px: 0.5 }}>
            <SectionHeader
              icon="solar:star-bold-duotone"
              accent="warning"
              title="Elective subjects"
              chips={[
                {
                  label: `${electiveGroups.length} group${electiveGroups.length !== 1 ? 's' : ''}`,
                  color: 'warning',
                },
                {
                  label: `${totalElectiveSubjects} subject${totalElectiveSubjects !== 1 ? 's' : ''}`,
                  color: 'default',
                },
              ]}
            />
          </Box>

          {electiveGroups.map(({ index }) => (
            <ElectiveGroupCard
              key={formik.values.subjects[index]?.electiveGroupId || index}
              formik={formik}
              groupIndex={index}
              gradeScalings={gradeScalingsList}
              isGradeScalingsLoading={isGradeScalingsLoading}
              currentYear={currentYear}
              standardId={formik.values.className}
            />
          ))}
        </Box>
      )}

      {/* Empty state */}
      {hasNoSubjects && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 10,
            color: 'text.disabled',
            textAlign: 'center',
          }}
        >
          <Iconify icon="solar:calendar-bold-duotone" width={52} sx={{ opacity: 0.4 }} />
          <Typography variant="body2" color="text.secondary">
            No subjects selected. Go back to Step 1 to select subjects.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExamDetails;
