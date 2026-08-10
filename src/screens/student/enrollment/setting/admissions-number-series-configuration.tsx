'use client';

import { useState } from 'react';
import { Add, Send, Publish } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import { AdmissionCrmIdentifierType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { AdmissionCrmNumberSeriesStatus } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  useGetAdmissionCrmNumberSeriesQuery,
  useCreateAdmissionCrmNumberSeriesMutation,
  useSubmitAdmissionCrmNumberSeriesMutation,
  usePublishAdmissionCrmNumberSeriesMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import {
  useGetAdmissionCrmPlacementOptionsQuery,
  useGetAdmissionCrmIdentifierGovernanceQuery,
} from 'src/redux/student/admissions-crm/final-admission-api';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { EnrollmentSettingsEditorDrawer } from './enrollment-settings-editor-drawer';
import { validateIdentifierSeriesStep } from './admissions-number-series-model';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

const today = () => new Date().toISOString().slice(0, 10);
const nextYear = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};
const iso = (value: string) => new Date(`${value}T00:00:00Z`).toISOString();
const labels = ['Draft', 'Approval pending', 'Published', 'Retired'];

const numberSeriesDefaults = {
  code: 'GR-MAIN',
  name: 'General Register Number',
  prefix: 'GR-',
  suffix: '',
  padding: '6',
  startingSequence: '1',
  maximumSequence: '',
  effectiveFrom: today(),
  effectiveUntil: nextYear(),
  placementKey: '',
};

