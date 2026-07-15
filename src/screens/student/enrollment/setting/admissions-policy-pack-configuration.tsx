'use client';

import type {
  AdmissionCrmPolicyRuleDto,
  AdmissionCrmPolicySourceDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Add, Send, Gavel, Delete, Publish, Approval, LibraryAdd } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmPolicyRuleType,
  AdmissionCrmPolicyPackStatus,
  AdmissionCrmPolicyRuleSeverity,
  useGetAdmissionCrmPolicyPacksQuery,
  useAdoptAdmissionCrmPolicyPackMutation,
  useGetAdmissionCrmPolicyAdoptionsQuery,
  useCreateAdmissionCrmPolicyPackMutation,
  useSubmitAdmissionCrmPolicyPackMutation,
  useApproveAdmissionCrmPolicyPackMutation,
  usePublishAdmissionCrmPolicyPackMutation,
  useInstallAdmissionCrmOfficialPolicyBaselinesMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

const today = () => new Date().toISOString().slice(0, 10);
const nextYear = () => {
  const value = new Date();
  value.setFullYear(value.getFullYear() + 1);
  return value.toISOString().slice(0, 10);
};
const toIso = (value: string) => new Date(`${value}T00:00:00Z`).toISOString();

const newSource = (): AdmissionCrmPolicySourceDto => ({
  authority: '',
  title: '',
  url: '',
  publishedOrEffectiveAt: toIso(today()),
  verifiedAt: new Date().toISOString(),
  applicabilityNote: '',
});

const newRule = (): AdmissionCrmPolicyRuleDto => ({
  code: '',
  name: '',
  type: AdmissionCrmPolicyRuleType.DocumentEvidence,
  severity: AdmissionCrmPolicyRuleSeverity.Blocking,
  description: '',
  manualVerificationRequired: true,
  sourceAuthority: '',
  sourceUrl: '',
});

const createPolicyPackDefaults = () => ({
  code: '',
  name: '',
  jurisdiction: 'Gujarat',
  board: 'CBSE',
  effectiveFrom: today(),
  effectiveUntil: nextYear(),
  reviewDueAt: nextYear(),
  sources: [newSource()],
  rules: [newRule()],
});

const statusLabel: Record<AdmissionCrmPolicyPackStatus, string> = {
  [AdmissionCrmPolicyPackStatus.Draft]: 'Draft',
  [AdmissionCrmPolicyPackStatus.ReviewPending]: 'Review pending',
  [AdmissionCrmPolicyPackStatus.Approved]: 'Approved',
  [AdmissionCrmPolicyPackStatus.Published]: 'Published',
  [AdmissionCrmPolicyPackStatus.Superseded]: 'Superseded',
  [AdmissionCrmPolicyPackStatus.Retired]: 'Retired',
};

const readError = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { errorCode?: string; detail?: string } };
    return data?.errorCode || data?.detail || 'Policy action failed.';
  }
  return 'Policy action failed.';
};

