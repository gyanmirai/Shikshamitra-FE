import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';

import { STUDENT_EMPTY_STATE_SRC } from './student-character-asset';

export function StudentSearchingIllustration({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 320"
      fill="none"
      aria-hidden="true"
      focusable="false"
      sx={[
        { width: 1, maxWidth: 192, height: 'auto', flexShrink: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <image
        href={STUDENT_EMPTY_STATE_SRC}
        width="480"
        height="320"
        preserveAspectRatio="xMidYMid meet"
      />
    </Box>
  );
}
