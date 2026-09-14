'use client';

import type {
  EsiRule,
  EsiEstablishment,
  EsiComponentTreatment,
} from 'src/redux/hr/statutory-scheme-api';

import { Save } from '@mui/icons-material';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useConfigureEsiEstablishmentMutation,
  useUpdateEsiComponentTreatmentsMutation,
} from 'src/redux/hr/statutory-scheme-api';
import {
  Box,
  Grid,
  Alert,
  Button,
  Select,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

type EstablishmentForm = {
  registrationNumber: string;
  employeeCount: number | '';
  coveredSince: string;
  benefitsActiveFrom: string;
  evidenceReference: string;
};

const EMPTY_TREATMENTS: EsiComponentTreatment[] = [];

const treatmentOptions: Array<{
  value: EsiComponentTreatment['treatment'];
  label: string;
}> = [
  { value: 'Included', label: 'Counts in ESI wages' },
  { value: 'SpecifiedExclusion', label: 'Excluded by statutory rule' },
  { value: 'OtherExclusion', label: 'Other exclusion' },
  { value: 'InKind', label: 'In-kind remuneration' },
  { value: 'Unclassified', label: 'Needs review' },
];

const toEstablishmentForm = (establishment?: EsiEstablishment): EstablishmentForm => ({
  registrationNumber: establishment?.registrationNumber || '',
  employeeCount: establishment?.employeeCount ?? '',
  coveredSince: establishment?.coveredSince?.slice(0, 10) || '',
  benefitsActiveFrom: establishment?.benefitsActiveFrom?.slice(0, 10) || '',
  evidenceReference: establishment?.evidenceReference || '',
});

type EsiStatutoryAdvancedProps = {
  month: string;
  rule?: EsiRule;
  establishment?: EsiEstablishment;
  treatments?: EsiComponentTreatment[];
  isTreatmentsLoading: boolean;
  treatmentsError: boolean;
  canEdit: boolean;
  onRetryTreatments: () => void;
  onDirtyChange: (dirty: boolean) => void;
};

export function EsiStatutoryAdvanced({
  month,
  rule,
  establishment,
  treatments = EMPTY_TREATMENTS,
  isTreatmentsLoading,
  treatmentsError,
  canEdit,
  onRetryTreatments,
  onDirtyChange,
}: EsiStatutoryAdvancedProps) {
  const [configureEstablishment, configureState] = useConfigureEsiEstablishmentMutation();
  const [updateTreatments, treatmentUpdateState] = useUpdateEsiComponentTreatmentsMutation();
  const [establishmentForm, setEstablishmentForm] = useState<EstablishmentForm>(() =>
    toEstablishmentForm(establishment)
  );
  const [treatmentDraft, setTreatmentDraft] = useState<EsiComponentTreatment[]>(treatments);
  const [originalEstablishment, setOriginalEstablishment] = useState(() => toEstablishmentForm(establishment));
  const [originalTreatments, setOriginalTreatments] = useState(treatments);
  const dirtyEstablishment = useRef(false);
  const dirtyTreatments = useRef(false);
  const [effectiveMonth, setEffectiveMonth] = useState(month);
  const [showAllClassifications, setShowAllClassifications] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const registrationRef = useRef<HTMLInputElement>(null);
  const headcountRef = useRef<HTMLInputElement>(null);
  const coveredSinceRef = useRef<HTMLInputElement>(null);
  const benefitsFromRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dirtyEstablishment.current) {
      setEstablishmentForm(toEstablishmentForm(establishment));
      setOriginalEstablishment(toEstablishmentForm(establishment));
    }
  }, [establishment]);

  useEffect(() => {
    if (!dirtyTreatments.current) {
      setTreatmentDraft(treatments);
      setOriginalTreatments(treatments);
    }
  }, [treatments]);

  useEffect(() => {
    setEffectiveMonth(month);
  }, [month]);

  const establishmentDirty =
    JSON.stringify(establishmentForm) !== JSON.stringify(originalEstablishment);
  const treatmentChanges = treatmentDraft.filter((draft) => {
    const original = originalTreatments.find((item) => item.componentId === draft.componentId);
    return original?.treatment !== draft.treatment;
  });
  const dirty = establishmentDirty || treatmentChanges.length > 0;
  dirtyEstablishment.current = establishmentDirty;
  dirtyTreatments.current = treatmentChanges.length > 0;

  useEffect(() => {
    onDirtyChange(dirty);
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
      onDirtyChange(false);
    };
  }, [dirty, onDirtyChange]);

  const unclassifiedCount = treatmentDraft.filter(
    (item) => item.treatment === 'Unclassified'
  ).length;
  const includedCount = treatmentDraft.filter((item) => item.treatment === 'Included').length;
  const excludedCount = treatmentDraft.filter((item) =>
    ['SpecifiedExclusion', 'OtherExclusion'].includes(item.treatment)
  ).length;
  const visibleTreatments = showAllClassifications
    ? treatmentDraft
    : unclassifiedCount > 0
      ? treatmentDraft.filter((item) => item.treatment === 'Unclassified' || treatmentChanges.some((changed) => changed.componentId === item.componentId))
      : treatmentChanges;
  const classificationsExpanded =
    unclassifiedCount > 0 || showAllClassifications || treatmentChanges.length > 0;

  const validateEstablishment = () => {
    const nextErrors: Record<string, string> = {};
    if (!establishmentForm.registrationNumber.trim()) {
      nextErrors.registrationNumber = 'Enter the ESIC registration number.';
    }
    if (
      establishmentForm.employeeCount === '' ||
      !Number.isInteger(establishmentForm.employeeCount) ||
      establishmentForm.employeeCount < 0
    ) {
      nextErrors.employeeCount = 'Enter a whole-number headcount of zero or more.';
    }
    if (!establishmentForm.coveredSince) {
      nextErrors.coveredSince = 'Enter the date ESI coverage started.';
    }
    if (!establishmentForm.benefitsActiveFrom) {
      nextErrors.benefitsActiveFrom = 'Enter the date payroll should start calculating ESI.';
    }
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    const refs: Record<string, React.RefObject<HTMLInputElement | null>> = {
      registrationNumber: registrationRef,
      employeeCount: headcountRef,
      coveredSince: coveredSinceRef,
      benefitsActiveFrom: benefitsFromRef,
    };
    refs[firstError]?.current?.focus();
    return Object.keys(nextErrors).length === 0;
  };

  const saveEstablishment = async () => {
    if (!validateEstablishment()) return;
    const submitted = establishmentForm;
    try {
      await configureEstablishment({
        jurisdictionCode: 'IN-GJ',
        registrationNumber: establishmentForm.registrationNumber.trim(),
        employeeCount: Number(establishmentForm.employeeCount),
        coveredSince: establishmentForm.coveredSince,
        benefitsActiveFrom: establishmentForm.benefitsActiveFrom,
        evidenceReference: establishmentForm.evidenceReference.trim() || null,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Establishment details saved.' });
      setOriginalEstablishment(submitted);
      setErrors({});
    } catch {
      shikshaMitraToast.error({
        message: 'Establishment details could not be saved. Review the form and try again.',
      });
    }
  };

  const saveClassifications = async () => {
    if (!treatmentChanges.length) return;
    const submitted = treatmentDraft;
    try {
      await updateTreatments({
        items: treatmentChanges.map((item) => ({
          ...item,
          effectiveFrom: `${effectiveMonth}-01`,
          effectiveTo: null,
        })),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Earning classifications saved.' });
      setOriginalTreatments(submitted);
    } catch {
      shikshaMitraToast.error({
        message: 'Earning classifications could not be saved. Review the rows and try again.',
      });
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>
      <Box>
        <Typography variant="h6">Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Maintain establishment evidence and the earning rules used to calculate ESI wages.
        </Typography>
      </Box>

      <Box
        id="earning-classifications"
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, md: 2.5 } }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="subtitle1">Earning classifications</Typography>
            <Typography variant="body2" color="text.secondary">
              {includedCount} included, {excludedCount} excluded, {unclassifiedCount} need review
            </Typography>
          </Box>
          <Button
            onClick={() => setShowAllClassifications((value) => !value)}
            sx={{ minHeight: 44 }}
          >
            {classificationsExpanded && showAllClassifications
              ? 'Show only items needing review'
              : 'Show all classifications'}
          </Button>
        </Box>

        {!isTreatmentsLoading && !treatmentsError ? <Alert severity={unclassifiedCount ? 'warning' : 'success'} sx={{ mt: 2 }}>
          {unclassifiedCount
            ? 'Classify every earning used by active salary structures. Items needing review block ESI activation.'
            : 'All active earnings are classified. Open the full list only when a treatment needs to change.'}
        </Alert> : null}

        {treatmentsError ? (
          <Alert
            severity="error"
            action={<Button onClick={onRetryTreatments}>Retry</Button>}
            sx={{ mt: 2 }}
          >
            Earning classifications could not be loaded.
          </Alert>
        ) : null}
        {isTreatmentsLoading ? (
          <Typography variant="body2" color="text.secondary" mt={2}>
            Loading earning classifications…
          </Typography>
        ) : null}

        {classificationsExpanded && !isTreatmentsLoading && !treatmentsError ? (
          <>
            <Divider sx={{ my: 2 }} />
            <TextField
              type="month"
              label="Effective from payroll month"
              value={effectiveMonth}
              disabled={!canEdit}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(event) => setEffectiveMonth(event.target.value)}
              sx={{ mb: 2, width: { xs: '100%', sm: 280 } }}
            />
            <Box display="grid" gap={1}>
              {visibleTreatments.map((item) => (
                <Grid
                  key={item.componentId}
                  container
                  spacing={1.5}
                  alignItems="center"
                  sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.componentName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <FormControl size="small" fullWidth disabled={!canEdit}>
                      <InputLabel>ESI treatment</InputLabel>
                      <Select
                        label="ESI treatment"
                        value={item.treatment}
                        onChange={(event) =>
                          setTreatmentDraft((current) =>
                            current.map((row) =>
                              row.componentId === item.componentId
                                ? {
                                    ...row,
                                    treatment: event.target
                                      .value as EsiComponentTreatment['treatment'],
                                  }
                                : row
                            )
                          )
                        }
                      >
                        {treatmentOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              ))}
            </Box>
            {canEdit ? (
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  disabled={
                    !treatmentChanges.length || !effectiveMonth || treatmentUpdateState.isLoading
                  }
                  onClick={saveClassifications}
                >
                  {treatmentUpdateState.isLoading
                    ? 'Saving…'
                    : `Save ${treatmentChanges.length || ''} changed ${treatmentChanges.length === 1 ? 'row' : 'rows'}`}
                </Button>
              </Box>
            ) : null}
          </>
        ) : null}
      </Box>

      <Box
        id="establishment"
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, md: 2.5 } }}
      >
        <Typography variant="subtitle1">Establishment configuration</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Keep the school registration, declared headcount, and coverage dates current.
        </Typography>

        {Object.keys(errors).length ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Correct the following fields</Typography>
            <Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>
              {Object.values(errors).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </Box>
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              inputRef={registrationRef}
              disabled={!canEdit}
              label="ESIC registration number"
              value={establishmentForm.registrationNumber}
              error={Boolean(errors.registrationNumber)}
              helperText={errors.registrationNumber}
              onChange={(event) =>
                setEstablishmentForm((current) => ({
                  ...current,
                  registrationNumber: event.target.value,
                }))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="number"
              inputRef={headcountRef}
              disabled={!canEdit}
              label="Declared establishment headcount"
              value={establishmentForm.employeeCount}
              error={Boolean(errors.employeeCount)}
              helperText={
                errors.employeeCount ||
                `The current establishment threshold is ${rule?.establishmentThreshold ?? 10}.`
              }
              slotProps={{ htmlInput: { min: 0, step: 1, inputMode: 'numeric' } }}
              onChange={(event) =>
                setEstablishmentForm((current) => ({
                  ...current,
                  employeeCount: event.target.value === '' ? '' : Number(event.target.value),
                }))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              inputRef={coveredSinceRef}
              disabled={!canEdit}
              label="Covered since"
              value={establishmentForm.coveredSince}
              error={Boolean(errors.coveredSince)}
              helperText={errors.coveredSince}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(event) =>
                setEstablishmentForm((current) => ({
                  ...current,
                  coveredSince: event.target.value,
                }))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              inputRef={benefitsFromRef}
              disabled={!canEdit}
              label="Calculate ESI from"
              value={establishmentForm.benefitsActiveFrom}
              error={Boolean(errors.benefitsActiveFrom)}
              helperText={errors.benefitsActiveFrom}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(event) =>
                setEstablishmentForm((current) => ({
                  ...current,
                  benefitsActiveFrom: event.target.value,
                }))
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              disabled={!canEdit}
              label="Evidence reference"
              value={establishmentForm.evidenceReference}
              helperText="Registration certificate, portal reference, or controlled document location."
              onChange={(event) =>
                setEstablishmentForm((current) => ({
                  ...current,
                  evidenceReference: event.target.value,
                }))
              }
            />
          </Grid>
        </Grid>
        {canEdit ? (
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              startIcon={<Save />}
              disabled={!establishmentDirty || configureState.isLoading}
              onClick={saveEstablishment}
            >
              {configureState.isLoading ? 'Saving…' : 'Save establishment'}
            </Button>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
