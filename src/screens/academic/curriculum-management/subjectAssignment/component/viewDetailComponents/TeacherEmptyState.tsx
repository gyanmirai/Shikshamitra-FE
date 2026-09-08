import { varAlpha } from 'src/theme/styles';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';

interface TeacherEmptyStateProps {
  teacherRole: 'primary' | 'secondary';
}

export function TeacherEmptyState({ teacherRole }: TeacherEmptyStateProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        border: `1px dashed ${theme.vars.palette.divider}`,
        textAlign: 'center',
      }}
    >
      <Iconify
        icon={
          teacherRole === 'primary' ? 'mdi:account-off-outline' : 'mdi:account-group-outline'
        }
        sx={{ fontSize: 26, color: 'text.secondary', mb: 0.5 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {teacherRole === 'primary'
          ? 'No primary teacher assigned'
          : 'No secondary teachers assigned'}
      </Typography>
    </Box>
  );
}
