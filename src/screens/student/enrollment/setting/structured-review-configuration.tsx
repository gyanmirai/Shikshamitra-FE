'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionCrmReviewConfigurationDto,
  UpdateAdmissionCrmReviewConfigurationDto,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { useSelector } from 'react-redux';
import { DeleteOutline } from '@mui/icons-material';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import {
  Box,
  Alert,
  Stack,
  Button,
  Switch,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useGetAdmissionCrmReviewConfigurationQuery,
  useUpdateAdmissionCrmReviewConfigurationMutation,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { admissionCrmActionPermissions } from '../admissions-crm/admission-action-permissions';

const toDraft = (
  value: AdmissionCrmReviewConfigurationDto | undefined
): UpdateAdmissionCrmReviewConfigurationDto | null =>
  value
    ? {
        isEnabled: value.isEnabled,
        title: value.title,
        requiredCompletedReviews: value.requiredCompletedReviews,
        requireConflictDeclaration: value.requireConflictDeclaration,
        criteria: value.criteria.map(({ key, label, maximumScore, isRequired }) => ({
          key,
          label,
          maximumScore,
          isRequired,
        })),
      }
    : null;

const errorMessage = (error: unknown) => {
  const response = error as { data?: { detail?: string; error?: { message?: string } } };
  return (
    response.data?.error?.message || response.data?.detail || 'Review settings could not be saved.'
  );
};

export function StructuredReviewConfiguration({ academicYearId }: { academicYearId: string }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.manageReviewConfiguration
  );
  const canView =
    canManage ||
    hasGrantedPermission(permissions, admissionCrmActionPermissions.viewStructuredReviews);
  const query = useGetAdmissionCrmReviewConfigurationQuery({ academicYearId }, { skip: !canView });
  const effective = useMemo(() => toDraft(query.data), [query.data]);
  const [draft, setDraft] = useState<UpdateAdmissionCrmReviewConfigurationDto | null>(null);
  const [saveConfiguration, saveState] = useUpdateAdmissionCrmReviewConfigurationMutation();

  useEffect(() => setDraft(effective), [effective]);
  const isDirty = Boolean(
    draft && effective && JSON.stringify(draft) !== JSON.stringify(effective)
  );
  useEnrollmentSettingsDirtyState({
    source: 'structured-review-settings',
    dirty: isDirty,
    onDiscard: () => setDraft(effective),
  });

  if (!canView) return null;
  if (query.isLoading || !draft)
    return <LinearProgress aria-label="Loading structured review settings" />;
  if (query.isError) {
    return (
      <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
        Structured review settings could not be loaded.
      </Alert>
    );
  }

  const addCriterion = () => {
    const used = new Set(draft.criteria.map((item) => item.key));
    let number = draft.criteria.length + 1;
    while (used.has(`criterion_${number}`)) number += 1;
    setDraft({
      ...draft,
      criteria: [
        ...draft.criteria,
        { key: `criterion_${number}`, label: '', maximumScore: 5, isRequired: true },
      ],
    });
  };

  const save = async () => {
    if (!draft.title.trim() || draft.criteria.some((item) => !item.label.trim())) {
      shikshaMitraToast.error({ message: 'Add a title and a label for every rubric criterion.' });
      return;
    }
    try {
      await saveConfiguration({ academicYearId, body: draft }).unwrap();
      shikshaMitraToast.success({ message: 'Structured review settings saved.' });
    } catch (error) {
      shikshaMitraToast.error({ message: errorMessage(error) });
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography component="h2" variant="subtitle1">
          Structured admissions review
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add confidential, rubric-based reviewer recommendations before final admission decisions.
          This workflow is optional and starts disabled.
        </Typography>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={draft.isEnabled}
            disabled={!canManage}
            onChange={(_, isEnabled) => setDraft({ ...draft, isEnabled })}
          />
        }
        label="Require structured review for approve, reject, and waitlist decisions"
      />

      {draft.isEnabled ? (
        <Stack spacing={1.5}>
          <Alert severity="info">
            Existing applicants are not enrolled automatically. Start a review from an applicant’s
            Final Admission section when committee review is appropriate.
          </Alert>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(180px, 1fr)' },
              gap: 1.5,
            }}
          >
            <TextField
              label="Review name"
              value={draft.title}
              disabled={!canManage}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
            <TextField
              type="number"
              label="Required completed reviews"
              value={draft.requiredCompletedReviews}
              disabled={!canManage}
              inputProps={{ min: 1, max: 10 }}
              onChange={(event) =>
                setDraft({ ...draft, requiredCompletedReviews: Number(event.target.value) })
              }
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={draft.requireConflictDeclaration}
                disabled={!canManage}
                onChange={(_, requireConflictDeclaration) =>
                  setDraft({ ...draft, requireConflictDeclaration })
                }
              />
            }
            label="Require each reviewer to declare conflicts of interest"
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Review rubric</Typography>
            {draft.criteria.map((criterion, index) => (
              <Box
                key={criterion.key}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 130px auto auto' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <TextField
                  size="small"
                  label={`Criterion ${index + 1}`}
                  value={criterion.label}
                  disabled={!canManage}
                  onChange={(event) => {
                    const criteria = [...draft.criteria];
                    criteria[index] = { ...criterion, label: event.target.value };
                    setDraft({ ...draft, criteria });
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Maximum"
                  value={criterion.maximumScore}
                  disabled={!canManage}
                  inputProps={{ min: 1, max: 100 }}
                  onChange={(event) => {
                    const criteria = [...draft.criteria];
                    criteria[index] = { ...criterion, maximumScore: Number(event.target.value) };
                    setDraft({ ...draft, criteria });
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={criterion.isRequired}
                      disabled={!canManage}
                      onChange={(_, isRequired) => {
                        const criteria = [...draft.criteria];
                        criteria[index] = { ...criterion, isRequired };
                        setDraft({ ...draft, criteria });
                      }}
                    />
                  }
                  label="Required"
                />
                {canManage ? (
                  <IconButton
                    aria-label={`Remove ${criterion.label || `criterion ${index + 1}`}`}
                    disabled={draft.criteria.length === 1}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        criteria: draft.criteria.filter((item) => item.key !== criterion.key),
                      })
                    }
                  >
                    <DeleteOutline />
                  </IconButton>
                ) : null}
              </Box>
            ))}
          </Stack>
          {canManage ? (
            <Button variant="outlined" onClick={addCriterion} sx={{ alignSelf: 'flex-start' }}>
              Add rubric criterion
            </Button>
          ) : null}
        </Stack>
      ) : (
        <Alert severity="success">
          The standard single-decision workflow remains active. No committee review is required.
        </Alert>
      )}

      {canManage ? (
        <Button
          variant="contained"
          disabled={!isDirty || saveState.isLoading}
          onClick={save}
          sx={{ alignSelf: 'flex-start' }}
        >
          Save review settings
        </Button>
      ) : (
        <Alert severity="info">You have view-only access to these settings.</Alert>
      )}
    </Stack>
  );
}
