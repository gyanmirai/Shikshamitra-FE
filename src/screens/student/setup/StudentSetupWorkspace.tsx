'use client';

import type { GrantedPermission } from 'src/utils/permissions';
import type { StudentSetupScope, StudentSetupState } from 'src/redux/student/setup/types';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomSelect from 'src/components/custom-select';
import { SetupFlowShell } from 'src/components/setup-flow';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useStudentSetupStateQuery } from 'src/redux/student/setup/api';
import GlobalAcademicSearch from 'src/layouts/components/global-academic-search';
import { Box, Stack, Alert, Button, Typography, LinearProgress, CircularProgress } from '@mui/material';

import StudentSetupFooter from './StudentSetupFooter';
import StudentSetupChecklist from './StudentSetupChecklist';
import StudentSetupWorkflows from './StudentSetupWorkflows';
import StudentSetupSettingPanel from './StudentSetupSettingPanel';
import { useStudentSetupProgress } from './use-student-setup-progress';
import { studentSetupStages, studentSetupSettings } from './student-setup-catalog';
import { StudentSetupEmbeddingProvider } from './embedding/StudentSetupEmbeddingProvider';
import { getStudentSetupPosition, nextStudentSetupPosition, getStudentSetupStepStates } from './student-setup-model';

import type { StudentSetupPosition } from './student-setup-catalog';
import type { StudentSetupFormState } from './embedding/StudentSetupEmbeddingProvider';

