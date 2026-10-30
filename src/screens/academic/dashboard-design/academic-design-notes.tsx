import { Box, Typography } from '@mui/material';

export function AcademicDesignNotes() {
  return (
    <Box
      component="aside"
      aria-label="Classroom reminders"
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        alignItems: 'center',
        width: 158,
        height: 74,
        gap: 1.25,
        p: 0.75,
        flexShrink: 0,
      }}
    >
      <Typography
        component="p"
        sx={{
          m: 0,
          p: 0.5,
          height: 60,
          bgcolor: 'error.light',
          color: 'common.black',
          transform: 'rotate(-10deg)',
          fontFamily: (theme) => theme.typography.fontSecondaryFamily,
          fontWeight: 800,
          fontSize: 12,
          lineHeight: 1.05,
          whiteSpace: 'pre-line',
        }}
      >
        {'SAME\nCLASS\nBRIGHTER\nFUTURES'}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          p: 0.5,
          height: 60,
          bgcolor: 'primary.light',
          color: 'common.black',
          transform: 'rotate(4deg)',
        }}
      >
        <Typography
          component="p"
          sx={{
            m: 0,
            fontFamily: (theme) => theme.typography.fontSecondaryFamily,
            fontWeight: 800,
            fontSize: 12,
            lineHeight: 1.05,
            whiteSpace: 'pre-line',
          }}
        >
          {'TEACH\nSUPPORT\nBELONG\nGROW'}
        </Typography>
        <Box
          component="svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          sx={{
            position: 'absolute',
            right: 3,
            bottom: 3,
            width: 13,
            height: 13,
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 1.8,
            strokeLinejoin: 'round',
          }}
        >
          <path d="M12 2L15 9L23 9L17 14L19 22L12 17L5 22L7 14L1 9L9 9Z" />
        </Box>
      </Box>
      <Box
        component="svg"
        viewBox="0 0 40 40"
        aria-hidden="true"
        focusable="false"
        sx={{
          position: 'absolute',
          left: '41%',
          bottom: 0,
          width: 22,
          height: 22,
          color: 'common.black',
          fill: (theme) => theme.palette.warning.light,
          stroke: 'currentColor',
          strokeWidth: 2.5,
        }}
      >
        <circle cx="20" cy="20" r="16" />
        <circle cx="14" cy="16" r="1.3" fill="currentColor" />
        <circle cx="26" cy="16" r="1.3" fill="currentColor" />
        <path d="M12 23Q20 31 28 23" fill="none" strokeLinecap="round" />
      </Box>
    </Box>
  );
}
