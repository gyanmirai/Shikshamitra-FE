import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

export function BasicInformationSectionHeader({
  title,
  icon,
  subtitle,
}: {
  title: string;
  icon: string;
  subtitle: string;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.lighter', color: 'primary.main' }}>
        <Iconify icon={icon} width={24} />
      </Box>
      <Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}
