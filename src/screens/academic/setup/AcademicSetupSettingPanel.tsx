'use client';

import type { AcademicSetupState } from 'src/redux/academic-setup/types';

import { Box, Tab, Tabs, Stack, Alert, Typography } from '@mui/material';

import AcademicSetupManager from './AcademicSetupManager';
import { academicSetupStatusLabel } from './AcademicSetupChecklist';
import { academicSetupStages, academicSetupSettings } from './academic-setup-catalog';

import type { AcademicSetupPosition } from './academic-setup-catalog';

export default function AcademicSetupSettingPanel({ position, state, deferred, disabled, onOpen }: {
  position: AcademicSetupPosition; state: AcademicSetupState; deferred: string[]; disabled: boolean;
  onOpen: (position: AcademicSetupPosition) => void;
}) {
  const items = academicSetupSettings.filter((item) => item.stage === position.stage
    && state.settings.some((status) => status.key === item.key && status.canView));
  const current = items.find((item) => item.key === position.setting);
  const status = state.settings.find((item) => item.key === current?.key);
  return (
    <Stack spacing={2.5}>
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
        <Box><AcademicSetupManager key={current.key} setting={current.key} /></Box>
      </> : <Alert severity="info">Choose an available setting above. You only see settings you have permission to view.</Alert>}
    </Stack>
  );
}
