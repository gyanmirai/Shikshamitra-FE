import type { FormikProps } from 'formik';
import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { memo, useMemo, useState, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import {
  Box,
  Chip,
  Stack,
  Paper,
  Table,
  Button,
  Divider,
  Tooltip,
  TableRow,
  Accordion,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  TableContainer,
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
  const diffMins = dayjs(endTime).diff(dayjs(startTime), 'minute');
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
}

interface SubjectScheduleRowProps {
  values: SubjectRowValues;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  onFieldChange: (field: string, value: any) => void;
  onFieldBlur: (field: string) => void;
  gradeScalings: any[];
  isGradeScalingsLoading: boolean;
  currentYear: any;
  isReadOnly?: boolean;
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
    isReadOnly = false,
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
            onChange={(v) => {
              onFieldChange('examDate', v);
              onFieldBlur('examDate');
            }}
            minDate={dayjs()}
            maxDate={dayjs(currentYear?.endDate)}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 145 },
                error: !!(touched.examDate && errors.examDate),
                helperText: touched.examDate && errors.examDate ? errors.examDate : ' ',
                FormHelperTextProps: HELPER_TEXT_PROPS,
                InputLabelProps: LABEL_PROPS,
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
            onChange={(v) => {
              onFieldChange('startTime', v);
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
            onChange={(v) => {
              onFieldChange('endTime', v);
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
      <TableCell sx={{ minWidth: 180, py: 1, px: 1.5 }}>
        <Box sx={{ pb: '20px' }}>
          <CustomSelect
            label="Scale"
            options={gradeScalings}
            value={values.gradeScalingId ?? ''}
            labelKey="name"
            valueKey="id"
            isLoading={isGradeScalingsLoading}
            formControlProps={{ sx: { width: 165 } }}
            onChange={(selectedId) => {
              onFieldChange('gradeScalingId', selectedId || null);
              const selected = gradeScalings.find((s: any) => s.id === selectedId);
              if (selected?.totalMarks !== undefined) {
                onFieldChange('totalMarks', selected.totalMarks ?? '');
              }
            }}
          />
        </Box>
      </TableCell>

      {/* Total Marks */}
      <TableCell sx={{ minWidth: 155, py: 1, px: 1.5, verticalAlign: 'top' }}>
        <ShakingTextField error={!!(touched.totalMarks && errors.totalMarks)}>
          <TextField
            value={values.totalMarks ?? ''}
            type="number"
            label="Total Marks *"
            size="small"
            onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
            onChange={(e) => {
              onFieldChange('totalMarks', e.target.value);
              onFieldBlur('totalMarks');
            }}
            error={!!(touched.totalMarks && errors.totalMarks)}
            helperText={touched.totalMarks && errors.totalMarks ? errors.totalMarks : ' '}
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
                label="Passing Marks *"
                size="small"
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
                      : ' '
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
}

const ApplyToAllBar = memo(({ onApply }: ApplyToAllBarProps) => {
  const [bulkStartTime, setBulkStartTime] = useState<any>(null);
  const [bulkEndTime, setBulkEndTime] = useState<any>(null);
  const [bulkTotalMarks, setBulkTotalMarks] = useState('');
  const [bulkPassingMarks, setBulkPassingMarks] = useState('');

  const hasAnyValue = !!(bulkStartTime || bulkEndTime || bulkTotalMarks || bulkPassingMarks);

  const handleApply = () => {
    const updates: ApplyToAllValues = {};
    if (bulkStartTime !== null) updates.startTime = bulkStartTime;
    if (bulkEndTime !== null) updates.endTime = bulkEndTime;
    if (bulkTotalMarks !== '') updates.totalMarks = bulkTotalMarks;
    if (bulkPassingMarks !== '') updates.passingMarks = bulkPassingMarks;
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
  <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
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
// Separate-mode inline validator — mirrors validationSchema Step 1 rules
// ---------------------------------------------------------------------------
function validateSepSubject(sub: any): Record<string, string> {
  const errs: Record<string, string> = {};

  if (!sub?.examDate || !dayjs(sub.examDate).isValid()) {
    errs.examDate = 'Exam date is required';
  } else if (!dayjs(sub.examDate).isSameOrAfter(dayjs().startOf('day'))) {
    errs.examDate = 'Exam date cannot be in the past';
  }

  if (!sub?.startTime || !dayjs(sub.startTime).isValid()) {
    errs.startTime = 'Start time is required';
  }

  if (!sub?.endTime || !dayjs(sub.endTime).isValid()) {
    errs.endTime = 'End time is required';
  } else if (sub?.startTime && dayjs(sub.startTime).isValid()) {
    if (!dayjs(sub.endTime).isAfter(dayjs(sub.startTime))) {
      errs.endTime = 'End time must be after start time';
    } else if (dayjs(sub.endTime).diff(dayjs(sub.startTime), 'minute') < 30) {
      errs.endTime = 'Exam duration must be at least 30 minutes';
    }
  }

  const totalN = Number(sub?.totalMarks);
  if (sub?.totalMarks === '' || sub?.totalMarks === null || sub?.totalMarks === undefined) {
    errs.totalMarks = 'Total Marks is required';
  } else if (Number.isNaN(totalN) || totalN < 1) {
    errs.totalMarks = 'Total marks must be at least 1';
  } else if (totalN > 1000) {
    errs.totalMarks = 'Total marks cannot exceed 1000';
  } else if (!Number.isInteger(totalN)) {
    errs.totalMarks = 'Total marks must be a whole number';
  }

  const passingN = Number(sub?.passingMarks);
  if (sub?.passingMarks === '' || sub?.passingMarks === null || sub?.passingMarks === undefined) {
    errs.passingMarks = 'Passing Marks is required';
  } else if (Number.isNaN(passingN) || passingN < 1) {
    errs.passingMarks = 'Passing marks must be at least 1';
  } else if (!Number.isNaN(totalN) && totalN > 0 && passingN > totalN) {
    errs.passingMarks = 'Passing marks cannot exceed total marks';
  }

  return errs;
}

const ALL_FIELDS_TOUCHED: Record<string, boolean> = {
  examDate: true,
  startTime: true,
  endTime: true,
  totalMarks: true,
  passingMarks: true,
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
}

const ElectiveGroupCard = memo(
  ({
    formik,
    groupIndex,
    gradeScalings,
    isGradeScalingsLoading,
    currentYear,
  }: ElectiveGroupCardProps) => {
    const group = formik.values.subjects[groupIndex];
    const groupName: string = group?.subjectName || group?.electiveGroupName || 'Elective Group';
    const individualSubjects: any[] = group?.subjects || [];

    const handleSubjectFieldChange = useCallback(
      (subjectIdx: number, field: string, value: any) => {
        formik.setFieldValue(`subjects.${groupIndex}.subjects.${subjectIdx}.${field}`, value);
      },
      [formik, groupIndex]
    );

    const [sepTouched, setSepTouched] = useState<Record<number, Record<string, boolean>>>({});

    const handleSepFieldBlur = useCallback((subjectIdx: number, field: string) => {
      setSepTouched((prev) => ({
        ...prev,
        [subjectIdx]: { ...(prev[subjectIdx] || {}), [field]: true },
      }));
    }, []);

    const showAllSepErrors = Boolean(formik.errors?.subjects);

    const handleApplyToGroup = useCallback(
      (values: ApplyToAllValues) => {
        if (!Object.keys(values).length) return;
        const updated = formik.values.subjects.map((sub: any, idx: number) => {
          if (idx !== groupIndex) return sub;
          return { ...sub, subjects: (sub.subjects || []).map((s: any) => ({ ...s, ...values })) };
        });
        formik.setValues({ ...formik.values, subjects: updated }, true);
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
            <ApplyToAllBar onApply={handleApplyToGroup} />
          </Box>

          {/* Schedule table */}
          <TableContainer>
            <Table size="small" sx={{ tableLayout: 'auto' }}>
              <ScheduleTableHead />
              <TableBody>
                {individualSubjects.map((sub: any, j: number) => {
                  const subSchedule = group.subjects?.[j] || sub;
                  const subErrors = validateSepSubject(subSchedule);
                  const subTouched = showAllSepErrors ? ALL_FIELDS_TOUCHED : (sepTouched[j] ?? {});
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
                      }}
                      errors={subErrors}
                      touched={subTouched}
                      onFieldChange={(field, value) => handleSubjectFieldChange(j, field, value)}
                      onFieldBlur={(field) => handleSepFieldBlur(j, field)}
                      gradeScalings={gradeScalings}
                      isGradeScalingsLoading={isGradeScalingsLoading}
                      currentYear={currentYear}
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
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: { skip: !(currentMedium as Medium)?.id },
  });

  const gradeScalingsList: any[] = gradeScalings?.data ?? [];

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
    (values: ApplyToAllValues) => {
      if (!Object.keys(values).length) return;
      const updated = formik.values.subjects.map((sub: any) =>
        sub.electiveGroupId ? sub : { ...sub, ...values }
      );
      formik.setValues({ ...formik.values, subjects: updated }, true);
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
            <ApplyToAllBar onApply={handleApplyAllCore} />
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
                      onFieldChange={(field, value) => {
                        formik.setFieldValue(`subjects.${index}.${field}`, value);
                      }}
                      onFieldBlur={(field) => {
                        formik.setFieldTouched(`subjects.${index}.${field}`, false, false);
                      }}
                      gradeScalings={gradeScalingsList}
                      isGradeScalingsLoading={isGradeScalingsLoading}
                      currentYear={currentYear}
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
            gap: 1.5,
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
