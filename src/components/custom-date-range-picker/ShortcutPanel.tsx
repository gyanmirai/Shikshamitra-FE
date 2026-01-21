import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { alpha } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import type { Shortcut, DateRange } from './types';

// ----------------------------------------------------------------------

type ShortcutPanelProps = {
  shortcuts?: Shortcut[];
  onSelectRange: (range: DateRange) => void;
  selectedRange: DateRange;
};

export function ShortcutPanel({ shortcuts, onSelectRange, selectedRange }: ShortcutPanelProps) {
  if (!shortcuts || shortcuts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 160 },
        borderRight: { md: (theme) => `dashed 1px ${theme.palette.divider}` },
        borderBottom: { xs: (theme) => `dashed 1px ${theme.palette.divider}`, md: 'none' },
        overflowY: 'auto',
        maxHeight: { xs: 120, md: 'unset' },
        height: { md: '100%' }, // Ensure full height on desktop
        flexShrink: 0,
      }}
    >
      <List disablePadding>
        {shortcuts.map((shortcut) => {
          const range = shortcut.getValue();
          const isSelected =
            selectedRange[0]?.isSame(range[0], 'day') && selectedRange[1]?.isSame(range[1], 'day');

          return (
            <ListItemButton
              key={shortcut.label}
              onClick={() => onSelectRange(range)}
              sx={{
                borderRadius: 1,
                typography: 'body2',
                color: 'text.secondary',
                ...(isSelected && {
                  color: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  fontWeight: 'fontWeightBold',
                }),
                m: 0.5,
                width: 'auto',
              }}
            >
              <ListItemText primary={shortcut.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
