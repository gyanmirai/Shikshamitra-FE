'use client';

import type { AcademicSetupState } from 'src/redux/academic-setup/types';

import { Box, Tab, Tabs, Stack, Alert, Typography } from '@mui/material';

import AcademicSetupManager from './AcademicSetupManager';
import { academicSetupStatusLabel } from './AcademicSetupChecklist';
import AcademicSetupLoadingSetting from './AcademicSetupLoadingSetting';
import { academicSetupStages, academicSetupSettings } from './academic-setup-catalog';

import type { AcademicSetupPosition } from './academic-setup-catalog';

export default function AcademicSetupSettingPanel({ position, state, deferred, disabled, loading = false, onOpen }: {
  position: AcademicSetupPosition; state: AcademicSetupState; deferred: string[]; disabled: boolean;
  onOpen: (position: AcademicSetupPosition) => void;
  loading?: boolean;
}) {
  const items = academicSetupSettings.filter((item) => item.stage === position.stage
    && state.settings.some((status) => status.key === item.key && status.canView));
  const current = items.find((item) => item.key === position.setting);
  const status = state.settings.find((item) => item.key === current?.key);
  const tableStage = position.stage === 'curriculum' || position.stage === 'timetable';
  return (
    <Stack spacing={tableStage ? 1.5 : 2.5} sx={tableStage ? { flex: { xs: '1 0 auto', sm: 1 }, minHeight: 0, '& > *': { flexShrink: 0 } } : undefined}>
      <Stack spacing={0.75}>
        <Typography variant="overline" color="text.secondary">Academic setup</Typography>
        <Typography variant="h4" component="h1">{academicSetupStages.find((item) => item.key === position.stage)?.title}</Typography>
        <Typography variant="body2" color="text.secondary">Configure each item using its usual form. Submit your changes before continuing with the guide.</Typography>
      </Stack>
      {!!items.length && <Tabs value={current?.key ?? false} variant="scrollable" scrollButtons="auto" aria-label="Settings in this step">
        {items.map((item) => <Tab key={item.key} value={item.key} label={item.title} disabled={disabled}
          onClick={() => onOpen({ stage: item.stage, setting: item.key })} />)}
      </Tabs>}
      {current ? <>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">{current.description}</Typography>
          <Typography variant="caption" color="text.secondary">
            {academicSetupStatusLabel(status?.configurationState, deferred.includes(current.key))}
          </Typography>
        </Stack>
        {!status?.canManage && <Alert severity="info">You can review this setting. Changes require the relevant management permission.</Alert>}
        <Box sx={{ position: 'relative', ...(tableStage && { flex: { xs: '0 0 520px', sm: '1 1 0' },
          minHeight: 0, maxHeight: { xs: 520, sm: 'none' }, display: 'flex', flexDirection: 'column' }) }}>
          {loading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex' }}><AcademicSetupLoadingSetting /></Box>}
          <Box aria-hidden={loading || undefined} inert={loading} sx={{ flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column', visibility: loading ? 'hidden' : 'visible' }}>
            <AcademicSetupManager key={current.key} setting={current.key} />
          </Box>
        </Box>
      </> : <Alert severity="info">Choose an available setting above. You only see settings you have permission to view.</Alert>}
    </Stack>
  );
}
