import type { ReactNode } from 'react';

import dayjs from 'dayjs';
import { Stack, Typography } from '@mui/material';

import { SubstitutionCreationOverlay } from '../components/SubstitutionCreationOverlay';

import type { QuickSubstitutionContext } from './types';

type Props = {
  context: QuickSubstitutionContext;
  children: ReactNode;
  onClose: () => void;
  busy: boolean;
};

export function QuickSubstitutionShell({ context, children, onClose, busy }: Props) {
  return (
    <SubstitutionCreationOverlay
      open
      displayAsDrawer
      onClose={onClose}
      disableClose={busy}
      closeLabel="Close substitution drawer"
      title={
        <Stack spacing={0.5}>
          <Typography variant="h6">Arrange substitution</Typography>
          <Typography variant="body2">
            {context.teacherName} · {dayjs(context.date).format('DD MMM YYYY')} ·{' '}
            {context.startTime}–{context.endTime}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {context.reason}
          </Typography>
        </Stack>
      }
    >
      {children}
    </SubstitutionCreationOverlay>
  );
}
