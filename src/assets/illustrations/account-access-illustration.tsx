import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { StudentSearchingCharacter } from './student-searching-character';

export function AccountAccessIllustration({ sx }: { sx?: SxProps<Theme> }) {
  const theme = useTheme();
  const { palette } = theme.vars ?? theme;
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      fill="none"
      aria-hidden="true"
      focusable="false"
      sx={[
        { width: 1, maxWidth: 260, height: 'auto', flexShrink: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="circle"
        cx="159"
        cy="140"
        r="108"
        sx={{
          fill: palette.background.neutral,
          ...theme.applyStyles('dark', { fill: palette.grey[200] }),
        }}
      />
      <g
        stroke={palette.text.secondary}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="rotate(8 219 116)">
          <rect x="155" y="58" width="125" height="125" rx="10" fill={palette.background.paper} />
          <path d="M155 80H280" stroke={palette.primary.main} strokeWidth="2" />
          <rect x="202" y="51" width="31" height="14" rx="4" fill={palette.background.paper} />
          <circle
            cx="183"
            cy="110"
            r="10"
            fill={palette.background.paper}
            stroke={palette.primary.main}
          />
          <path d="M170 133C171 118 195 118 196 133Z" fill={palette.background.paper} />
          <path d="M211 104H262M211 115H249M211 130H257M170 151H211" />
          <path d="M170 162H201" stroke={palette.primary.main} strokeWidth="2.5" />
        </g>
      </g>
      <StudentSearchingCharacter />
    </Box>
  );
}
