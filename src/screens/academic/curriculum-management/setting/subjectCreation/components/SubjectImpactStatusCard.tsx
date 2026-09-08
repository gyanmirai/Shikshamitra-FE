import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';
import { varAlpha, getSemanticTextStyles } from 'src/theme/styles';

interface SubjectImpactStatusCardProps {
  isInUse: boolean;
}

export function SubjectImpactStatusCard({ isInUse }: SubjectImpactStatusCardProps) {
  const theme = useTheme();
  const statusColor = isInUse ? 'warning' : 'success';
  const statusPalette = theme.vars.palette[statusColor];

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: varAlpha(statusPalette.mainChannel, 0.32),
        bgcolor: varAlpha(statusPalette.mainChannel, 0.08),
        boxShadow: 'none',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={1}
        sx={{ mb: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: varAlpha(statusPalette.mainChannel, 0.16),
              ...getSemanticTextStyles(theme, statusColor),
            }}
          >
            <Iconify
              icon={
                isInUse ? 'solar:shield-warning-bold-duotone' : 'solar:shield-check-bold-duotone'
              }
              width={16}
              height={16}
            />
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, ...getSemanticTextStyles(theme, statusColor) }}
          >
            {isInUse ? 'Impact & System Restrictions' : 'Safe to Modify or Delete'}
          </Typography>
        </Stack>

        <Label color={statusColor} variant="soft" sx={{ height: 20, fontSize: '11px' }}>
          {isInUse ? 'Restricted Deletion' : 'Fully Modifiable'}
        </Label>
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: '12.5px', lineHeight: 1.5, mb: isInUse ? 1.5 : 0 }}
      >
        {isInUse
          ? 'This subject is actively referenced across academic modules. Deletion is restricted while active curriculum, timetable, examination, or other dependent records exist.'
          : 'This subject has no active class allocations or academic records. You can safely edit details or delete this subject.'}
      </Typography>

      {isInUse && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Label color="warning" variant="filled" sx={{ height: 18, fontSize: '10px' }}>
            Recommendation
          </Label>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Archive instead of deletion when this subject is no longer actively taught.
          </Typography>
        </Box>
      )}
    </Card>
  );
}
