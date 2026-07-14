'use client';

import { useState } from 'react';
import { Add, Send, Publish } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Box, Chip, Alert, Paper, Stack, MenuItem, TextField, Typography } from '@mui/material';
import {
  AdmissionCrmRouteType,
  AdmissionCrmRouteDefinitionStatus,
  useGetAdmissionCrmRouteDefinitionsQuery,
  useCreateAdmissionCrmRouteDefinitionMutation,
  useSubmitAdmissionCrmRouteDefinitionMutation,
  usePublishAdmissionCrmRouteDefinitionMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

const today = () => new Date().toISOString().slice(0, 10);
const nextYear = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};
const iso = (v: string) => new Date(`${v}T00:00:00Z`).toISOString();
const routeNames = Object.entries(AdmissionCrmRouteType).filter(([key]) =>
  Number.isNaN(Number(key))
) as Array<[string, number]>;

const routeDefaults = {
  code: '',
  name: '',
  routeType: AdmissionCrmRouteType.Fresh,
  evidence: '',
  seatPoolCode: '',
  feePolicyCode: '',
  priority: '0',
};

export default function AdmissionsRouteConfiguration() {
  const { academicYearId } = useEnrollmentWorkspace();
  const [code, setCode] = useState(routeDefaults.code);
  const [name, setName] = useState(routeDefaults.name);
  const [routeType, setRouteType] = useState(routeDefaults.routeType);
  const [evidence, setEvidence] = useState(routeDefaults.evidence);
  const [seatPoolCode, setSeatPoolCode] = useState(routeDefaults.seatPoolCode);
  const [feePolicyCode, setFeePolicyCode] = useState(routeDefaults.feePolicyCode);
  const [priority, setPriority] = useState(routeDefaults.priority);
  const definitions = useGetAdmissionCrmRouteDefinitionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const [create, createState] = useCreateAdmissionCrmRouteDefinitionMutation();
  const [submit, submitState] = useSubmitAdmissionCrmRouteDefinitionMutation();
  const [publish, publishState] = usePublishAdmissionCrmRouteDefinitionMutation();
  const resetEditor = () => {
    setCode(routeDefaults.code);
    setName(routeDefaults.name);
    setRouteType(routeDefaults.routeType);
    setEvidence(routeDefaults.evidence);
    setSeatPoolCode(routeDefaults.seatPoolCode);
    setFeePolicyCode(routeDefaults.feePolicyCode);
    setPriority(routeDefaults.priority);
  };
  const isEditorDirty =
    code !== routeDefaults.code ||
    name !== routeDefaults.name ||
    routeType !== routeDefaults.routeType ||
    evidence !== routeDefaults.evidence ||
    seatPoolCode !== routeDefaults.seatPoolCode ||
    feePolicyCode !== routeDefaults.feePolicyCode ||
    priority !== routeDefaults.priority;

  useEnrollmentSettingsDirtyState({
    source: 'admission-route-editor',
    dirty: isEditorDirty,
    onDiscard: resetEditor,
  });

  const run = async (fn: () => Promise<unknown>, message: string) => {
    try {
      await fn();
      shikshaMitraToast.success({ message });
      return true;
    } catch (error) {
      const data =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { errorCode?: string } }).data
          : undefined;
      shikshaMitraToast.error({ message: data?.errorCode || 'Route action failed.' });
      return false;
    }
  };
  const save = async () => {
    if (!academicYearId || !code.trim() || !name.trim()) return;
    const created = await run(
      () =>
        create({
          academicYearId,
          body: {
            code: code.trim().toUpperCase(),
            name: name.trim(),
            routeType,
            configuration: {
              requiresPolicyEvaluation: true,
              requiresDistinctApproval: true,
              allowsExamWaiver: routeType === AdmissionCrmRouteType.Direct,
              allowsOfferWaiver: routeType === AdmissionCrmRouteType.Direct,
              seatPoolCode: seatPoolCode || null,
              feePolicyCode: feePolicyCode || null,
              requiredEvidenceCodes: evidence
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
              priorityWeight: Number(priority),
              decisionSlaHours: 48,
            },
            effectiveFrom: iso(today()),
            effectiveUntil: iso(nextYear()),
          },
        }).unwrap(),
      'Admission route draft created.'
    );
    if (created) resetEditor();
  };

  if (definitions.isError) {
    return (
      <Alert
        severity="error"
        action={
          <LoadingButton size="small" color="inherit" onClick={() => definitions.refetch()}>
            Retry
          </LoadingButton>
        }
      >
        Admission routes could not be loaded.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25}>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="subtitle2">Admission route definitions</Typography>
            <Typography variant="caption" color="text.secondary">
              Configure route-specific evidence, policy, seat, fee, and approval behavior without
              bypassing shared gates.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1,
            }}
          >
            <TextField
              size="small"
              fullWidth
              label="Route code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Route name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ gridColumn: { lg: 'span 2' } }}
            />
            <TextField
              size="small"
              fullWidth
              select
              label="Route type"
              value={routeType}
              onChange={(e) => setRouteType(Number(e.target.value) as AdmissionCrmRouteType)}
            >
              {routeNames.map(([label, value]) => (
                <MenuItem key={label} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              fullWidth
              label="Evidence codes (comma-separated)"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              sx={{ gridColumn: { lg: 'span 2' } }}
            />
            <TextField
              size="small"
              fullWidth
              label="Seat pool code"
              value={seatPoolCode}
              onChange={(e) => setSeatPoolCode(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Fee policy code"
              value={feePolicyCode}
              onChange={(e) => setFeePolicyCode(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Priority weight"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
          </Box>
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
          <Typography variant="subtitle2">Published route catalogue</Typography>
          {!definitions.isFetching && !definitions.data?.length && (
            <Alert severity="info">No admission routes configured.</Alert>
          )}
          {(definitions.data || []).map((item) => (
            <Stack
              key={item.id}
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              gap={1}
              sx={{ pt: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
            >
              <Box>
                <Typography variant="body2">
                  {item.name}{' '}
                  <Typography component="span" variant="caption">
                    {item.code} v{item.version}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {routeNames.find(([, value]) => value === item.routeType)?.[0]} -{' '}
                  {item.configuration.requiredEvidenceCodes.join(', ') || 'No route-only evidence'}
                </Typography>
              </Box>
              <Stack direction="row" gap={0.75}>
                <Chip
                  size="small"
                  label={['Draft', 'Approval pending', 'Published', 'Retired'][item.status]}
                  color={
                    item.status === AdmissionCrmRouteDefinitionStatus.Published
                      ? 'success'
                      : 'default'
                  }
                />
                {item.status === 0 && (
                  <LoadingButton
                    size="small"
                    startIcon={<Send />}
                    loading={submitState.isLoading}
                    onClick={() =>
                      run(() => submit({ definitionId: item.id }).unwrap(), 'Route submitted.')
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
                      run(() => publish({ definitionId: item.id }).unwrap(), 'Route published.')
                    }
                  >
                    Publish
                  </LoadingButton>
                )}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
