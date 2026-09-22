import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';

export type ReviewStatusIconTone = 'default' | 'info' | 'success' | 'warning' | 'error';

type ReviewStatusIconBadgeProps = {
  icon: string;
  tone?: ReviewStatusIconTone;
  size?: number;
  iconSize?: number;
};

export function ReviewStatusIconBadge({
  icon,
  tone = 'default',
  size = 32,
  iconSize = 18,
}: ReviewStatusIconBadgeProps) {
  return (
    <Box
      component="span"
      data-tone={tone}
      sx={(theme) => {
        const isDefault = tone === 'default';
        const color = isDefault ? theme.palette.text.secondary : theme.palette[tone].main;
        const backgroundColor = isDefault ? theme.palette.grey[500] : theme.palette[tone].main;

        return {
          width: size,
          height: size,
          display: 'inline-flex',
          color,
          borderRadius: 1.25,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(backgroundColor, 0.08),
          flexShrink: 0,
        };
      }}
    >
      <Iconify icon={icon} width={iconSize} />
    </Box>
  );
}