export default function StudentSetupWorkspace({ scope: baseScope, returnTo, classes, permissions, prerequisite }: {
  scope: StudentSetupScope; returnTo: string; classes: { id: string; name: string }[];
  permissions: GrantedPermission[]; prerequisite: string;
}) {
  const router = useRouter();
  const [standardId, setStandardId] = useState<string>();
  const [form, setForm] = useState<StudentSetupFormState>({ dirty: false, busy: false });
  const [reloading, setReloading] = useState(false);
  const scope = { ...baseScope, standardId };
  const query = useStudentSetupStateQuery(scope, { skip: !scope.academicYearId, refetchOnMountOrArgChange: true });
  const scopeKey = `${scope.tenantCacheKey}:${scope.academicYearId}:${scope.academicMediumId ?? ''}:${standardId ?? ''}`;
  const lastGood = useRef<{ key: string; state: StudentSetupState } | null>(null);
  if (query.currentData?.academicYearId === scope.academicYearId) lastGood.current = { key: scopeKey, state: query.currentData };
  const data = lastGood.current?.key === scopeKey ? lastGood.current.state : undefined;
  const state = data ? { ...data, settings: data.settings.map((status) => ({ ...status,
    canView: status.canView && hasGrantedPermission(permissions, studentSetupSettings.find((item) => item.key === status.key)?.permission),
  })) } : undefined;
  const progress = useStudentSetupProgress(scope, state);
  const { position } = progress;
  const blocked = form.dirty || form.busy;
  const guideBusy = progress.saving || progress.navigating || reloading;
  const disabled = blocked || guideBusy || query.isFetching || query.isError || !state || progress.conflict;
  const tableStage = ['admissions', 'numbering', 'records'].includes(position.stage);
  const allowed = state?.settings.filter((item) => item.canView).map((item) => item.key) ?? [];
  const activeStep = studentSetupStages.findIndex((item) => item.key === position.stage);
  const move = (target: StudentSetupPosition) => {
    if (!disabled) progress.move(getStudentSetupPosition(target.stage, target.setting, allowed));
  };
  const next = (defer = false) => {
    if (disabled) return;
    if (position.stage === 'review') { progress.persist(position, progress.deferred, true, returnTo); return; }
    const keys = position.setting ? progress.deferred.filter((key) => key !== position.setting) : progress.deferred;
    progress.persist(nextStudentSetupPosition(position, allowed), defer && position.setting ? [...keys, position.setting] : keys);
  };
  const exit = () => { if (!disabled) progress.persist(position, progress.deferred, false, returnTo); };
  const reload = async () => {
    setReloading(true);
    try { const fresh = await query.refetch(); if (fresh.data) progress.restore(fresh.data); }
    finally { setReloading(false); }
  };
  return <SetupFlowShell steps={studentSetupStages} activeStep={activeStep} furthestStep={studentSetupStages.length - 1}
    fillContent={false} stepStates={!query.isError && state ? getStudentSetupStepStates(state.settings, progress.deferred, state.reviewedAt) : {}}
    disabled={disabled} onStep={(index) => move(getStudentSetupPosition(studentSetupStages[index].key, null, allowed))}
    schoolCode="Student module" sidebarTitle="Student setup" headerLabel="Student setup guide" contextLabel="Progress is saved for the academic year."
    footer={<StudentSetupFooter welcome={position.stage === 'welcome'} review={position.stage === 'review'} hasSetting={Boolean(position.setting)}
      disabled={disabled} blocked={blocked} saving={progress.saving} saveStatus={progress.saving ? 'Saving…' : progress.message && !progress.failed ? 'Saved' : ''}
      onBack={() => move(nextStudentSetupPosition(position, allowed, true))} onSave={() => { progress.persist(); }}
      onExit={exit} onContinue={() => next()} onDefer={() => next(true)} />}>
    <Stack spacing={tableStage ? 1.5 : 3} useFlexGap sx={{ position: 'relative', ...(tableStage && { flex: '1 0 auto', minHeight: 'min-content', '& > *': { flexShrink: 0 } }) }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
        <Box inert={blocked || guideBusy} sx={{ flex: 1, minWidth: 0 }}><GlobalAcademicSearch /></Box>
        <Button size="small" color="inherit" variant="outlined" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          disabled={blocked || guideBusy} onClick={() => { if (state && !query.isError && !progress.conflict) exit(); else router.push(returnTo); }}>Exit setup</Button>
      </Stack>
      {position.stage === 'numbering' && <Box sx={{ maxWidth: 320 }}>
        <CustomSelect label="Numbering status class" value={standardId ?? ''} options={classes.map((item) => ({ value: item.id, label: item.name }))}
          valueKey="value" labelKey="label" size="small" fullWidth disabled={blocked || guideBusy || !scope.academicMediumId}
          onChange={(value) => setStandardId(String(value) || undefined)}
          helperText="Checks apply to this class. Configure every required academic group in the rule’s own form." />
      </Box>}
      {progress.failed && <Alert severity="error" role="status" action={progress.conflict ? <Button color="inherit" size="small"
        disabled={blocked || guideBusy || query.isFetching} onClick={reload}>Reload</Button> : undefined}>{progress.message}</Alert>}
      <LinearProgress aria-label={guideBusy ? 'Switching setup setting' : 'Refreshing setup status'} aria-hidden={!query.isFetching && !guideBusy}
        sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, visibility: query.isFetching || guideBusy ? 'visible' : 'hidden' }} />
      {query.isError && <Alert severity="error" action={<Button color="inherit" size="small" disabled={blocked || guideBusy} onClick={() => { query.refetch(); }}>Retry</Button>}>
        Setup status could not be loaded. Your saved settings are unchanged.
      </Alert>}
      {!scope.academicYearId ? <Alert severity="info">Select an academic year, board and medium to begin.</Alert>
        : !state && !query.isError ? <Stack alignItems="center" spacing={2}><CircularProgress size={24} /><Typography>Loading setup…</Typography></Stack>
          : state ? <Box inert={guideBusy} aria-busy={guideBusy}
            sx={tableStage ? { flex: '1 0 auto', minHeight: 'min-content', display: 'flex', flexDirection: 'column' } : undefined}>
            <StudentSetupEmbeddingProvider onFormStateChange={setForm}>
              {position.stage === 'welcome' || position.stage === 'review' ? <StudentSetupChecklist state={state} deferred={progress.deferred}
                review={position.stage === 'review'} disabled={disabled} onOpen={move} prerequisite={prerequisite} />
                : position.stage === 'workflows' ? <StudentSetupWorkflows permissions={permissions} disabled={disabled} />
                  : <StudentSetupSettingPanel position={position} state={query.isError ? { ...state,
                    settings: state.settings.map((item) => ({ ...item, configurationState: 'unavailable' as const })) } : state}
                    deferred={progress.deferred} disabled={disabled} onOpen={move} />}
            </StudentSetupEmbeddingProvider>
          </Box> : null}
      {state && position.stage !== 'welcome' && <Typography variant="caption" color="text.secondary">
        Save progress remembers your place in this guide. Use each setting’s own form to save its values.
      </Typography>}
    </Stack>
  </SetupFlowShell>;
}
