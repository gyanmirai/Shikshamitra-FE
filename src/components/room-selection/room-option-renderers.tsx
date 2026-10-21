import type { HTMLAttributes } from 'react';
import type { AutocompleteRenderGroupParams } from '@mui/material/Autocomplete';

import { Box, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import type { RoomOption } from './roomOptions';

export function renderRoomGroup(params: AutocompleteRenderGroupParams) {
  return (
    <Box component="li" key={params.key} sx={{ mb: 0.25, listStyle: 'none' }}>
      <Typography
        component="div"
        variant="caption"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          px: 1,
          py: 0.5,
          color: 'text.secondary',
          bgcolor: 'background.neutral',
          fontWeight: 700,
          textTransform: 'uppercase',
          overflowWrap: 'anywhere',
        }}
      >
        {params.group}
      </Typography>
      <Box
        component="ul"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, p: 0.75, m: 0, listStyle: 'none' }}
      >
        {params.children}
      </Box>
    </Box>
  );
}

export function renderRoomOption(
  optionProps: HTMLAttributes<HTMLLIElement> & { key?: React.Key },
  option: RoomOption,
  { selected }: { selected: boolean }
) {
  const { key, ...restProps } = optionProps;
  return (
    <Box
      component="li"
      key={key}
      {...restProps}
      sx={{
        width: 'auto !important',
        minWidth: 64,
        maxWidth: '100%',
        minHeight: 44,
        m: '0 !important',
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.75,
        gap: 0.5,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 1,
        bgcolor: selected ? 'action.selected' : 'background.paper',
        color: 'text.primary',
        fontWeight: selected ? 700 : 500,
        justifyContent: 'center !important',
        textAlign: 'center !important',
        overflowWrap: 'anywhere',
        transition: 'border-color 120ms ease, background-color 120ms ease',
        '&:hover, &.Mui-focused, &.Mui-focusVisible': {
          bgcolor: 'action.hover',
          borderColor: 'text.secondary',
        },
      }}
    >
      {selected && <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 16 }} />}
      {option.roomName}
    </Box>
  );
}
