import { Box, Typography } from '@mui/material';

type Props = {
  text: string;
  color: 'error.light' | 'primary.light';
  angle?: number;
  compact?: boolean;
  label?: string;
};

export function AcademicPinnedNote({
  text,
  color,
  angle = 2,
  compact = false,
  label = 'Classroom reminder',
}: Props) {
  return (
    <Box
      role="note"
      aria-label={label}
      sx={(theme) => ({
        position: 'relative',
        flexShrink: 0,
        width: compact ? 82 : 136,
        minHeight: compact ? 64 : 60,
        pt: compact ? 1.5 : 2.25,
        pb: compact ? 0.75 : 1.5,
        px: compact ? 0.75 : 1.25,
        my: compact ? 0.5 : 1,
        mr: 0.5,
        bgcolor: color,
        color: 'common.black',
        borderRadius: '1px 1px 10px 1px',
        boxShadow: theme.shadows[2],
        transform: { xs: 'none', sm: `rotate(${angle}deg)` },
        transformOrigin: '50% 8px',
        '&::after': {
          content: '""',
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 10,
          height: 10,
          bgcolor: 'common.white',
          opacity: 0.45,
          borderRadius: '0 0 10px 0',
          boxShadow: theme.shadows[1],
        },
      })}
    >
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          position: 'absolute',
          top: -5,
          left: 'calc(50% - 6px)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: 'primary.dark',
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: theme.shadows[2],
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 3,
            height: 3,
            top: 1,
            left: 1,
            borderRadius: '50%',
            bgcolor: 'primary.lighter',
          },
        })}
      />
      <Typography
        component="p"
        sx={{
          m: 0,
          whiteSpace: 'pre-line',
          overflowWrap: 'anywhere',
          fontFamily: (theme) => theme.typography.fontSecondaryFamily,
          fontWeight: 800,
          fontSize: compact ? 11 : 12,
          lineHeight: compact ? 1.05 : 1.15,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
