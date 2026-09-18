import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Radio, Stack, Typography } from '@mui/material';

interface SubmissionTypeCardProps {
  value: number;
  label: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export function SubmissionTypeCard({
  value,
  label,
  description,
  icon,
  selected,
  onClick,
}: SubmissionTypeCardProps) {
  return (
    <Box
      role="radio"
      tabIndex={0}
      aria-label={label}
      aria-checked={selected}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      sx={(theme) => ({
        cursor: 'pointer',
        p: 2.5,
        width: '100%',
        height: '100%',
        borderRadius: 2,
        border: `2px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.12)}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
        boxShadow: selected
          ? `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.12)}, 0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`
          : 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        '&:hover': {
          borderColor: selected ? theme.palette.primary.main : 'text.disabled',
          boxShadow: selected
            ? `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.16)}, 0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`
            : `0 4px 12px -2px ${alpha(theme.palette.grey[500], 0.08)}`,
          transform: 'translateY(-2px)',
        },
        '&:focus-visible': {
          outline: `3px solid ${alpha(theme.palette.primary.main, 0.32)}`,
          outlineOffset: 2,
        },
      })}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box
          sx={(theme) => ({
            p: 1,
            borderRadius: 1.5,
            color: selected ? 'primary.main' : 'text.secondary',
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.grey[500], 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s',
          })}
        >
          <Iconify icon={icon} width={24} height={24} />
        </Box>
        <Radio
          checked={selected}
          value={value}
          tabIndex={-1}
          slotProps={{ input: { 'aria-hidden': true } }}
          sx={{
            p: 0,
            color: 'text.disabled',
            '&.Mui-checked': {
              color: 'primary.main',
            },
          }}
        />
      </Stack>

      <Stack spacing={0.5}>
        <Typography
          variant="subtitle2"
          sx={(theme) => ({
            fontWeight: 700,
            color: selected ? 'primary.darker' : 'text.primary',
            transition: 'color 0.25s',
            ...theme.applyStyles('dark', {
              color: selected ? 'primary.light' : 'text.primary',
            }),
          })}
        >
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.3,
            fontSize: '11px',
          }}
        >
          {description}
        </Typography>
      </Stack>
    </Box>
  );
}
