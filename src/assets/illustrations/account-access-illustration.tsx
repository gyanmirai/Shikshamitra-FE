import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export function AccountAccessIllustration({ sx }: { sx?: SxProps<Theme> }) {
  const theme = useTheme();
  const { palette } = theme.vars ?? theme;
  const ink = 'var(--access-ink)';
  const paper = 'var(--access-paper)';
  const accent = 'var(--access-accent)';
  const detail = 'var(--access-detail)';

  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 260"
      fill="none"
      aria-hidden="true"
      focusable="false"
      sx={[
        {
          width: 1,
          maxWidth: 260,
          height: 'auto',
          flexShrink: 0,
          '--access-ink': palette.text.primary,
          '--access-paper': palette.background.paper,
          '--access-accent': palette.primary.main,
          '--access-detail': palette.text.secondary,
          '--access-backdrop': palette.background.neutral ?? palette.background.default,
          ...theme.applyStyles('dark', {
            '--access-ink': palette.grey[800],
            '--access-paper': palette.grey[100],
            '--access-detail': palette.grey[600],
            '--access-backdrop': palette.action.hover,
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <circle cx="159" cy="128" r="108" fill="var(--access-backdrop)" />
      <g stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(8 219 116)">
          <rect x="155" y="58" width="125" height="125" rx="10" fill={paper} />
          <path d="M155 80H280" stroke={accent} strokeWidth="2" />
          <rect x="202" y="51" width="31" height="14" rx="4" fill={paper} />
          <circle cx="183" cy="110" r="10" fill={accent} fillOpacity="0.12" stroke={accent} />
          <path d="M170 133C171 118 195 118 196 133Z" fill={paper} />
          <path d="M211 104H262M211 115H249M211 130H257M170 151H211" stroke={detail} />
          <path d="M170 162H201" stroke={accent} strokeWidth="2.5" />
        </g>
        <path d="M70 137Q47 143 48 174L45 228H146L139 174Q139 145 116 137L93 153Z" fill={paper} />
        <path d="M72 137L93 153L81 165L63 143M115 137L93 153L103 165L123 143" />
        <path
          d="M93 154L98 161L95 168L100 192L93 199L86 192L91 168L88 161Z"
          fill={accent}
          stroke={accent}
        />
        <path d="M126 154Q134 171 131 191M58 169L55 211" stroke={accent} strokeWidth="3" />
        <path d="M81 115V139L93 150L107 138V115" fill={paper} />
        <path d="M67 88C55 80 53 99 66 104M120 88C132 80 134 99 121 104" fill={paper} />
        <path
          d="M66 70Q67 50 94 50Q121 51 121 74L120 101C119 120 106 130 93 130C79 130 67 118 66 101Z"
          fill={paper}
        />
        <path
          d="M65 90C53 82 55 68 63 64C60 51 75 43 84 49C91 37 106 40 111 49C126 45 136 57 128 68C137 78 128 88 121 91L116 71C104 74 91 68 86 59C82 70 75 76 67 76Z"
          fill={ink}
        />
        <circle cx="81" cy="94" r="9" />
        <circle cx="106" cy="94" r="9" />
        <path d="M90 93Q93 90 97 93M66 91L72 93M115 93L121 91" />
        <ellipse cx="81" cy="94" rx="1.5" ry="2.4" fill={ink} stroke="none" />
        <ellipse cx="106" cy="94" rx="1.5" ry="2.4" fill={ink} stroke="none" />
        <path d="M93 98L90 106H94M87 115Q93 118 100 113" stroke={detail} />
        <path d="M63 175L75 204Q78 212 86 207L154 162L146 151L86 185L81 172" fill={paper} />
        <path d="M64 177L70 190" stroke={accent} strokeWidth="3" />
        <path d="M173 160L187 179" stroke={accent} strokeWidth="7" />
        <circle cx="157" cy="139" r="28" fill={paper} stroke={accent} strokeWidth="4" />
        <path
          d="M144 125Q149 118 158 122M152 133C152 125 165 125 165 133C165 139 158 139 158 144"
          stroke={ink}
          strokeWidth="2"
        />
        <circle cx="158" cy="152" r="1.5" fill={ink} stroke="none" />
        <path d="M146 161Q145 153 150 155L161 167Q164 172 159 173L150 167Z" fill={paper} />
        <path d="M46 229H273" stroke={detail} strokeOpacity="0.35" />
      </g>
    </Box>
  );
}
