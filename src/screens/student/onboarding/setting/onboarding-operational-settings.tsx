'use client';

import type { RootState } from 'src/redux/store';
import type { UpsertStudentOnboardingPolicy } from 'src/redux/student/onboarding/student-onboarding-types';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Alert,
  Paper,
  Stack,
  Button,
  Switch,
  Divider,
  TextField,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useGetStudentIdentifierSeriesQuery,
  useGetStudentOnboardingPoliciesQuery,
  useCreateStudentIdentifierSeriesMutation,
  useCreateStudentOnboardingPolicyMutation,
  useUpdateStudentOnboardingPolicyMutation,
  useDeactivateStudentIdentifierSeriesMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

type OperationalPolicyDraft = Omit<
  UpsertStudentOnboardingPolicy,
  'academicYearId' | 'offeringId' | 'standardId' | 'concurrencyStamp'
>;

const defaultPolicy: OperationalPolicyDraft = {
  name: 'School default onboarding policy',
  requireDocuments: true,
  requireFamilyDetails: true,
  requireCommunicationDetails: true,
  requireMedicalDetails: false,
  requireFeeClearance: false,
  requireStudentAccount: true,
  requireGuardianAccount: true,
  requireServiceConsent: false,
  seatReservationMinutes: 1440,
  slaHours: 72,
  isActive: true,
};

const requirementFields: Array<{
  key:
    | 'requireDocuments'
    | 'requireFamilyDetails'
    | 'requireCommunicationDetails'
    | 'requireMedicalDetails'
    | 'requireFeeClearance'
    | 'requireStudentAccount'
    | 'requireGuardianAccount'
    | 'requireServiceConsent';
  label: string;
  description: string;
}> = [
  {
    key: 'requireDocuments',
    label: 'Required documents',
    description: 'Require Student or accepted admission evidence before activation.',
  },
  {
    key: 'requireFamilyDetails',
    label: 'Family or guardian details',
    description: 'Require at least one parent or guardian record.',
  },
  {
    key: 'requireCommunicationDetails',
    label: 'Communication details',
    description: 'Require a primary contact number and address.',
  },
  {
    key: 'requireMedicalDetails',
    label: 'Medical or previous-school details',
    description: 'Make medical and previous-school details mandatory.',
  },
  {
    key: 'requireFeeClearance',
    label: 'Finance clearance',
    description: 'Create a required Finance handoff during activation.',
  },
  {
    key: 'requireStudentAccount',
    label: 'Student account',
    description: 'Create a required student-account handoff.',
  },
  {
    key: 'requireGuardianAccount',
    label: 'Guardian account',
    description: 'Create a required guardian-account handoff.',
  },
  {
    key: 'requireServiceConsent',
    label: 'Service consent',
    description: 'Require consent before operational completion.',
  },
];

export function usePersistedOnboardingPolicy(enabled: boolean) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id ?? '';
  const policiesQuery = useGetStudentOnboardingPoliciesQuery(academicYearId, {
    skip: !enabled || !academicYearId,
  });
  const [createPolicy, createPolicyState] = useCreateStudentOnboardingPolicyMutation();
  const [updatePolicy, updatePolicyState] = useUpdateStudentOnboardingPolicyMutation();
  const schoolDefaultPolicy = policiesQuery.data?.find(
    (policy) => !policy.offeringId && !policy.standardId
  );
  const [policyDraft, setPolicyDraft] = useState<OperationalPolicyDraft>(defaultPolicy);

  useEffect(() => {
    if (!enabled) return;
    if (!schoolDefaultPolicy) {
      setPolicyDraft(defaultPolicy);
      return;
    }

    setPolicyDraft({
      name: schoolDefaultPolicy.name,
      requireDocuments: schoolDefaultPolicy.requireDocuments,
      requireFamilyDetails: schoolDefaultPolicy.requireFamilyDetails,
      requireCommunicationDetails: schoolDefaultPolicy.requireCommunicationDetails,
      requireMedicalDetails: schoolDefaultPolicy.requireMedicalDetails,
      requireFeeClearance: schoolDefaultPolicy.requireFeeClearance,
      requireStudentAccount: schoolDefaultPolicy.requireStudentAccount,
      requireGuardianAccount: schoolDefaultPolicy.requireGuardianAccount,
      requireServiceConsent: schoolDefaultPolicy.requireServiceConsent,
      seatReservationMinutes: schoolDefaultPolicy.seatReservationMinutes,
      slaHours: schoolDefaultPolicy.slaHours,
      isActive: schoolDefaultPolicy.isActive,
    });
  }, [enabled, schoolDefaultPolicy]);

  const policyNumbersValid =
    Number.isInteger(policyDraft.seatReservationMinutes) &&
    policyDraft.seatReservationMinutes >= 5 &&
    policyDraft.seatReservationMinutes <= 10080 &&
    Number.isInteger(policyDraft.slaHours) &&
    policyDraft.slaHours >= 1 &&
    policyDraft.slaHours <= 8760;
  const isSaving = createPolicyState.isLoading || updatePolicyState.isLoading;
  const canSave = Boolean(
    academicYearId && policyDraft.name.trim() && policyNumbersValid && !isSaving
  );

  const savePolicy = async () => {
    if (!canSave) return;

    const policy: UpsertStudentOnboardingPolicy = {
      ...policyDraft,
      name: policyDraft.name.trim(),
      academicYearId,
      offeringId: null,
      standardId: null,
      concurrencyStamp: schoolDefaultPolicy?.concurrencyStamp,
    };

    try {
      if (schoolDefaultPolicy) {
        await updatePolicy({ id: schoolDefaultPolicy.id, policy }).unwrap();
      } else {
        await createPolicy(policy).unwrap();
      }
      shikshaMitraToast.success({ message: 'Onboarding defaults saved.' });
    } catch {
      shikshaMitraToast.error({
        message: 'The onboarding defaults could not be saved. Refresh and retry.',
      });
    }
  };

  return {
    academicYearId,
    currentYear,
    policiesQuery,
    schoolDefaultPolicy,
    policyDraft,
    setPolicyDraft,
    savePolicy,
    isSaving,
    canSave,
  };
}

