import { forwardRef } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

type StudentAcademicStatCardProps = {
  label: string;
  value: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  selected: boolean;
  onClick: () => void;
};

export const StudentAcademicStatCard = forwardRef<HTMLButtonElement, StudentAcademicStatCardProps>(
  ({ label, value, icon, color, selected, onClick }, ref) => (
    <Box
      ref={ref}
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        flex: '1 1 180px',
        minWidth: { xs: 160, md: 0 },
        p: 1.5,
        border: '1px solid',
        borderColor: selected ? `${color}.main` : 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        color: 'text.primary',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: selected ? (theme) => `0 0 0 1px ${theme.palette[color].main}` : 'none',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: `${color}.main`, transform: 'translateY(-1px)' },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.25,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
            color: `${color}.main`,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700} lineHeight={1}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.5}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
);
