'use client';

import type { StudentSetupState } from 'src/redux/student/setup/types';

import { Box, Stack, Button, Divider, Typography } from '@mui/material';

import { studentSetupStatusLabel } from './student-setup-model';
import { studentSetupStages, studentSetupSettings } from './student-setup-catalog';

import type { StudentSetupPosition } from './student-setup-catalog';

export default function StudentSetupChecklist({ state, deferred, review, disabled, onOpen, prerequisite }: {
  state: StudentSetupState; deferred: string[]; review: boolean; disabled: boolean;
  onOpen: (position: StudentSetupPosition) => void; prerequisite: string;
}) {
  const visible = studentSetupSettings.filter((item) => state.settings.some((status) => status.key === item.key && status.canView));
  const configured = visible.filter((item) => state.settings.find((status) => status.key === item.key)?.configurationState === 'configured').length;
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">{review ? 'Review' : 'Welcome'}</Typography>
        <Typography variant="h4" component="h1">{review ? 'Review your Student setup' : 'Let’s set up Students'}</Typography>
        <Typography color="text.secondary">{review ? 'Check the saved settings below. You can return to any item before finishing.'
          : 'Work through your settings in order, or start with the area you need. You can save your place and return later.'}</Typography>
        {!review && <Typography variant="body2" color="text.secondary">{prerequisite}</Typography>}
      </Stack>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper' }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ p: 2 }}>
          <Typography variant="subtitle2">Your setup checklist</Typography>
          <Typography variant="body2" color="text.secondary">{configured} of {visible.length} configured</Typography>
        </Stack>
        <Divider />
        {studentSetupStages.map((stage) => {
          const items = visible.filter((item) => item.stage === stage.key);
          if (!items.length) return null;
          return (
            <Box key={stage.key} sx={{ px: 2, py: 1.5, '& + &': { borderTop: 1, borderColor: 'divider' } }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{stage.title}</Typography>
              {items.map((item) => (
                <Stack key={item.key} direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ py: 0.75 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2">{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{review
                      ? studentSetupStatusLabel(state.settings.find((entry) => entry.key === item.key), deferred.includes(item.key)) : item.description}</Typography>
                  </Box>
                  <Button size="small" color="inherit" variant="outlined" disabled={disabled}
                    onClick={() => onOpen({ stage: item.stage, setting: item.key })}>{review ? 'Review' : 'Open'}</Button>
                </Stack>
              ))}
            </Box>
          );
        })}
      </Box>
      <Typography variant="body2" color="text.secondary">Status reflects configuration in the selected academic context. Numbering checks need a class selection.
        Finishing this guide records your review; it does not mark unfinished settings as configured or activate students.</Typography>
      {visible.length < studentSetupSettings.length && <Typography variant="body2" color="text.secondary">
        Settings outside your view permissions need review by an authorized staff member.</Typography>}
    </Stack>
  );
}
