import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

type Props = { label: string; icon: string; description?: string | null; onClick: () => void };

export function PaletteFieldButton({ label, icon, description, onClick }: Props) {
  return (
    <Tooltip title={description || ''} placement="right" enterDelay={500}>
      <Button
        fullWidth
        size="small"
        variant="outlined"
        color="inherit"
        onClick={onClick}
        aria-label={`Add ${label}`}
        sx={{
          minHeight: 48,
          px: 1,
          py: 1,
          gap: 1,
          textAlign: 'left',
          justifyContent: 'flex-start',
          borderColor: 'divider',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            p: 0.75,
            borderRadius: 1,
            bgcolor: 'action.hover',
            color: 'text.secondary',
          }}
        >
          <Iconify icon={icon} width={18} />
        </Box>
        <Typography
          component="span"
          variant="body2"
          fontWeight={600}
          sx={{ flex: 1, overflowWrap: 'anywhere' }}
        >
          {label}
        </Typography>
        <Iconify icon="mdi:plus" width={18} sx={{ color: 'primary.main' }} />
      </Button>
    </Tooltip>
  );
}