export default function AdmissionsNumberSeriesConfiguration() {
  const { academicYearId } = useEnrollmentWorkspace();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorStep, setEditorStep] = useState(0);
  const [code, setCode] = useState(numberSeriesDefaults.code);
  const [name, setName] = useState(numberSeriesDefaults.name);
  const [prefix, setPrefix] = useState(numberSeriesDefaults.prefix);
  const [suffix, setSuffix] = useState(numberSeriesDefaults.suffix);
  const [padding, setPadding] = useState(numberSeriesDefaults.padding);
  const [startingSequence, setStartingSequence] = useState(numberSeriesDefaults.startingSequence);
  const [maximumSequence, setMaximumSequence] = useState(numberSeriesDefaults.maximumSequence);
  const [effectiveFrom, setEffectiveFrom] = useState(numberSeriesDefaults.effectiveFrom);
  const [effectiveUntil, setEffectiveUntil] = useState(numberSeriesDefaults.effectiveUntil);
  const [placementKey, setPlacementKey] = useState(numberSeriesDefaults.placementKey);
  const [auditSeriesId, setAuditSeriesId] = useState('');
  const series = useGetAdmissionCrmNumberSeriesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const placements = useGetAdmissionCrmPlacementOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const governance = useGetAdmissionCrmIdentifierGovernanceQuery(
    { academicYearId: academicYearId || '', seriesId: auditSeriesId },
    { skip: !academicYearId || !auditSeriesId }
  );
  const [create, createState] = useCreateAdmissionCrmNumberSeriesMutation();
  const [submit, submitState] = useSubmitAdmissionCrmNumberSeriesMutation();
  const [publish, publishState] = usePublishAdmissionCrmNumberSeriesMutation();
  const selected = placements.data?.find(
    (x) => `${x.educationBoardId}:${x.academicMediumId}:${x.standardId}` === placementKey
  );

  const resetEditor = () => {
    setCode(numberSeriesDefaults.code);
    setName(numberSeriesDefaults.name);
    setPrefix(numberSeriesDefaults.prefix);
    setSuffix(numberSeriesDefaults.suffix);
    setPadding(numberSeriesDefaults.padding);
    setStartingSequence(numberSeriesDefaults.startingSequence);
    setMaximumSequence(numberSeriesDefaults.maximumSequence);
    setEffectiveFrom(numberSeriesDefaults.effectiveFrom);
    setEffectiveUntil(numberSeriesDefaults.effectiveUntil);
    setPlacementKey(numberSeriesDefaults.placementKey);
  };

  const closeEditor = () => {
    resetEditor();
    setEditorStep(0);
    setEditorOpen(false);
  };

  const isEditorDirty =
    editorOpen &&
    (code !== numberSeriesDefaults.code ||
      name !== numberSeriesDefaults.name ||
      prefix !== numberSeriesDefaults.prefix ||
      suffix !== numberSeriesDefaults.suffix ||
      padding !== numberSeriesDefaults.padding ||
      startingSequence !== numberSeriesDefaults.startingSequence ||
      maximumSequence !== numberSeriesDefaults.maximumSequence ||
      effectiveFrom !== numberSeriesDefaults.effectiveFrom ||
      effectiveUntil !== numberSeriesDefaults.effectiveUntil ||
      placementKey !== numberSeriesDefaults.placementKey);

  useEnrollmentSettingsDirtyState({
    source: 'number-series-editor',
    dirty: isEditorDirty,
    onDiscard: closeEditor,
  });

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message });
      return true;
    } catch (error) {
      const data =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { errorCode?: string } }).data
          : undefined;
      shikshaMitraToast.error({ message: data?.errorCode || 'Number series action failed.' });
      return false;
    }
  };
  const save = async () => {
    if (!academicYearId) return;
    const values = {
      code,
      name,
      padding,
      startingSequence,
      maximumSequence,
      effectiveFrom,
      effectiveUntil,
    };
    const issue = [0, 1, 2]
      .map((step) => ({ step, message: validateIdentifierSeriesStep(values, step) }))
      .find(({ message }) => message);
    if (issue?.message) {
      setEditorStep(issue.step);
      shikshaMitraToast.error({ message: issue.message });
      return;
    }
    const created = await run(
      () =>
        create({
          academicYearId,
          body: {
            code: code.trim().toUpperCase(),
            name: name.trim(),
            identifierType: AdmissionCrmIdentifierType.GrNumber,
            educationBoardId: selected?.educationBoardId || null,
            academicMediumId: selected?.academicMediumId || null,
            standardId: selected?.standardId || null,
            prefix,
            suffix,
            padding: Number(padding),
            startingSequence: Number(startingSequence),
            maximumSequence: maximumSequence ? Number(maximumSequence) : null,
            effectiveFrom: iso(effectiveFrom),
            effectiveUntil: effectiveUntil ? iso(effectiveUntil) : null,
          },
        }).unwrap(),
      'Number series draft created.'
    );
    if (created) closeEditor();
  };

  const previewNumber = `${prefix}${String(Number(startingSequence) || 0).padStart(
    Math.max(1, Number(padding) || 1),
    '0'
  )}${suffix}`;

  const goToEditorStep = (nextStep: number) => {
    if (nextStep > editorStep) {
      const message = validateIdentifierSeriesStep(
        {
          code,
          name,
          padding,
          startingSequence,
          maximumSequence,
          effectiveFrom,
          effectiveUntil,
        },
        editorStep
      );
      if (message) {
        shikshaMitraToast.error({ message });
        return;
      }
    }
    setEditorStep(nextStep);
  };

  const scopeOptions = Array.from(
    new Map(
      (placements.data || []).map((x) => [
        `${x.educationBoardId}:${x.academicMediumId}:${x.standardId}`,
        x,
      ])
    ).entries()
  );

  if (series.isError || placements.isError) {
    return (
      <Alert
        severity="error"
        action={
          <LoadingButton
            size="small"
            color="inherit"
            onClick={() => {
              series.refetch();
              placements.refetch();
            }}
          >
            Retry
          </LoadingButton>
        }
      >
        Number series configuration could not be loaded.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography component="h2" variant="subtitle1">
              Permanent Student Identifiers
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textWrap: 'pretty' }}>
              Create controlled, non-overlapping GR number series and publish them before student
              activation.
            </Typography>
          </Box>
          <LoadingButton
            variant="contained"
            startIcon={<Add />}
            disabled={!academicYearId}
            onClick={() => {
              resetEditor();
              setEditorStep(0);
              setEditorOpen(true);
            }}
          >
            New Identifier Series
          </LoadingButton>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Series register</Typography>
          {series.isFetching && <LinearProgress />}
          {!series.isFetching && !series.data?.length && (
            <Alert severity="info">No activation number series are configured.</Alert>
          )}
          {(series.data || []).map((item) => (
            <Stack
              key={item.id}
              direction={{ xs: 'column', md: 'row' }}
              gap={1}
              justifyContent="space-between"
              alignItems={{ md: 'center' }}
              sx={{ pt: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
            >
              <Box>
                <Typography variant="body2">
                  {item.name}{' '}
                  <Typography component="span" variant="caption">
                    {item.code}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Range starts {item.startingSequence}; next {item.nextPreview}
                </Typography>
              </Box>
              <Stack direction="row" gap={1}>
                <Chip
                  size="small"
                  label={labels[item.status]}
                  color={
                    item.status === AdmissionCrmNumberSeriesStatus.Published ? 'success' : 'default'
                  }
                />
                <LoadingButton size="small" onClick={() => setAuditSeriesId(item.id)}>
                  Audit
                </LoadingButton>
                {item.status === 0 && (
                  <LoadingButton
                    size="small"
                    startIcon={<Send />}
                    loading={submitState.isLoading}
                    onClick={() =>
                      run(() => submit({ seriesId: item.id }).unwrap(), 'Series submitted.')
                    }
                  >
                    Submit
                  </LoadingButton>
                )}
                {item.status === 1 && (
                  <LoadingButton
                    size="small"
                    startIcon={<Publish />}
                    loading={publishState.isLoading}
                    onClick={() =>
                      run(() => publish({ seriesId: item.id }).unwrap(), 'Series published.')
                    }
                  >
                    Publish
                  </LoadingButton>
                )}
              </Stack>
            </Stack>
          ))}
          {governance.isFetching && <LinearProgress />}
          {governance.isError && (
            <Alert
              severity="error"
              action={
                <LoadingButton size="small" color="inherit" onClick={() => governance.refetch()}>
                  Retry
                </LoadingButton>
              }
            >
              Identifier audit details could not be loaded.
            </Alert>
          )}
          {governance.data && (
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip size="small" label={`Allocated ${governance.data.allocatedCount}`} />
              <Chip size="small" label={`Committed ${governance.data.committedCount}`} />
              <Chip size="small" label={`Manual ${governance.data.manualCount}`} />
              <Chip size="small" label={`Voided ${governance.data.voidedCount}`} />
              <Chip
                size="small"
                color={governance.data.gapSequences.length ? 'warning' : 'success'}
                label={
                  governance.data.gapSequences.length
                    ? `Gaps: ${governance.data.gapSequences.join(', ')}${governance.data.gapReportTruncated ? ' \u2026' : ''}`
                    : 'No sequence gaps'
                }
              />
              {governance.data.isExhausted && (
                <Chip size="small" color="error" label="Series exhausted" />
              )}
            </Stack>
          )}
        </Stack>
      </Paper>

      <EnrollmentSettingsEditorDrawer
        open={editorOpen}
        onClose={closeEditor}
        title="New Permanent Identifier Series"
        description="Define the academic scope, number format, and effective period before submitting the series for approval."
        steps={[
          { value: 0, label: 'Identity & Scope' },
          { value: 1, label: 'Format & Preview' },
          { value: 2, label: 'Effective Period' },
        ]}
        activeStep={editorStep}
        onStepChange={goToEditorStep}
        busy={createState.isLoading}
        width={720}
        actions={
          <>
            <LoadingButton disabled={createState.isLoading} onClick={closeEditor}>
              Cancel
            </LoadingButton>
            {editorStep > 0 ? (
              <LoadingButton
                disabled={createState.isLoading}
                onClick={() => setEditorStep((current) => Math.max(0, current - 1))}
              >
                Back
              </LoadingButton>
            ) : null}
            {editorStep < 2 ? (
              <LoadingButton
                variant="contained"
                disabled={createState.isLoading}
                onClick={() => goToEditorStep(editorStep + 1)}
              >
                Continue
              </LoadingButton>
            ) : (
              <LoadingButton
                variant="contained"
                startIcon={<Add />}
                loading={createState.isLoading}
                onClick={save}
              >
                Create Draft Series
              </LoadingButton>
            )}
          </>
        }
      >
        {editorStep === 0 ? (
          <Stack spacing={1.5}>
            <Alert severity="info">
              Use one series for the whole admission year or narrow it to a board, medium, and
              standard combination.
            </Alert>
            <TextField
              name="identifierSeriesCode"
              size="small"
              label="Series code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              helperText="Internal code used in audit and approval records"
            />
            <TextField
              name="identifierSeriesName"
              size="small"
              label="Series name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              helperText="School-facing name shown to authorized staff"
            />
            <TextField
              name="identifierSeriesScope"
              size="small"
              select
              label="Academic scope"
              value={placementKey}
              onChange={(event) => setPlacementKey(event.target.value)}
            >
              <MenuItem value="">Whole admission year</MenuItem>
              {scopeOptions.map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value.boardName} / {value.mediumName} / {value.standardName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        ) : null}

        {editorStep === 1 ? (
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                name="identifierPrefix"
                size="small"
                label="Prefix"
                value={prefix}
                onChange={(event) => setPrefix(event.target.value.toUpperCase())}
              />
              <TextField
                name="identifierSuffix"
                size="small"
                label="Suffix"
                value={suffix}
                onChange={(event) => setSuffix(event.target.value.toUpperCase())}
              />
              <TextField
                name="identifierPadding"
                size="small"
                type="number"
                label="Number width"
                value={padding}
                onChange={(event) => setPadding(event.target.value)}
                inputProps={{ min: 1, max: 12, inputMode: 'numeric' }}
              />
              <TextField
                name="identifierStartingSequence"
                size="small"
                type="number"
                label="Starts at"
                value={startingSequence}
                onChange={(event) => setStartingSequence(event.target.value)}
                inputProps={{ min: 1, inputMode: 'numeric' }}
              />
              <TextField
                name="identifierMaximumSequence"
                size="small"
                type="number"
                label="Maximum (optional)"
                value={maximumSequence}
                onChange={(event) => setMaximumSequence(event.target.value)}
                inputProps={{ min: 1, inputMode: 'numeric' }}
              />
            </Box>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: 'action.hover' }}>
              <Typography variant="overline" color="text.secondary">
                First identifier preview
              </Typography>
              <Typography
                variant="h4"
                sx={{ mt: 0.25, fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}
              >
                {previewNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Future identifiers increment only after a successful, auditable allocation.
              </Typography>
            </Paper>
          </Stack>
        ) : null}

        {editorStep === 2 ? (
          <Stack spacing={2}>
            <Alert severity="warning">
              Effective periods and academic scopes must not overlap another published series.
            </Alert>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                name="identifierEffectiveFrom"
                size="small"
                type="date"
                label="Effective from"
                value={effectiveFrom}
                onChange={(event) => setEffectiveFrom(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="identifierEffectiveUntil"
                size="small"
                type="date"
                label="Effective until"
                value={effectiveUntil}
                onChange={(event) => setEffectiveUntil(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Review</Typography>
                <Typography variant="body2">
                  {name} ({code.toUpperCase()})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  First number: {previewNumber} · Scope:{' '}
                  {selected
                    ? `${selected.boardName} / ${selected.mediumName} / ${selected.standardName}`
                    : 'Whole admission year'}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </EnrollmentSettingsEditorDrawer>
    </Stack>
  );
}
