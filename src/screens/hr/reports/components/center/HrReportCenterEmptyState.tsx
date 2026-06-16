import { Iconify } from 'src/components/iconify';
import { Stack, Typography } from '@mui/material';

type HrReportCenterEmptyStateProps = {
  icon: string;
  title: string;
  description: string;
};

export function HrReportCenterEmptyState({
  icon,
  title,
  description,
}: HrReportCenterEmptyStateProps) {
  return (
    <Stack spacing={1} alignItems="center" sx={{ py: 4, px: 2, color: 'text.secondary' }}>
      <Iconify icon={icon} width={40} />
      <Typography variant="subtitle2" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 360, textAlign: 'center' }}>
        {description}
      </Typography>
    </Stack>
  );
}
