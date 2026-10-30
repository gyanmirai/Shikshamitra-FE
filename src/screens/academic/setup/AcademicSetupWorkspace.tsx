'use client';

import type { AcademicSetupScope } from 'src/redux/academic-setup/types';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SetupFlowShell } from 'src/components/setup-flow';
import { useAcademicSetupStateQuery } from 'src/redux/academic-setup/api';
import GlobalAcademicSearch from 'src/layouts/components/global-academic-search';
import { Box, Stack, Alert, Button, Typography, LinearProgress, CircularProgress } from '@mui/material';

import AcademicSetupFooter from './AcademicSetupFooter';
import { AcademicSetupEmbeddingProvider } from './embedding';
import AcademicSetupChecklist from './AcademicSetupChecklist';
import AcademicSetupSettingPanel from './AcademicSetupSettingPanel';
import { useAcademicSetupProgress } from './use-academic-setup-progress';
import { academicSetupStages, academicSetupSettings } from './academic-setup-catalog';
import { getAcademicSetupPosition, getAcademicSetupStepStates } from './academic-setup-model';

import type { AcademicSetupFormState } from './embedding';
import type { AcademicSetupPosition } from './academic-setup-catalog';

export default function AcademicSetupWorkspace({ scope: baseScope, returnTo, classes }: {
  scope: AcademicSetupScope; returnTo: string; classes: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [standardId, setStandardId] = useState<string>();
  const [form, setForm] = useState<AcademicSetupFormState>({ dirty: false, busy: false });
  const [reloading, setReloading] = useState(false);
  const scope = { ...baseScope, standardId };
  const query = useAcademicSetupStateQuery(scope, { skip: !scope.academicYearId, refetchOnMountOrArgChange: true });
  const state = query.currentData ?? query.data;
  const progress = useAcademicSetupProgress(scope, state);
  const { position } = progress;
  const activeStep = academicSetupStages.findIndex((item) => item.key === position.stage);
  const blocked = form.dirty || form.busy;
  const guideBusy = progress.saving || progress.navigating || reloading;
  const tableStage = position.stage === 'curriculum' || position.stage === 'timetable';
  const failed = progress.failed || progress.conflict;
  const disabled = blocked || guideBusy || query.isFetching || query.isError || !state;
  const visible = academicSetupSettings.filter((item) => state?.settings.some((status) => status.key === item.key && status.canView));
  const move = (target: AcademicSetupPosition) => {
    if (disabled) return;
    const first = visible.find((item) => item.stage === target.stage);
    progress.move({ ...target, setting: visible.some((item) => item.key === target.setting)
      ? target.setting : first?.key ?? null });
  };
  const next = (defer = false) => {
    if (disabled) return;
    if (position.stage === 'review') {
      progress.persist(position, progress.deferred, true, returnTo);
      return;
    }
    const index = visible.findIndex((item) => item.key === position.setting);
    const item = visible[index + 1];
    const target: AcademicSetupPosition = item ? { stage: item.stage, setting: item.key } : { stage: 'review', setting: null };
    const keys = defer && position.setting ? [...new Set([...progress.deferred, position.setting])] : progress.deferred;
    progress.persist(target, keys);
  };
  const back = () => {
    const index = visible.findIndex((item) => item.key === position.setting);
    const previous = position.stage === 'review' ? visible.at(-1) : visible[index - 1];
    move(previous ? { stage: previous.stage, setting: previous.key } : { stage: 'welcome', setting: null });
  };
  return <SetupFlowShell steps={academicSetupStages} activeStep={activeStep} furthestStep={academicSetupStages.length - 1}
    fillContent={tableStage}
    stepStates={state ? getAcademicSetupStepStates(state.settings, progress.deferred, state.reviewedAt) : {}}
    disabled={disabled} onStep={(index) => move(getAcademicSetupPosition(academicSetupStages[index].key, null))}
    schoolCode="Academic module" sidebarTitle="Academic setup" headerLabel="Academic setup guide"
    contextLabel="Progress is saved for the academic year."
    footer={<AcademicSetupFooter welcome={position.stage === 'welcome'} review={position.stage === 'review'}
      disabled={disabled} blocked={blocked} saving={progress.saving} onBack={back}
      saveStatus={progress.saving ? 'Saving…' : progress.message && !failed ? 'Saved' : ''}
      onSave={() => { progress.persist(); }} onExit={() => { progress.persist(position, progress.deferred, false, returnTo); }}
      onContinue={() => next()} onDefer={() => next(true)} />}>
    <Stack spacing={tableStage ? 1.5 : 3} useFlexGap sx={{ position: 'relative',
      ...(tableStage && { flex: 1, minHeight: { xs: 0, sm: 700 }, '& > *': { flexShrink: 0 } }) }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
        <Box inert={blocked || guideBusy} sx={{ flex: 1, minWidth: 0 }}><GlobalAcademicSearch /></Box>
        <Button size="small" color="inherit" variant="outlined" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} disabled={blocked || guideBusy} onClick={() => {
          if (state) progress.persist(position, progress.deferred, false, returnTo); else router.push(returnTo);
        }}>Exit setup</Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Timetable status: {classes.find((item) => item.id === standardId)?.name
          ?? 'choose a class in Weekly Lectures or Lecture Slots'}.
      </Typography>
      {progress.message && failed && <Alert severity="error" role="status"
        action={progress.conflict ? <Button color="inherit" size="small" disabled={blocked || guideBusy || query.isFetching} onClick={async () => {
          setReloading(true);
          try {
            const fresh = await query.refetch();
            if (fresh.data) progress.restore(fresh.data);
          } finally { setReloading(false); }
        }}>Reload</Button> : undefined}>{progress.message}</Alert>}
      <LinearProgress aria-label={guideBusy ? 'Switching setup setting' : 'Refreshing setup status'} aria-hidden={!query.isFetching && !guideBusy}
        sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, visibility: query.isFetching || guideBusy ? 'visible' : 'hidden' }} />
      {query.isError && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => { query.refetch(); }}>Retry</Button>}>
          Setup status could not be loaded. Your saved settings are unchanged.
        </Alert>}
      {!scope.academicYearId ? <Alert severity="info">Select an academic year, board and medium to begin.</Alert>
        : !state && !query.isError ? <Stack alignItems="center" spacing={2}><CircularProgress size={24} /><Typography>Loading setup…</Typography></Stack>
          : state ? <Box inert={reloading || (progress.saving && !progress.navigating)} aria-busy={guideBusy}
            sx={tableStage ? { flex: { xs: '1 0 auto', sm: '1 1 0' }, minHeight: 280, display: 'flex', flexDirection: 'column' } : undefined}>
            <AcademicSetupEmbeddingProvider onFormStateChange={setForm} onStandardChange={setStandardId}>
            {position.stage === 'welcome' || position.stage === 'review'
              ? <AcademicSetupChecklist state={state} deferred={progress.deferred} review={position.stage === 'review'} disabled={disabled} onOpen={move} />
              : <AcademicSetupSettingPanel position={position} state={state} deferred={progress.deferred} disabled={disabled} loading={progress.navigating} onOpen={move} />}
            </AcademicSetupEmbeddingProvider></Box> : null}
      {state && position.stage !== 'welcome' && <Typography variant="caption" color="text.secondary">
        Save progress remembers your place in this guide. Use each setting’s own form to save its values.
      </Typography>}
    </Stack>
  </SetupFlowShell>;
}
