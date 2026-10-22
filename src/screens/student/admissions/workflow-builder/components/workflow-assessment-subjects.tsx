import type { AdmissionAssessmentSubjectPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import type { AdmissionAssessmentSubjectOption } from 'src/redux/student/admissions/admission-assessment-catalog-api';

import { useState } from 'react';
import { uuidv4 } from 'src/utils/uuidv4';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Grid, Stack, Button, TextField, IconButton, Typography } from '@mui/material';

import { WorkflowSettingLabel } from './workflow-setting-label';
import { WorkflowAssessmentMarksField } from './workflow-assessment-marks-field';

export function WorkflowAssessmentSubjects({
  subjects,
  options,
  mediumId,
  standardIds,
  perSubjectPass,
  disabled,
  catalogUnavailable,
  showErrors,
  onChange,
}: {
  subjects: AdmissionAssessmentSubjectPolicy[];
  options: AdmissionAssessmentSubjectOption[];
  mediumId: string;
  standardIds: string[];
  perSubjectPass: boolean;
  disabled: boolean;
  catalogUnavailable: boolean;
  showErrors: boolean;
  onChange: (subjects: AdmissionAssessmentSubjectPolicy[]) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const update = (index: number, changes: Partial<AdmissionAssessmentSubjectPolicy>) =>
    onChange(subjects.map((subject, i) => (i === index ? { ...subject, ...changes } : subject)));
  const selected = subjects.flatMap((subject) => (subject.subjectId ? [subject.subjectId] : []));
  const available = options.filter((subject) => subject.mediumId === mediumId);
  const suggested = (subject: AdmissionAssessmentSubjectOption) =>
    subject.assignedStandardIds.some((id) => standardIds.includes(id));
  const ordered = [...available].sort(
    (a, b) => Number(suggested(b)) - Number(suggested(a)) || a.name.localeCompare(b.name)
  );
  const add = (subject?: AdmissionAssessmentSubjectOption) => {
    onChange([
      ...subjects,
      {
        code: uuidv4(),
        subjectId: subject?.id ?? null,
        name: subject?.name ?? '',
        totalMarks: 0,
        passingMarks: null,
      },
    ]);
    setShowPicker(false);
  };

  return (
    <Stack spacing={1}>
      <Typography component="h3" variant="subtitle2">
        <WorkflowSettingLabel
          label="Subjects"
          help="Marks are required for every subject before submitting the combined result. School subjects suggested for the selected classes appear first; you may choose other subjects in the same medium or add a custom entrance-only subject."
        />
      </Typography>
      {subjects.map((subject, index) => {
        const unavailable = Boolean(
          subject.subjectId &&
          !catalogUnavailable &&
          !available.some((option) => option.id === subject.subjectId)
        );
        return (
          <Box key={subject.code} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={1} alignItems="center">
              <Grid size={{ xs: 12, sm: perSubjectPass ? 5 : 7 }}>
                {subject.subjectId ? (
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {subject.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={unavailable ? 'error.main' : 'text.secondary'}
                    >
                      {unavailable
                        ? 'Unavailable for this medium. Remove or replace this subject.'
                        : 'School subject'}
                    </Typography>
                  </Stack>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    required
                    label="Custom subject name"
                    disabled={disabled}
                    value={subject.name}
                    onChange={(event) => update(index, { name: event.target.value })}
                    error={showErrors && !subject.name.trim()}
                    helperText={
                      showErrors && !subject.name.trim()
                        ? 'Enter a custom subject name.'
                        : undefined
                    }
                    slotProps={{ htmlInput: { maxLength: 128 } }}
                  />
                )}
              </Grid>
              <Grid size={{ xs: perSubjectPass ? 5 : 10, sm: perSubjectPass ? 3 : 4 }}>
                <WorkflowAssessmentMarksField
                  label="Maximum marks"
                  ariaLabel={`Maximum marks — ${subject.name || `subject ${index + 1}`}`}
                  value={subject.totalMarks}
                  max={10000}
                  positive
                  disabled={disabled}
                  showError={showErrors}
                  onChange={(value) => update(index, { totalMarks: value ?? 0 })}
                />
              </Grid>
              {perSubjectPass && (
                <Grid size={{ xs: 5, sm: 3 }}>
                  <WorkflowAssessmentMarksField
                    label="Passing marks"
                    ariaLabel={`Passing marks — ${subject.name || `subject ${index + 1}`}`}
                    value={subject.passingMarks}
                    max={subject.totalMarks}
                    disabled={disabled}
                    showError={showErrors}
                    onChange={(value) => update(index, { passingMarks: value })}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <CustomTooltip title={`Remove ${subject.name || 'subject'}`}>
                  <span>
                    <IconButton
                      size="small"
                      sx={{ width: 44, height: 44 }}
                      aria-label={`Remove ${subject.name || `subject ${index + 1}`}`}
                      disabled={disabled}
                      onClick={() => onChange(subjects.filter((_, i) => i !== index))}
                    >
                      <Iconify icon={GlobalIcons.delete} />
                    </IconButton>
                  </span>
                </CustomTooltip>
              </Grid>
            </Grid>
          </Box>
        );
      })}
      {subjects.length === 0 && (
        <Typography variant="body2" color={showErrors ? 'error.main' : 'text.secondary'}>
          No subjects added.
        </Typography>
      )}
      {showPicker && (
        <CustomSelect
          fullWidth
          size="small"
          isSearch
          label="School subject"
          disabled={disabled || catalogUnavailable || !mediumId}
          value=""
          options={ordered.map((subject) => ({
            value: subject.id,
            label: `${subject.name}${suggested(subject) ? ' · For selected classes' : ''}`,
          }))}
          disabledValues={selected}
          disabledLabel="Already added"
          onChange={(id) => {
            const subject = available.find((option) => option.id === id);
            if (subject) add(subject);
          }}
          noOptionsMessage="No active school subjects for this medium. Add a custom subject or check Academic setup."
        />
      )}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          disabled={disabled || catalogUnavailable || !mediumId}
          onClick={() => setShowPicker((value) => !value)}
        >
          {showPicker ? 'Close subject selector' : 'Add school subject'}
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          disabled={disabled || !mediumId}
          onClick={() => add()}
        >
          Add custom subject
        </Button>
      </Stack>
    </Stack>
  );
}