export type PersistedPolicyEditor = ReturnType<typeof usePersistedOnboardingPolicy>;

export function PersistedReadinessPolicyFields({ editor }: { editor: PersistedPolicyEditor }) {
  const { academicYearId, currentYear, policiesQuery, schoolDefaultPolicy, policyDraft } = editor;

  return (
    <Stack spacing={2}>
      {!academicYearId ? (
        <Alert severity="info">
          Select an academic year before configuring readiness defaults.
        </Alert>
      ) : null}
      {policiesQuery.isFetching ? (
        <LinearProgress aria-label="Loading saved readiness defaults" />
      ) : null}
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        <Box>
          <Typography variant="subtitle2">School readiness defaults</Typography>
          <Typography variant="caption" color="text.secondary">
            {currentYear?.name || 'Selected academic year'} · used when no academic override exists
          </Typography>
        </Box>
        <Label color={schoolDefaultPolicy?.isActive ? 'success' : 'default'}>
          {schoolDefaultPolicy ? (schoolDefaultPolicy.isActive ? 'Active' : 'Inactive') : 'New'}
        </Label>
      </Stack>

      <TextField
        fullWidth
        required
        size="small"
        label="Policy name"
        value={policyDraft.name}
        onChange={(event) =>
          editor.setPolicyDraft((current) => ({ ...current, name: event.target.value }))
        }
        inputProps={{ maxLength: 120 }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {requirementFields.map((field) => (
          <Paper key={field.key} variant="outlined" sx={{ p: 1.25 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={policyDraft[field.key]}
                  onChange={(event) =>
                    editor.setPolicyDraft((current) => ({
                      ...current,
                      [field.key]: event.target.checked,
                    }))
                  }
                />
              }
              label={field.label}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {field.description}
            </Typography>
          </Paper>
        ))}
      </Box>

      <TextField
        fullWidth
        required
        size="small"
        type="number"
        label="Completion SLA hours"
        value={policyDraft.slaHours}
        onChange={(event) =>
          editor.setPolicyDraft((current) => ({
            ...current,
            slaHours: Number(event.target.value),
          }))
        }
        inputProps={{ min: 1, max: 8760 }}
        error={
          !Number.isInteger(policyDraft.slaHours) ||
          policyDraft.slaHours < 1 ||
          policyDraft.slaHours > 8760
        }
        helperText={
          !Number.isInteger(policyDraft.slaHours) ||
          policyDraft.slaHours < 1 ||
          policyDraft.slaHours > 8760
            ? 'Enter a whole number from 1 to 8760.'
            : undefined
        }
      />

      <FormControlLabel
        control={
          <Switch
            checked={policyDraft.isActive}
            onChange={(event) =>
              editor.setPolicyDraft((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
          />
        }
        label="Policy active"
      />
    </Stack>
  );
}

export function usePersistedIdentifierSeries(enabled: boolean) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id ?? '';
  const seriesQuery = useGetStudentIdentifierSeriesQuery(academicYearId, {
    skip: !enabled || !academicYearId,
  });
  const [createSeries, createSeriesState] = useCreateStudentIdentifierSeriesMutation();
  const [deactivateSeries, deactivateSeriesState] = useDeactivateStudentIdentifierSeriesMutation();
  const [seriesDraft, setSeriesDraft] = useState({
    code: '',
    name: '',
    prefix: '',
    suffix: '',
    padding: '6',
    startingSequence: '1',
    maximumSequence: '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveUntil: '',
  });
  const padding = Number(seriesDraft.padding);
  const startingSequence = Number(seriesDraft.startingSequence);
  const maximumSequence = seriesDraft.maximumSequence ? Number(seriesDraft.maximumSequence) : null;
  const numbersValid =
    Number.isInteger(padding) &&
    padding >= 1 &&
    padding <= 20 &&
    Number.isInteger(startingSequence) &&
    startingSequence >= 1 &&
    (maximumSequence === null ||
      (Number.isInteger(maximumSequence) && maximumSequence >= startingSequence));
  const datesValid =
    Boolean(seriesDraft.effectiveFrom) &&
    (!seriesDraft.effectiveUntil || seriesDraft.effectiveUntil > seriesDraft.effectiveFrom);
  const isBusy = createSeriesState.isLoading || deactivateSeriesState.isLoading;
  const canCreate = Boolean(
    academicYearId &&
    seriesDraft.code.trim() &&
    seriesDraft.name.trim() &&
    numbersValid &&
    datesValid &&
    !isBusy
  );

  const createIdentifierSeries = async () => {
    if (!canCreate) return;

    try {
      await createSeries({
        academicYearId,
        standardId: null,
        identifierType: 0,
        code: seriesDraft.code.trim(),
        name: seriesDraft.name.trim(),
        prefix: seriesDraft.prefix.trim(),
        suffix: seriesDraft.suffix.trim(),
        padding,
        startingSequence,
        maximumSequence,
        effectiveFrom: `${seriesDraft.effectiveFrom}T00:00:00.000Z`,
        effectiveUntil: seriesDraft.effectiveUntil
          ? `${seriesDraft.effectiveUntil}T23:59:59.999Z`
          : null,
      }).unwrap();
      setSeriesDraft((current) => ({
        ...current,
        code: '',
        name: '',
        prefix: '',
        suffix: '',
        startingSequence: '1',
        maximumSequence: '',
      }));
      shikshaMitraToast.success({ message: 'GR identifier series created.' });
    } catch {
      shikshaMitraToast.error({
        message: 'The GR series could not be created. Check for an overlapping series.',
      });
    }
  };

  const deactivateIdentifierSeries = async (
    series: NonNullable<typeof seriesQuery.data>[number]
  ) => {
    try {
      await deactivateSeries({
        id: series.id,
        academicYearId,
        concurrencyStamp: series.concurrencyStamp,
      }).unwrap();
      shikshaMitraToast.success({ message: `${series.name} deactivated.` });
    } catch {
      shikshaMitraToast.error({ message: `${series.name} could not be deactivated.` });
    }
  };

  return {
    academicYearId,
    seriesQuery,
    seriesDraft,
    setSeriesDraft,
    createIdentifierSeries,
    deactivateIdentifierSeries,
    isBusy,
    canCreate,
    padding,
    startingSequence,
    maximumSequence,
    datesValid,
  };
}

export type PersistedIdentifierSeriesEditor = ReturnType<typeof usePersistedIdentifierSeries>;

export function PersistedNumberingPolicyFields({
  policyEditor,
  seriesEditor,
}: {
  policyEditor: PersistedPolicyEditor;
  seriesEditor: PersistedIdentifierSeriesEditor;
}) {
  const { policyDraft } = policyEditor;
  const { seriesDraft, seriesQuery } = seriesEditor;
  const reservationInvalid =
    !Number.isInteger(policyDraft.seatReservationMinutes) ||
    policyDraft.seatReservationMinutes < 5 ||
    policyDraft.seatReservationMinutes > 10080;

  return (
    <Stack spacing={2}>
      {!policyEditor.academicYearId ? (
        <Alert severity="info">Select an academic year before configuring saved numbering.</Alert>
      ) : null}
      {policyEditor.policiesQuery.isFetching || seriesQuery.isFetching ? (
        <LinearProgress aria-label="Loading saved numbering settings" />
      ) : null}

      <Box>
        <Typography variant="subtitle2">Seat reservation</Typography>
        <Typography variant="caption" color="text.secondary">
          Keep a selected Division seat reserved while onboarding is completed.
        </Typography>
      </Box>
      <TextField
        fullWidth
        required
        size="small"
        type="number"
        label="Seat reservation minutes"
        value={policyDraft.seatReservationMinutes}
        onChange={(event) =>
          policyEditor.setPolicyDraft((current) => ({
            ...current,
            seatReservationMinutes: Number(event.target.value),
          }))
        }
        inputProps={{ min: 5, max: 10080 }}
        error={reservationInvalid}
        helperText={reservationInvalid ? 'Enter a whole number from 5 to 10080.' : undefined}
      />

      <Divider />
      <Box>
        <Typography variant="subtitle2">Saved GR identifier series</Typography>
        <Typography variant="caption" color="text.secondary">
          Create the academic-year sequence used when Student Setup prepares a GR number.
        </Typography>
      </Box>

      {seriesQuery.data?.length ? (
        <Stack spacing={1}>
          {seriesQuery.data.map((series) => (
            <Stack
              key={series.id}
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={1}
              sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {series.name} · {series.code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Next: {series.nextPreview} · padding {series.padding}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Label color={series.isActive ? 'success' : 'default'}>
                  {series.isActive ? 'Active' : 'Inactive'}
                </Label>
                {series.isActive ? (
                  <Button
                    size="small"
                    color="inherit"
                    variant="outlined"
                    disabled={seriesEditor.isBusy}
                    onClick={() => seriesEditor.deactivateIdentifierSeries(series)}
                  >
                    Deactivate
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Alert severity="info" variant="outlined">
          No GR identifier series exists for this academic year.
        </Alert>
      )}

      <Divider />
      <Typography variant="subtitle2">Create GR identifier series</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.25,
        }}
      >
        {[
          ['code', 'Series code'],
          ['name', 'Series name'],
          ['prefix', 'Prefix'],
          ['suffix', 'Suffix'],
        ].map(([key, label]) => (
          <TextField
            key={key}
            fullWidth
            required={key === 'code' || key === 'name'}
            size="small"
            label={label}
            value={seriesDraft[key as 'code' | 'name' | 'prefix' | 'suffix']}
            onChange={(event) =>
              seriesEditor.setSeriesDraft((current) => ({
                ...current,
                [key]: event.target.value,
              }))
            }
          />
        ))}
        <TextField
          fullWidth
          required
          size="small"
          type="number"
          label="Number padding"
          value={seriesDraft.padding}
          onChange={(event) =>
            seriesEditor.setSeriesDraft((current) => ({ ...current, padding: event.target.value }))
          }
          inputProps={{ min: 1, max: 20 }}
          error={
            !Number.isInteger(seriesEditor.padding) ||
            seriesEditor.padding < 1 ||
            seriesEditor.padding > 20
          }
        />
        <TextField
          fullWidth
          required
          size="small"
          type="number"
          label="Starting sequence"
          value={seriesDraft.startingSequence}
          onChange={(event) =>
            seriesEditor.setSeriesDraft((current) => ({
              ...current,
              startingSequence: event.target.value,
            }))
          }
          inputProps={{ min: 1 }}
          error={
            !Number.isInteger(seriesEditor.startingSequence) || seriesEditor.startingSequence < 1
          }
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Maximum sequence"
          value={seriesDraft.maximumSequence}
          onChange={(event) =>
            seriesEditor.setSeriesDraft((current) => ({
              ...current,
              maximumSequence: event.target.value,
            }))
          }
          inputProps={{ min: 1 }}
          error={
            seriesEditor.maximumSequence !== null &&
            (!Number.isInteger(seriesEditor.maximumSequence) ||
              seriesEditor.maximumSequence < seriesEditor.startingSequence)
          }
        />
        <TextField
          fullWidth
          required
          size="small"
          type="date"
          label="Effective from"
          value={seriesDraft.effectiveFrom}
          onChange={(event) =>
            seriesEditor.setSeriesDraft((current) => ({
              ...current,
              effectiveFrom: event.target.value,
            }))
          }
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          size="small"
          type="date"
          label="Effective until"
          value={seriesDraft.effectiveUntil}
          onChange={(event) =>
            seriesEditor.setSeriesDraft((current) => ({
              ...current,
              effectiveUntil: event.target.value,
            }))
          }
          InputLabelProps={{ shrink: true }}
          error={!seriesEditor.datesValid}
          helperText={
            !seriesEditor.datesValid ? 'Use a date later than Effective from.' : undefined
          }
        />
      </Box>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="outlined"
          disabled={!seriesEditor.canCreate}
          onClick={seriesEditor.createIdentifierSeries}
        >
          {seriesEditor.isBusy ? 'Creating...' : 'Create series'}
        </Button>
      </Stack>
    </Stack>
  );
}
