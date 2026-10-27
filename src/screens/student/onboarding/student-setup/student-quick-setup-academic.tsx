'use client';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import type { QuickAcademicMode } from './student-quick-setup-academic-model';
import type { StudentQuickSetupAcademicEditor } from './use-student-quick-setup-academic';

function NumberMode({
  name,
  value,
  disabled,
  automatic,
  manual,
  onChange,
}: {
  name: string;
  value: QuickAcademicMode;
  disabled: boolean;
  automatic: boolean;
  manual: boolean;
  onChange: (mode: QuickAcademicMode) => void;
}) {
  return (
    <Stack direction="row" spacing={1} role="group" aria-label={`${name} assignment method`}>
      {(['automatic', 'manual'] as const).map((mode) => (
        <Button
          key={mode}
          size="small"
          variant={value === mode ? 'contained' : 'outlined'}
          aria-pressed={value === mode}
          disabled={disabled || (mode === 'automatic' ? !automatic : !manual)}
          onClick={() => onChange(mode)}
        >
          {mode === 'automatic' ? 'Auto' : 'Manual'}
        </Button>
      ))}
    </Stack>
  );
}

export default function StudentQuickSetupAcademic({
  editor,
}: {
  editor: StudentQuickSetupAcademicEditor;
}) {
  const { caseData: item, form, disabled, closed, series, grPolicy } = editor;
  const { values } = form;
  if (!item || editor.loading) {
    return (
      <Stack spacing={1.5} aria-label="Loading academic setup">
        {!editor.error && <Skeleton variant="rounded" height={244} />}
        {editor.error && (
          <StudentFeedback
            notificationKey="STU-1029"
            presentation={editor.errorPresentation}
            severity="error"
            action={
              <Button size="small" onClick={editor.retry}>
                Retry
              </Button>
            }
          >
            {editor.error}
          </StudentFeedback>
        )}
      </Stack>
    );
  }
  const fieldError = (name: keyof typeof values) =>
    form.touched[name] ? form.errors[name] : undefined;
  const field = (name: keyof typeof values) => ({
    name,
    value: values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: Boolean(fieldError(name)),
    helperText: fieldError(name),
  });
  const grAssigned = Boolean(item.grNumber && !editor.editingGr);
  const placementInvalidatesRoll = Boolean(
    item.divisionId && values.divisionId !== item.divisionId && !item.rollNumberLocked
  );
  const rollAssigned = Boolean(item.rollNumber && !editor.editingRoll && !placementInvalidatesRoll);
  const grAuto =
    Boolean(grPolicy && grPolicy !== 'manual') || Boolean(item.grNumberLocked && grPolicy);
  const grManual = Boolean(
    grPolicy && grPolicy !== 'automatic' && item.grManualEntryAllowed && !item.grNumberLocked
  );
  const rollAuto =
    item.rollAssignmentMode === 'automatic' ||
    item.rollAssignmentMode === 'both' ||
    Boolean(item.rollNumberLocked && !item.rollNumber);
  const rollManual =
    (item.rollAssignmentMode === 'manual' || item.rollAssignmentMode === 'both') &&
    !item.rollNumberLocked;
  const grSeries =
    series.find((entry) => entry.id === values.numberSeriesId) ??
    (series.length === 1 ? series[0] : undefined);
  const grid = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 };
  return (
    <Stack spacing={1.5} sx={{ flex: 1 }}>
      {editor.error && (
        <StudentFeedback
          notificationKey="STU-1030"
          presentation={editor.errorPresentation}
          severity="error"
          action={
            <Button size="small" disabled={editor.busy} onClick={editor.retry}>
              Retry
            </Button>
          }
        >
          {editor.error}
        </StudentFeedback>
      )}
      <FormSectionCard
        title="Class & Numbers"
        icon="mdi:google-classroom"
        contentSpacing={1.5}
        sx={{ flex: 1 }}
      >
        <Box id="quick-setup-division" sx={grid}>
          <TextField
            size="small"
            fullWidth
            label="Class"
            value={item.intendedStandardName}
            slotProps={{ input: { readOnly: true } }}
          />
          {closed || !editor.placements.data ? (
            <TextField
              size="small"
              fullWidth
              label="Division"
              value={item.divisionName || 'Not assigned'}
              slotProps={{ input: { readOnly: true } }}
            />
          ) : (
            <ShakingTextField error={Boolean(fieldError('divisionId'))}>
              <CustomSelect
                size="small"
                fullWidth
                label="Division"
                name="divisionId"
                value={values.divisionId}
                options={editor.placements.data.map((option) => ({
                  value: option.id,
                  label: `${option.name} · ${option.availableSeats} seats available`,
                }))}
                disabledValues={editor.placements.data
                  .filter((option) => option.isFull && option.id !== item.divisionId)
                  .map((option) => option.id)}
                onChange={(value) => editor.changeDivision(String(value))}
                onBlur={() => form.setFieldTouched('divisionId', true)}
                error={Boolean(fieldError('divisionId'))}
                helperText={fieldError('divisionId')}
                disabled={disabled || editor.placements.isFetching || editor.placements.isError}
                noOptionsMessage="No divisions are available."
              />
            </ShakingTextField>
          )}
        </Box>
        {editor.placements.isError && !closed && (
          <StudentFeedback
            notificationKey="STU-1031"
            presentation="toast"
            severity="error"
            action={
              <Button size="small" onClick={editor.retry}>
                Retry
              </Button>
            }
          >
            Could not load division availability. Try again.
          </StudentFeedback>
        )}
        {editor.placements.isLoading && !closed && <Skeleton variant="rounded" height={36} />}
        {!closed && values.divisionId !== (item.divisionId ?? '') && item.divisionId && (
          <ShakingTextField error={Boolean(fieldError('divisionReason'))}>
            <TextField
              size="small"
              fullWidth
              label="Division change reason"
              disabled={disabled}
              {...field('divisionReason')}
            />
          </ShakingTextField>
        )}
        <Box sx={grid}>
          <Stack id="quick-setup-gr-number" spacing={1} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                GR Number
              </Typography>
              {grAssigned && !disabled && grManual ? (
                <Button size="small" onClick={editor.changeGr}>
                  Change
                </Button>
              ) : null}
              {!grAssigned && !closed && (
                <NumberMode
                  name="GR number"
                  value={values.grMode}
                  disabled={
                    disabled || editor.settingsQuery.isFetching || editor.seriesQuery.isFetching
                  }
                  automatic={grAuto && !item.grNumber}
                  manual={grManual}
                  onChange={(mode) => form.setFieldValue('grMode', mode)}
                />
              )}
            </Stack>
            {!grAssigned && series.length > 1 && !closed && (
              <CustomSelect
                label="GR series"
                size="small"
                fullWidth
                value={values.numberSeriesId}
                options={series.map((entry) => ({ value: entry.id, label: entry.name }))}
                onChange={(value) => form.setFieldValue('numberSeriesId', String(value))}
                disabled={disabled || editor.seriesQuery.isFetching}
              />
            )}
            <ShakingTextField error={Boolean(fieldError('grValue'))}>
              <TextField
                size="small"
                fullWidth
                label="GR number"
                {...field('grValue')}
                value={
                  grAssigned
                    ? item.grNumber
                    : values.grMode === 'automatic'
                      ? grSeries?.nextPreview || 'Next available on save'
                      : values.grValue
                }
                slotProps={{
                  input: {
                    readOnly: grAssigned || values.grMode !== 'manual' || !grManual || closed,
                  },
                }}
                disabled={disabled && !grAssigned}
              />
            </ShakingTextField>
            {!grAssigned && !closed && !editor.settingsQuery.isFetching && !grPolicy && (
              <Typography variant="caption" color="text.secondary">
                GR settings are unavailable. Ask an administrator to check the settings.
              </Typography>
            )}
            {!grAssigned &&
              !closed &&
              !editor.seriesQuery.isFetching &&
              !editor.seriesQuery.isError &&
              !series.length && (
                <Typography variant="caption" color="text.secondary">
                  No GR numbering rule is available. Ask an administrator to check the settings.
                </Typography>
              )}
            {!grAssigned && !closed && values.grMode === 'automatic' && grSeries && (
              <Typography variant="caption" color="text.secondary">
                Preview only · confirmed when saved.
              </Typography>
            )}
            {(editor.seriesQuery.isError || editor.settingsQuery.isError) && !closed && (
              <StudentFeedback
                notificationKey="STU-1032"
                presentation="toast"
                severity="error"
                action={
                  <Button size="small" onClick={editor.retry}>
                    Retry
                  </Button>
                }
              >
                Could not load GR settings. Try again.
              </StudentFeedback>
            )}
            {editor.editingGr && values.grValue !== item.grNumber && (
              <ShakingTextField error={Boolean(fieldError('grReason'))}>
                <TextField
                  size="small"
                  fullWidth
                  label="GR change reason"
                  required
                  disabled={disabled}
                  {...field('grReason')}
                />
              </ShakingTextField>
            )}
          </Stack>

          <Stack id="quick-setup-roll-number" spacing={1} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Roll Number
              </Typography>
              {rollAssigned && !disabled && rollManual ? (
                <Button size="small" onClick={editor.changeRoll}>
                  Change
                </Button>
              ) : null}
              {!rollAssigned && !closed && (
                <NumberMode
                  name="Roll number"
                  value={values.rollMode}
                  disabled={disabled}
                  automatic={rollAuto && (!item.rollNumber || placementInvalidatesRoll)}
                  manual={rollManual}
                  onChange={editor.changeRollMode}
                />
              )}
            </Stack>
            {rollAssigned || values.rollMode !== 'manual' || closed ? (
              <TextField
                size="small"
                fullWidth
                label="Roll number"
                value={
                  rollAssigned || closed
                    ? (item.rollNumber ?? 0)
                    : editor.rollPreview.status === 'loading'
                      ? 'Loading…'
                      : (editor.rollPreview.number ?? 0)
                }
                helperText={
                  !rollAssigned && !closed && values.rollMode === 'automatic'
                    ? !values.divisionId
                      ? 'Select a division to preview the roll number.'
                      : editor.rollPreview.status === 'ready'
                        ? 'Preview only · confirmed when saved.'
                        : undefined
                    : undefined
                }
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: editor.rollPreview.status === 'loading' && (
                      <InputAdornment position="end">
                        <CircularProgress size={14} aria-label="Loading roll number preview" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            ) : (
              <ShakingTextField error={Boolean(fieldError('rollValue'))}>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  label="Roll number"
                  prefix=""
                  decimalScale={0}
                  thousandSeparator={false}
                  isAllowed={({ value }) => !value || Number(value) <= 2147483647}
                  roundToWholeRupees={false}
                  name="rollValue"
                  value={values.rollValue}
                  placeholder="0"
                  onValueChange={(value, source) => {
                    if (source.source === 'event') form.setFieldValue('rollValue', value.value);
                  }}
                  onBlur={form.handleBlur}
                  error={Boolean(fieldError('rollValue'))}
                  helperText={fieldError('rollValue')}
                  disabled={disabled || !rollManual}
                />
              </ShakingTextField>
            )}
            {!rollAssigned && !closed && !item.rollAssignmentMode && (
              <Typography variant="caption" color="text.secondary">
                Roll number settings are unavailable. Ask an administrator to check the settings.
              </Typography>
            )}
            {editor.editingRoll &&
              values.rollValue !== String(item.rollNumber) &&
              item.rollChangeReasonRequired && (
                <ShakingTextField error={Boolean(fieldError('rollReason'))}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Roll change reason"
                    required
                    disabled={disabled}
                    {...field('rollReason')}
                  />
                </ShakingTextField>
              )}
            {placementInvalidatesRoll && (
              <Typography variant="caption" color="text.secondary">
                Roll number will be checked for the new division.
              </Typography>
            )}
          </Stack>
        </Box>
      </FormSectionCard>
    </Stack>
  );
}
