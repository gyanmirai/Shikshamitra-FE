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
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import {
  assessmentProfileTotal,
  getAssessmentClassProfileError,
} from 'src/redux/student/admissions/admission-assessment-policy';
import {
  Grid,
  Stack,
  Button,
  Accordion,
  TextField,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { WorkflowAssessmentSubjects } from './workflow-assessment-subjects';
import { WorkflowAssessmentMarksField } from './workflow-assessment-marks-field';

import type { AssessmentFieldValidation } from '../hooks/use-assessment-field-validation';

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
  validation,
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
  validation: AssessmentFieldValidation;
  initiallyExpanded: boolean;
  onChange: (profile: AdmissionAssessmentClassProfile) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const showErrors = validation.showError(`${profile.id}:profile`);
  const error = getAssessmentClassProfileError(profile, profiles, false);
  const invalidClasses =
    profile.standardIds.length === 0 || profile.standardIds.some((id) => !id.trim());
  useEffect(() => {
    if (showErrors && getAssessmentClassProfileError(profile, profiles)) setExpanded(true);
  }, [profile, profiles, showErrors]);
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
            {profile.subjects.length} Subjects · {total} Marks
          </Label>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={validation.showError(`${profile.id}:boardId`) && !profile.boardId}
              >
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
                            label: catalogLoaded ? 'Unavailable Board' : 'Saved Board',
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
                  onBlur={() => validation.onBlur(`${profile.id}:boardId`)}
                  error={validation.showError(`${profile.id}:boardId`) && !profile.boardId}
                  helperText={
                    validation.showError(`${profile.id}:boardId`) && !profile.boardId
                      ? 'Choose a board.'
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={validation.showError(`${profile.id}:mediumId`) && !profile.mediumId}
              >
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
                            label: catalogLoaded ? 'Unavailable Medium' : 'Saved Medium',
                          },
                        ]
                      : []),
                  ]}
                  disabled={disabled || catalogUnavailable || !profile.boardId}
                  onChange={(id) =>
                    update({ mediumId: String(id), standardIds: [], name: 'Class profile' })
                  }
                  onBlur={() => validation.onBlur(`${profile.id}:mediumId`)}
                  error={validation.showError(`${profile.id}:mediumId`) && !profile.mediumId}
                  helperText={
                    validation.showError(`${profile.id}:mediumId`) && !profile.mediumId
                      ? 'Choose a medium.'
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={12}>
              <ShakingTextField
                error={validation.showError(`${profile.id}:standardIds`) && invalidClasses}
              >
                <CustomSelect
                  size="small"
                  fullWidth
                  multiple
                  required
                  isSearch
                  label="Applies to Classes"
                  value={profile.standardIds}
                  disabled={disabled || catalogUnavailable || !profile.mediumId}
                  options={[
                    ...classes.map((item) => ({ value: item.id, label: item.name })),
                    ...missingClasses.map((id) => ({
                      value: id,
                      label: catalogLoaded
                        ? 'Unavailable Class (Remove or Replace)'
                        : 'Saved Class',
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
                  onBlur={() => validation.onBlur(`${profile.id}:standardIds`)}
                  error={validation.showError(`${profile.id}:standardIds`) && invalidClasses}
                  helperText={
                    validation.showError(`${profile.id}:standardIds`) && invalidClasses
                      ? 'Choose at least one class.'
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>
          </Grid>
          {unavailableScope && (
            <StudentFeedback notificationKey="STU-0532" presentation="inline" severity="warning">
              A selected class or scope is unavailable. Remove or replace it before publishing.
            </StudentFeedback>
          )}
          <WorkflowAssessmentSubjects
            profileId={profile.id}
            subjects={profile.subjects}
            options={catalog.subjects}
            mediumId={profile.mediumId}
            standardIds={profile.standardIds}
            perSubjectPass={profile.passRule !== 'overall'}
            disabled={disabled}
            catalogUnavailable={catalogUnavailable}
            validation={validation}
            onChange={(subjects) => update({ subjects })}
          />
          <ShakingTextField error={false}>
            <CustomSelect
              size="small"
              fullWidth
              required
              label="Pass Rule"
              value={profile.passRule}
              disabled={disabled}
              options={[
                { value: 'overall', label: 'Overall Marks Only' },
                { value: 'everySubject', label: 'Every Subject' },
                { value: 'both', label: 'Overall and Every Subject' },
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
          </ShakingTextField>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: profile.passRule === 'everySubject' ? 12 : 6 }}>
              <TextField size="small" fullWidth label="Total Marks" value={total} disabled />
            </Grid>
            {profile.passRule !== 'everySubject' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <WorkflowAssessmentMarksField
                  label="Overall Passing Marks"
                  fieldKey={`${profile.id}:passingMarks`}
                  validation={validation}
                  value={profile.passingMarks < 0 ? null : profile.passingMarks}
                  max={total}
                  disabled={disabled || !(total > 0)}
                  disabledHint={
                    !(total > 0) ? 'Add subject marks to set passing marks.' : undefined
                  }
                  onChange={(value) => update({ passingMarks: value ?? -1 })}
                />
              </Grid>
            )}
          </Grid>
          {showErrors && error && (
            <StudentFeedback notificationKey="STU-0533" presentation="inline" severity="error">
              {error}
            </StudentFeedback>
          )}
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              color="error"
              disabled={disabled}
              startIcon={<Iconify icon={GlobalIcons.delete} />}
              onClick={onRemove}
            >
              Remove Profile
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
