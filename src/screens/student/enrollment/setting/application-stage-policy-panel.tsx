'use client';

import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Switch,
  Tooltip,
  Divider,
  Typography,
  IconButton,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import type {
  AdmissionCrmApplicationStagePolicyDto,
  AdmissionCrmApplicationStagePolicyItemDto,
  AdmissionCrmApplicationStagePolicyImpactDto,
  UpdateAdmissionCrmApplicationStagePolicyDto,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  useGetAdmissionCrmApplicationStagePolicyQuery,
  useUpdateAdmissionCrmApplicationStagePolicyMutation,
  usePreviewAdmissionCrmApplicationStagePolicyMutation,
} from 'src/redux/student/admissions-crm/final-admission-api';

const toUpdate = (
  stages: AdmissionCrmApplicationStagePolicyItemDto[],
  expectedImpactFingerprint?: string | null
): UpdateAdmissionCrmApplicationStagePolicyDto => ({
  stages: stages.map((stage, index) => ({
    stageKey: stage.stageKey,
    displayOrder: index + 1,
    isEnabled: stage.isEnabled,
  })),
  expectedImpactFingerprint,
});

const normalizeStages = (policy?: AdmissionCrmApplicationStagePolicyDto) =>
  [...(policy?.stages ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

export function ApplicationStagePolicyPanel({ academicYearId }: { academicYearId: string }) {
  const query = useGetAdmissionCrmApplicationStagePolicyQuery(
    { academicYearId },
    { skip: !academicYearId }
  );
  const [previewPolicy, previewState] = usePreviewAdmissionCrmApplicationStagePolicyMutation();
  const [updatePolicy, updateState] = useUpdateAdmissionCrmApplicationStagePolicyMutation();
  const [stages, setStages] = useState<AdmissionCrmApplicationStagePolicyItemDto[]>([]);
  const [impact, setImpact] = useState<AdmissionCrmApplicationStagePolicyImpactDto | null>(null);

  useEffect(() => {
    setStages(normalizeStages(query.data));
    setImpact(null);
  }, [query.data]);

  const original = useMemo(() => normalizeStages(query.data), [query.data]);
  const hasChanges = useMemo(() => {
    const current = toUpdate(stages).stages;
    const baseline = toUpdate(original).stages;
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [original, stages]);

  const moveStage = (stageIndex: number, direction: -1 | 1) => {
    setStages((current) => {
      const nextIndex = stageIndex + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[stageIndex], next[nextIndex]] = [next[nextIndex], next[stageIndex]];
      return next.map((stage, index) => ({ ...stage, displayOrder: index + 1 }));
    });
    setImpact(null);
  };

  const toggleStage = (stageIndex: number) => {
    setStages((current) =>
      current.map((stage, index) =>
        index === stageIndex ? { ...stage, isEnabled: !stage.isEnabled } : stage
      )
    );
    setImpact(null);
  };

  const handlePreview = async () => {
    const result = await previewPolicy({
      academicYearId,
      body: toUpdate(stages),
    }).unwrap();
    setImpact(result);
    return result;
  };

  const handleSave = async () => {
    const latestImpact = impact ?? (await handlePreview());
    await updatePolicy({
      academicYearId,
      body: toUpdate(stages, latestImpact.impactFingerprint),
    }).unwrap();
  };

  if (query.isFetching && !query.data) {
    return <LinearProgress aria-label="Loading application stage policy" />;
  }

  if (query.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Application-stage policy could not be loaded.
      </Alert>
    );
  }

  if (!query.data) return null;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="text.secondary">
              Cycle-owned journey policy
            </Typography>
            <Typography variant="h6">Application Stages</Typography>
            <Typography variant="body2" color="text.secondary">
              Configure the readable admission journey for this admission year using fixed safe
              stage keys.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              color={query.data.entranceExamRequired ? 'info' : 'default'}
              label={
                query.data.entranceExamRequired ? 'Entrance exam required' : 'No entrance exam'
              }
            />
            <Chip
              size="small"
              color={query.data.journeyLocked ? 'warning' : 'success'}
              label={query.data.journeyLocked ? 'Journey locked' : 'Editable'}
            />
            <Chip size="small" label={`${query.data.applicantCount} applicants`} />
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          {stages.map((stage, index) => (
            <Paper key={stage.stageKey} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === 0 || query.data.journeyLocked}
                        onClick={() => moveStage(index, -1)}
                        aria-label={`Move ${stage.displayName} up`}
                      >
                        <Iconify icon="mdi:chevron-up" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === stages.length - 1 || query.data.journeyLocked}
                        onClick={() => moveStage(index, 1)}
                        aria-label={`Move ${stage.displayName} down`}
                      >
                        <Iconify icon="mdi:chevron-down" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="subtitle2">{stage.displayName}</Typography>
                    <Chip
                      size="small"
                      color={stage.isEnabled ? 'success' : 'default'}
                      label={stage.isEnabled ? 'Enabled' : 'Hidden'}
                    />
                    {stage.isOperationallyBacked ? (
                      <Chip size="small" color="info" label="CRM-backed" />
                    ) : (
                      <Chip size="small" variant="outlined" label="Policy-only" />
                    )}
                    {stage.isExamStage ? <Chip size="small" label="Exam" /> : null}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {stage.readinessNote}
                  </Typography>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={stage.isEnabled}
                      disabled={stage.isSystemLocked || query.data.journeyLocked}
                      onChange={() => toggleStage(index)}
                    />
                  }
                  label="Enabled"
                  sx={{ m: 0 }}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>

        {impact ? (
          <Alert severity={impact.warnings.length > 0 ? 'warning' : 'info'}>
            Impact preview ready for {impact.applicantCount} applicants.
            {impact.warnings.length > 0 ? ` ${impact.warnings.join(' ')}` : ''}
          </Alert>
        ) : null}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            disabled={!hasChanges || previewState.isLoading || query.data.journeyLocked}
            onClick={handlePreview}
            startIcon={<Iconify icon="mdi:eye-outline" />}
          >
            Preview Impact
          </Button>
          <Button
            variant="contained"
            disabled={
              !hasChanges ||
              updateState.isLoading ||
              previewState.isLoading ||
              query.data.journeyLocked
            }
            onClick={handleSave}
            startIcon={<Iconify icon="mdi:content-save-outline" />}
          >
            Save Stage Policy
          </Button>
        </Stack>

        {query.data.journeyLocked ? (
          <Alert severity="warning">This admission journey is locked and cannot be edited.</Alert>
        ) : null}
      </Stack>
    </Paper>
  );
}
