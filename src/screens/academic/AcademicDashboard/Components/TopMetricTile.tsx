import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import { getToneMain, type DashboardCardTone } from './admin-dashboard-card-theme';

type TopMetricTileProps = {
  label: string;
  value: string | number;
  icon: string;
  helper?: string;
  tone?: DashboardCardTone;
  href?: string;
  onClick?: () => void;
};

export function TopMetricTile({
  label,
  value,
  icon,
  helper,
  tone = 'primary',
  href,
  onClick,
}: TopMetricTileProps) {
  const tileSx = {
    width: '100%',
    p: 1.25,
    minHeight: 86,
    borderRadius: 1,
    textAlign: 'left' as const,
    color: 'text.primary',
    textDecoration: 'none',
    bgcolor: (theme: Parameters<typeof getToneMain>[0]) => alpha(getToneMain(theme, tone), 0.06),
    border: (theme: Parameters<typeof getToneMain>[0]) =>
      `1px solid ${alpha(getToneMain(theme, tone), 0.18)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    cursor: href || onClick ? 'pointer' : 'default',
    transition: (theme: Parameters<typeof getToneMain>[0]) =>
      theme.transitions.create(['background-color', 'border-color', 'transform'], {
        duration: theme.transitions.duration.shorter,
      }),
    ...(href || onClick
      ? {
          '&:hover': {
            transform: 'translateY(-1px)',
            bgcolor: (theme: Parameters<typeof getToneMain>[0]) =>
              alpha(getToneMain(theme, tone), 0.1),
            borderColor: (theme: Parameters<typeof getToneMain>[0]) =>
              alpha(getToneMain(theme, tone), 0.28),
          },
        }
      : {}),
  };

  const content = (
    <>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', fontWeight: 700, lineHeight: 1.2 }}
        >
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.25, lineHeight: 1.08 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {helper}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          color: (theme) => getToneMain(theme, tone),
          bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.1),
        }}
      >
        <Iconify icon={icon} width={19} />
      </Box>
    </>
  );

  if (href) {
    return (
      <Box component={Link} href={href} sx={tileSx}>
        {content}
      </Box>
    );
  }

  if (onClick) {
    return (
      <Box component="button" type="button" onClick={onClick} sx={tileSx}>
        {content}
      </Box>
    );
  }

  return <Box sx={tileSx}>{content}</Box>;
}
