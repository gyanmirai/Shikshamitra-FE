import { Box } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

export function DefaultIndicator({ label }: { label: string }) {
  return (
    <CustomTooltip arrow title={label}>
      <Box
        component="span"
        role="img"
        aria-label={label}
        tabIndex={0}
        onClick={(event) => event.stopPropagation()}
        sx={{
          display: 'inline-flex',
          flexShrink: 0,
          color: 'warning.main',
          borderRadius: 0.5,
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <Iconify aria-hidden="true" icon="mdi:star" width={16} />
      </Box>
    </CustomTooltip>
  );
}
