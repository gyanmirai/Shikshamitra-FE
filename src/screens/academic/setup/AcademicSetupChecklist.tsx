'use client';

import type { AcademicSetupState } from 'src/redux/academic-setup/types';

import { Box, Stack, Button, Divider, Typography } from '@mui/material';

import { academicSetupStages, academicSetupSettings } from './academic-setup-catalog';

import type { AcademicSetupPosition } from './academic-setup-catalog';

export const academicSetupStatusLabel = (state?: string, deferred = false) => {
  if (state === 'configured') return 'Configured';
  if (deferred) return 'Deferred';
  if (state === 'context-required') return 'Choose a class';
  if (state === 'unavailable') return 'Unavailable';
  return 'Not configured';
};

export default function AcademicSetupChecklist({ state, deferred, review, disabled, onOpen }: {
  state: AcademicSetupState; deferred: string[]; review: boolean; disabled: boolean;
  onOpen: (position: AcademicSetupPosition) => void;
}) {
  const visible = academicSetupSettings.filter((item) => state.settings.some((status) => status.key === item.key && status.canView));
  const configured = visible.filter((item) => state.settings.find((status) => status.key === item.key)?.configurationState === 'configured').length;
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">{review ? 'Review' : 'Welcome'}</Typography>
        <Typography variant="h4" component="h1">
          {review ? 'Review your Academic setup' : 'Let’s set up Academics'}
        </Typography>
        <Typography color="text.secondary">
          {review ? 'Check the saved settings below. You can return to any item before finishing.'
            : 'Work through your settings in order, or start with the area you need. You can save your place and return later.'}
        </Typography>
      </Stack>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper' }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ p: 2 }}>
          <Typography variant="subtitle2">Your setup checklist</Typography>
          <Typography variant="body2" color="text.secondary">{configured} of {visible.length} configured</Typography>
        </Stack>
        <Divider />
        {academicSetupStages.slice(1, -1).map((stage) => {
          const items = visible.filter((item) => item.stage === stage.key);
          if (!items.length) return null;
          return (
            <Box key={stage.key} sx={{ px: 2, py: 1.5, '& + &': { borderTop: 1, borderColor: 'divider' } }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{stage.title}</Typography>
              {items.map((item) => {
                const status = state.settings.find((entry) => entry.key === item.key);
                return (
                  <Stack key={item.key} direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ py: 0.75 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2">{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review ? academicSetupStatusLabel(status?.configurationState, deferred.includes(item.key)) : item.description}
                      </Typography>
                    </Box>
                    <Button size="small" color="inherit" variant="outlined" disabled={disabled}
                      onClick={() => onOpen({ stage: item.stage, setting: item.key })}>
                      {review ? 'Review' : 'Open'}
                    </Button>
                  </Stack>
                );
              })}
            </Box>
          );
        })}
      </Box>
      <Typography variant="body2" color="text.secondary">
        Status reflects the selected academic scope. Timetable settings need a class selection.
        Finishing this guide records your review; it does not mark unfinished settings as configured.
      </Typography>
    </Stack>
  );
}