export default function AdmissionsPolicyPackConfiguration() {
  const { academicYearId } = useEnrollmentWorkspace();
  const [defaults] = useState(createPolicyPackDefaults);
  const [code, setCode] = useState(defaults.code);
  const [name, setName] = useState(defaults.name);
  const [jurisdiction, setJurisdiction] = useState(defaults.jurisdiction);
  const [board, setBoard] = useState(defaults.board);
  const [effectiveFrom, setEffectiveFrom] = useState(defaults.effectiveFrom);
  const [effectiveUntil, setEffectiveUntil] = useState(defaults.effectiveUntil);
  const [reviewDueAt, setReviewDueAt] = useState(defaults.reviewDueAt);
  const [sources, setSources] = useState<AdmissionCrmPolicySourceDto[]>(defaults.sources);
  const [rules, setRules] = useState<AdmissionCrmPolicyRuleDto[]>(defaults.rules);

  const packs = useGetAdmissionCrmPolicyPacksQuery({ maxResultCount: 200 });
  const adoptions = useGetAdmissionCrmPolicyAdoptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const [createPack, createState] = useCreateAdmissionCrmPolicyPackMutation();
  const [submitPack, submitState] = useSubmitAdmissionCrmPolicyPackMutation();
  const [approvePack, approveState] = useApproveAdmissionCrmPolicyPackMutation();
  const [publishPack, publishState] = usePublishAdmissionCrmPolicyPackMutation();
  const [adoptPack, adoptState] = useAdoptAdmissionCrmPolicyPackMutation();
  const [installBaselines, installBaselineState] =
    useInstallAdmissionCrmOfficialPolicyBaselinesMutation();

  const resetEditor = () => {
    setCode(defaults.code);
    setName(defaults.name);
    setJurisdiction(defaults.jurisdiction);
    setBoard(defaults.board);
    setEffectiveFrom(defaults.effectiveFrom);
    setEffectiveUntil(defaults.effectiveUntil);
    setReviewDueAt(defaults.reviewDueAt);
    setSources(defaults.sources.map((source) => ({ ...source })));
    setRules(defaults.rules.map((rule) => ({ ...rule })));
  };
  const isEditorDirty =
    JSON.stringify({
      code,
      name,
      jurisdiction,
      board,
      effectiveFrom,
      effectiveUntil,
      reviewDueAt,
      sources,
      rules,
    }) !== JSON.stringify(defaults);

  useEnrollmentSettingsDirtyState({
    source: 'policy-pack-editor',
    dirty: isEditorDirty,
    onDiscard: resetEditor,
  });

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message });
      return true;
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
      return false;
    }
  };

  const updateSource = (index: number, values: Partial<AdmissionCrmPolicySourceDto>) =>
    setSources((items) =>
      items.map((item, current) => (current === index ? { ...item, ...values } : item))
    );
  const updateRule = (index: number, values: Partial<AdmissionCrmPolicyRuleDto>) =>
    setRules((items) =>
      items.map((item, current) => (current === index ? { ...item, ...values } : item))
    );

  const save = async () => {
    if (
      !code.trim() ||
      !name.trim() ||
      sources.some((x) => !x.authority || !x.title || !x.url) ||
      rules.some((x) => !x.code || !x.name || !x.sourceUrl)
    ) {
      shikshaMitraToast.error({
        message: 'Complete every source and rule before creating the policy version.',
      });
      return;
    }
    const created = await run(
      () =>
        createPack({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          jurisdiction: jurisdiction.trim(),
          board: board.trim(),
          sources,
          rules,
          effectiveFrom: toIso(effectiveFrom),
          effectiveUntil: effectiveUntil ? toIso(effectiveUntil) : null,
          reviewDueAt: toIso(reviewDueAt),
        }).unwrap(),
      'Policy pack draft created.'
    );
    if (created) resetEditor();
  };

  if (packs.isError || adoptions.isError) {
    return (
      <Alert
        severity="error"
        action={
          <LoadingButton
            size="small"
            color="inherit"
            onClick={() => {
              packs.refetch();
              if (academicYearId) adoptions.refetch();
            }}
          >
            Retry
          </LoadingButton>
        }
      >
        Policy versions could not be loaded.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25}>
      <Alert severity="info">
        Policy packs preserve the exact official sources and rule version used for each decision;
        schools remain responsible for reviewing applicability.
      </Alert>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          gap={1}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle2">Official baseline catalog</Typography>
            <Typography variant="caption" color="text.secondary">
              Install sourced CBSE, Gujarat RTE, Gujarat Board readiness, and APAAR drafts for
              school review.
            </Typography>
          </Box>
          <LoadingButton
            variant="outlined"
            startIcon={<LibraryAdd />}
            loading={installBaselineState.isLoading}
            onClick={() =>
              run(() => installBaselines().unwrap(), 'Official policy baselines checked.')
            }
          >
            Install baselines
          </LoadingButton>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="subtitle2">Governed policy version</Typography>
            <Typography variant="caption" color="text.secondary">
              Create sourced CBSE, Gujarat Board, Gujarat RTE, or school policy defaults.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
            <TextField
              size="small"
              label="Pack code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Pack name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              size="small"
              label="Jurisdiction"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
            <TextField
              size="small"
              label="Board / authority"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
            />
            <TextField
              size="small"
              type="date"
              label="Effective from"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label="Effective until"
              value={effectiveUntil}
              onChange={(e) => setEffectiveUntil(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label="Review due"
              value={reviewDueAt}
              onChange={(e) => setReviewDueAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <Divider />
          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Official sources</Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setSources((x) => [...x, newSource()])}
              >
                Source
              </Button>
            </Stack>
            {sources.map((source, index) => (
              <Stack
                key={`source-${index}`}
                direction={{ xs: 'column', md: 'row' }}
                gap={1}
                alignItems={{ md: 'center' }}
              >
                <TextField
                  size="small"
                  label="Authority"
                  value={source.authority}
                  onChange={(e) => updateSource(index, { authority: e.target.value })}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Source title"
                  value={source.title}
                  onChange={(e) => updateSource(index, { title: e.target.value })}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Official HTTPS URL"
                  value={source.url}
                  onChange={(e) => updateSource(index, { url: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Applicability note"
                  value={source.applicabilityNote}
                  onChange={(e) => updateSource(index, { applicabilityNote: e.target.value })}
                />
                <Tooltip title="Remove source">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Remove policy source ${index + 1}`}
                      disabled={sources.length === 1}
                      onClick={() => setSources((x) => x.filter((_, i) => i !== index))}
                    >
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Rules</Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setRules((x) => [...x, newRule()])}
              >
                Rule
              </Button>
            </Stack>
            {rules.map((rule, index) => (
              <Paper key={`rule-${index}`} variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <TextField
                      size="small"
                      label="Rule code"
                      value={rule.code}
                      onChange={(e) => updateRule(index, { code: e.target.value.toUpperCase() })}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      label="Rule name"
                      value={rule.name}
                      onChange={(e) => updateRule(index, { name: e.target.value })}
                    />
                    <TextField
                      size="small"
                      select
                      label="Type"
                      value={rule.type}
                      onChange={(e) =>
                        updateRule(index, {
                          type: Number(e.target.value) as AdmissionCrmPolicyRuleType,
                        })
                      }
                      sx={{ minWidth: 190 }}
                    >
                      {Object.entries(AdmissionCrmPolicyRuleType)
                        .filter(([k]) => Number.isNaN(Number(k)))
                        .map(([label, value]) => (
                          <MenuItem key={label} value={value as number}>
                            {label}
                          </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                      size="small"
                      select
                      label="Severity"
                      value={rule.severity}
                      onChange={(e) =>
                        updateRule(index, {
                          severity: Number(e.target.value) as AdmissionCrmPolicyRuleSeverity,
                        })
                      }
                      sx={{ minWidth: 160 }}
                    >
                      <MenuItem value={0}>Information</MenuItem>
                      <MenuItem value={1}>Warning</MenuItem>
                      <MenuItem value={2}>Blocking</MenuItem>
                      <MenuItem value={3}>Approval required</MenuItem>
                    </TextField>
                    <Tooltip title="Remove rule">
                      <span>
                        <IconButton
                          size="small"
                          aria-label={`Remove policy rule ${rule.name || index + 1}`}
                          disabled={rules.length === 1}
                          onClick={() => setRules((x) => x.filter((_, i) => i !== index))}
                        >
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Description"
                      value={rule.description}
                      onChange={(e) => updateRule(index, { description: e.target.value })}
                    />
                    <TextField
                      size="small"
                      label="Class"
                      value={rule.desiredClass || ''}
                      onChange={(e) => updateRule(index, { desiredClass: e.target.value || null })}
                    />
                    <TextField
                      size="small"
                      type="date"
                      label="Age cutoff"
                      value={rule.ageCutoffDate?.slice(0, 10) || ''}
                      onChange={(e) =>
                        updateRule(index, {
                          ageCutoffDate: e.target.value ? toIso(e.target.value) : null,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Minimum age"
                      value={rule.minimumAgeYears ?? ''}
                      onChange={(e) =>
                        updateRule(index, {
                          minimumAgeYears: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                    <TextField
                      size="small"
                      label="Evidence code"
                      value={rule.requiredEvidenceCode || ''}
                      onChange={(e) =>
                        updateRule(index, { requiredEvidenceCode: e.target.value || null })
                      }
                    />
                    <TextField
                      size="small"
                      select
                      label="Source"
                      value={rule.sourceUrl}
                      onChange={(e) => {
                        const source = sources.find((x) => x.url === e.target.value);
                        updateRule(index, {
                          sourceUrl: e.target.value,
                          sourceAuthority: source?.authority || '',
                        });
                      }}
                      sx={{ minWidth: 220 }}
                    >
                      {sources
                        .filter((x) => x.url)
                        .map((x) => (
                          <MenuItem key={x.url} value={x.url}>
                            {x.authority || x.title}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
          <LoadingButton
            variant="contained"
            startIcon={<Add />}
            loading={createState.isLoading}
            onClick={save}
            sx={{ alignSelf: 'flex-start' }}
          >
            Create draft
          </LoadingButton>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2">Policy versions and cycle adoption</Typography>
            <Chip size="small" label={`${packs.data?.totalCount || 0} version(s)`} />
          </Stack>
          {(packs.isFetching || adoptions.isFetching) && <LinearProgress />}
          {!packs.isFetching && !packs.data?.items.length && (
            <Alert severity="info">No policy packs are configured.</Alert>
          )}
          {(packs.data?.items || []).map((pack) => {
            const adopted = adoptions.data?.some((x) => x.policyPackId === pack.id && x.isActive);
            return (
              <Stack
                key={pack.id}
                direction={{ xs: 'column', md: 'row' }}
                gap={1}
                alignItems={{ md: 'center' }}
                justifyContent="space-between"
                sx={{ py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
              >
                <Box>
                  <Typography variant="body2">
                    {pack.name}{' '}
                    <Typography component="span" variant="caption">
                      {pack.code} v{pack.version}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="caption"
                    color={pack.sourceReviewOverdue ? 'error.main' : 'text.secondary'}
                  >
                    {pack.jurisdiction} - {pack.board} - {pack.rules.length} rules - review{' '}
                    {new Date(pack.reviewDueAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Stack direction="row" gap={0.75} alignItems="center">
                  <Chip
                    size="small"
                    label={statusLabel[pack.status]}
                    color={
                      pack.status === AdmissionCrmPolicyPackStatus.Published ? 'success' : 'default'
                    }
                  />
                  {pack.status === 0 && (
                    <LoadingButton
                      size="small"
                      startIcon={<Send />}
                      loading={submitState.isLoading}
                      onClick={() =>
                        run(
                          () => submitPack({ policyPackId: pack.id }).unwrap(),
                          'Policy submitted for review.'
                        )
                      }
                    >
                      Submit
                    </LoadingButton>
                  )}
                  {pack.status === 1 && (
                    <LoadingButton
                      size="small"
                      startIcon={<Approval />}
                      loading={approveState.isLoading}
                      onClick={() =>
                        run(
                          () => approvePack({ policyPackId: pack.id }).unwrap(),
                          'Policy approved.'
                        )
                      }
                    >
                      Approve
                    </LoadingButton>
                  )}
                  {pack.status === 2 && (
                    <LoadingButton
                      size="small"
                      startIcon={<Publish />}
                      loading={publishState.isLoading}
                      onClick={() =>
                        run(
                          () => publishPack({ policyPackId: pack.id }).unwrap(),
                          'Policy published.'
                        )
                      }
                    >
                      Publish
                    </LoadingButton>
                  )}
                  {pack.status === 3 && !adopted && academicYearId && (
                    <LoadingButton
                      size="small"
                      startIcon={<Gavel />}
                      loading={adoptState.isLoading}
                      onClick={() =>
                        run(
                          () =>
                            adoptPack({
                              academicYearId,
                              policyPackId: pack.id,
                              body: {
                                applicability: { board: pack.board },
                                overrides: [],
                                effectiveFrom: pack.effectiveFrom,
                                effectiveUntil: pack.effectiveUntil,
                              },
                            }).unwrap(),
                          'Policy adopted for this cycle.'
                        )
                      }
                    >
                      Adopt
                    </LoadingButton>
                  )}
                  {adopted && <Chip size="small" color="primary" label="Cycle active" />}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Paper>
    </Stack>
  );
}
