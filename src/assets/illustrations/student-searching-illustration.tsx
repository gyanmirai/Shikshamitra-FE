import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';

type Props = { sx?: SxProps<Theme> };

export function StudentSearchingIllustration({ sx }: Props) {
  const theme = useTheme();
  const { palette } = theme.vars;
  const accent = 'var(--student-search-accent)';
  const surface = 'var(--student-search-surface)';
  const outline = 'var(--student-search-outline)';
  const detail = 'var(--student-search-detail)';
  const grid = 'var(--student-search-grid)';

  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      fill="none"
      aria-hidden="true"
      focusable="false"
      sx={[
        {
          width: 1,
          maxWidth: 160,
          height: 'auto',
          flexShrink: 0,
          '--student-search-accent': palette.primary.main,
          '--student-search-surface': palette.background.paper,
          '--student-search-outline': palette.text.primary,
          '--student-search-detail': palette.text.secondary,
          '--student-search-grid': palette.divider,
          '--student-search-backdrop': palette.background.neutral,
          ...theme.applyStyles('dark', {
            '--student-search-surface': palette.grey[100],
            '--student-search-outline': palette.grey[800],
            '--student-search-detail': palette.grey[600],
            '--student-search-grid': palette.grey[400],
            '--student-search-backdrop': varAlpha(palette.primary.mainChannel, 0.12),
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <circle cx="160" cy="132" r="108" fill="var(--student-search-backdrop)" />
      <g stroke={outline} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M65 134C46 131 41 143 40 160L37 213H62Z" fill={surface} />
        <path d="M47 152L44 198" stroke={accent} strokeWidth="3" />
        <g transform="translate(94 127)">
          <path d="M-14 0Q-37 4 -37 27L-42 98H42L37 28Q37 5 14 0L0 13Z" fill={surface} />
          <path d="M-14 0L0 13L-10 24L-22 5M14 0L0 13L10 24L22 5" />
          <path d="M0 14L5 20L2 27L6 48L0 54L-6 48L-2 27L-5 20Z" fill={accent} stroke={accent} />
          <path d="M28 14Q36 37 33 65" stroke={accent} strokeWidth="3" />
        </g>
        <g transform="translate(94 88)">
          <path d="M-12 21V39L0 48L13 38V21" fill={surface} />
          <path
            d="M-26 -4C-35 -10 -37 3 -29 10L-25 11M26 -4C35 -9 36 3 29 9L25 10"
            fill={surface}
          />
          <path
            d="M-27 -20Q-26 -34 0 -34Q26 -33 27 -17L26 7C25 25 14 34 0 34C-14 34 -25 23 -26 8Z"
            fill={surface}
          />
          <path
            d="M-28 0C-37 -7 -36 -19 -29 -23C-32 -34 -20 -41 -12 -36C-6 -46 8 -43 13 -35C25 -40 36 -31 30 -21C40 -12 34 -1 27 2L23 -16C12 -13 2 -17 -5 -25C-9 -15 -18 -12 -26 -13Z"
            fill={outline}
          />
          <ellipse cx="-12" cy="1" rx="1.7" ry="2.7" fill={outline} stroke="none" />
          <ellipse cx="12" cy="1" rx="1.7" ry="2.7" fill={outline} stroke="none" />
          <circle cx="-12" cy="1" r="9" />
          <circle cx="12" cy="1" r="9" />
          <path d="M-3 0Q0 -2 3 0M-27 -3L-21 -1M21 -1L27 -3" />
          <path d="M0 2L-3 11H1" stroke={detail} />
          <path d="M-7 19Q0 25 8 18" />
        </g>
        <g transform="translate(145 153)">
          <rect width="135" height="84" rx="7" fill={surface} />
          <path
            d="M7 0H128Q135 0 135 7V15H0V7Q0 0 7 0Z"
            fill={accent}
            fillOpacity="0.12"
            stroke="none"
          />
          <path
            d="M0 15H135M0 38H135M0 61H135M45 15V84M90 15V84"
            stroke={grid}
            strokeWidth="1.15"
          />
          <path d="M11 7.5H27" stroke={accent} strokeWidth="2.5" />
          <rect width="135" height="84" rx="7" />
        </g>
        <path d="M68 164L76 191Q79 199 87 193L137 152L129 141L87 169L84 157" fill={surface} />
        <path d="M70 163L74 178" stroke={accent} strokeWidth="2.5" />
        <path d="M145 143L159 164" stroke={accent} strokeWidth="7" />
        <circle cx="132" cy="124" r="25" fill={surface} stroke={accent} strokeWidth="4" />
        <path d="M118 123Q119 111 131 110" stroke={detail} />
        <path d="M130 146Q131 140 135 143L143 154Q145 158 141 159L133 153Z" fill={surface} />
        <g transform="translate(51 229)">
          <path d="M4 0H49V11H4C-2 11 -2 0 4 0Z" fill={surface} />
          <path d="M5 5.5H47" stroke={grid} strokeWidth="1" />
          <path d="M3 0H50M3 11H50" stroke={accent} strokeWidth="2" />
        </g>
        <g transform="translate(206 120)" stroke={accent} strokeWidth="2.5">
          <path d="M-13 6L-18 -1M0 0V-9M13 6L18 -1" />
        </g>
      </g>
    </Box>
  );
}
