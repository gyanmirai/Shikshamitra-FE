import type { AdmissionAssessmentCatalog } from 'src/redux/student/admissions/admission-assessment-catalog-api';
import type {
  AdmissionAssessmentPassRule,
  AdmissionAssessmentClassProfile,
} from 'src/redux/student/admissions/admission-assessment-policy';

import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import {
  assessmentProfileTotal,
  getAssessmentClassProfileError,
} from 'src/redux/student/admissions/admission-assessment-policy';
import {
  Grid,
  Stack,
  Alert,
  Button,
  Accordion,
  TextField,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { WorkflowAssessmentSubjects } from './workflow-assessment-subjects';
import { WorkflowAssessmentMarksField } from './workflow-assessment-marks-field';

const uniqueOptions = (options: { value: string; label: string }[]) =>
  options.filter(
    (option, index) => options.findIndex((item) => item.value === option.value) === index
  );

export function WorkflowAssessmentClassProfile({
  profile,
  profiles,
  catalog,
  catalogLoaded,
  catalogUnavailable,
  disabled,
  showErrors,
  initiallyExpanded,
  onChange,
  onRemove,
}: {
  profile: AdmissionAssessmentClassProfile;
  profiles: AdmissionAssessmentClassProfile[];
  catalog: AdmissionAssessmentCatalog;
  catalogLoaded: boolean;
  catalogUnavailable: boolean;
  disabled: boolean;
  showErrors: boolean;
  initiallyExpanded: boolean;
  onChange: (profile: AdmissionAssessmentClassProfile) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const error = getAssessmentClassProfileError(profile, profiles);
  useEffect(() => {
    if (showErrors && error) setExpanded(true);
  }, [error, showErrors]);
  const classes = catalog.classes.filter(
    (item) => item.boardId === profile.boardId && item.mediumId === profile.mediumId
  );
  const boards = uniqueOptions(
    catalog.classes.map((item) => ({
      value: item.boardId,
      label: `${item.boardName} · ${item.academicYearName}`,
    }))
  );
  const mediums = uniqueOptions(
    catalog.classes
      .filter((item) => item.boardId === profile.boardId)
      .map((item) => ({ value: item.mediumId, label: item.mediumName }))
  );
  const missingClasses = profile.standardIds.filter(
    (id) => !classes.some((item) => item.id === id)
  );
  const unavailableScope =
    !catalogUnavailable &&
    (missingClasses.length > 0 ||
      Boolean(profile.boardId && !boards.some((item) => item.value === profile.boardId)) ||
      Boolean(profile.mediumId && !mediums.some((item) => item.value === profile.mediumId)));
  const assigned = profiles
    .filter((item) => item.id !== profile.id)
    .flatMap((item) => item.standardIds);
  const update = (changes: Partial<AdmissionAssessmentClassProfile>) =>
    onChange({
      ...profile,
      ...changes,
      ...((changes.passRule ?? profile.passRule) === 'everySubject' ? { passingMarks: 0 } : {}),
    });
  const total = assessmentProfileTotal(profile);

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={expanded}
      onChange={(_, open) => setExpanded(open)}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        '&:before': { display: 'none' },
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="mdi:chevron-down" />}
        aria-controls={`assessment-profile-${profile.id}-content`}
        id={`assessment-profile-${profile.id}-heading`}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ minWidth: 0 }}
        >
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {profile.name}
          </Typography>
          <Label variant="soft" color="default">
            {profile.subjects.length} subjects · {total} marks
          </Label>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                size="small"
                fullWidth
                required
                label="Board"
                value={profile.boardId}
                options={[
                  ...boards,
                  ...(profile.boardId && !boards.some((item) => item.value === profile.boardId)
                    ? [
                        {
                          value: profile.boardId,
                          label: catalogLoaded ? 'Unavailable board' : 'Saved board',
                        },
                      ]
                    : []),
                ]}
                disabled={disabled || catalogUnavailable}
                onChange={(id) =>
                  update({
                    boardId: String(id),
                    mediumId: '',
                    standardIds: [],
                    name: 'Class profile',
                  })
                }
                error={showErrors && !profile.boardId}
                helperText={showErrors && !profile.boardId ? 'Choose a board.' : undefined}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                size="small"
                fullWidth
                required
                label="Medium"
                value={profile.mediumId}
                options={[
                  ...mediums,
                  ...(profile.mediumId && !mediums.some((item) => item.value === profile.mediumId)
                    ? [
                        {
                          value: profile.mediumId,
                          label: catalogLoaded ? 'Unavailable medium' : 'Saved medium',
                        },
                      ]
                    : []),
                ]}
                disabled={disabled || catalogUnavailable || !profile.boardId}
                onChange={(id) =>
                  update({ mediumId: String(id), standardIds: [], name: 'Class profile' })
                }
                error={showErrors && !profile.mediumId}
                helperText={showErrors && !profile.mediumId ? 'Choose a medium.' : undefined}
              />
            </Grid>
            <Grid size={12}>
              <CustomSelect
                size="small"
                fullWidth
                multiple
                required
                isSearch
                label="Applies to classes"
                value={profile.standardIds}
                disabled={disabled || catalogUnavailable || !profile.mediumId}
                options={[
                  ...classes.map((item) => ({ value: item.id, label: item.name })),
                  ...missingClasses.map((id) => ({
                    value: id,
                    label: catalogLoaded ? 'Unavailable class (remove or replace)' : 'Saved class',
                  })),
                ]}
                disabledValues={assigned.filter((id) => !profile.standardIds.includes(id))}
                disabledLabel="Already configured in another profile"
                onChange={(ids) => {
                  const selectedIds = ids as string[];
                  const names = classes
                    .filter((item) => selectedIds.includes(item.id))
                    .map((item) => item.name);
                  update({
                    standardIds: selectedIds,
                    name: names.join(', ').slice(0, 128) || 'Class profile',
                  });
                }}
                renderValue={(ids) =>
                  !catalogLoaded
                    ? (ids as string[]).length
                      ? `${(ids as string[]).length} saved ${(ids as string[]).length === 1 ? 'class' : 'classes'}`
                      : ''
                    : (ids as string[])
                        .map(
                          (id) =>
                            classes.find((item) => item.id === id)?.name ?? 'Unavailable class'
                        )
                        .join(', ')
                }
                sx={{
                  '& .MuiSelect-select': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                }}
                error={showErrors && profile.standardIds.length === 0}
                helperText={
                  showErrors && profile.standardIds.length === 0
                    ? 'Choose at least one class.'
                    : undefined
                }
              />
            </Grid>
          </Grid>
          {unavailableScope && (
            <Alert severity="warning">
              A selected class or scope is unavailable. Remove or replace it before publishing.
            </Alert>
          )}
          <WorkflowAssessmentSubjects
            subjects={profile.subjects}
            options={catalog.subjects}
            mediumId={profile.mediumId}
            standardIds={profile.standardIds}
            perSubjectPass={profile.passRule !== 'overall'}
            disabled={disabled}
            catalogUnavailable={catalogUnavailable}
            showErrors={showErrors}
            onChange={(subjects) => update({ subjects })}
          />
          <CustomSelect
            size="small"
            fullWidth
            required
            label="Pass rule"
            value={profile.passRule}
            disabled={disabled}
            options={[
              { value: 'overall', label: 'Overall marks only' },
              { value: 'everySubject', label: 'Every subject' },
              { value: 'both', label: 'Overall and every subject' },
            ]}
            onChange={(value) =>
              update({
                passRule: value as AdmissionAssessmentPassRule,
                ...(value === 'overall'
                  ? {
                      subjects: profile.subjects.map((subject) => ({
                        ...subject,
                        passingMarks: null,
                      })),
                    }
                  : {}),
              })
            }
          />
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: profile.passRule === 'everySubject' ? 12 : 6 }}>
              <TextField size="small" fullWidth label="Total marks" value={total} disabled />
            </Grid>
            {profile.passRule !== 'everySubject' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <WorkflowAssessmentMarksField
                  label="Overall passing marks"
                  value={profile.passingMarks < 0 ? null : profile.passingMarks}
                  max={total}
                  disabled={disabled}
                  showError={showErrors}
                  onChange={(value) => update({ passingMarks: value ?? -1 })}
                />
              </Grid>
            )}
          </Grid>
          {showErrors && error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              color="error"
              disabled={disabled}
              startIcon={<Iconify icon={GlobalIcons.delete} />}
              onClick={onRemove}
            >
              Remove profile
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
