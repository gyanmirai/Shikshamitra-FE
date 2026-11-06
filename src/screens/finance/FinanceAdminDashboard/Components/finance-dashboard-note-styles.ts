import type { Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

const noteInk = (theme: Theme) => theme.palette.success.main;

export const financeNotePanelSx = {
  border: '1px solid',
  borderColor: (theme: Theme) => alpha(noteInk(theme), 0.35),
  borderRadius: 2,
  bgcolor: (theme: Theme) => alpha(noteInk(theme), theme.palette.mode === 'light' ? 0.035 : 0.1),
  boxShadow: 'none',
};

export const financeNoteFrameSx = {
  ...financeNotePanelSx,
  p: { xs: 0.75, md: 1 },
  borderWidth: 2,
  borderColor: 'success.main',
  backgroundImage: (theme: Theme) =>
    `repeating-linear-gradient(135deg, ${alpha(noteInk(theme), 0.14)} 0px, ${alpha(noteInk(theme), 0.14)} 1px, transparent 1px, transparent 9px)`,
};

export const financeNoteInnerSx = {
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: (theme: Theme) => alpha(noteInk(theme), 0.45),
  borderRadius: 1.5,
  bgcolor: 'background.paper',
};
