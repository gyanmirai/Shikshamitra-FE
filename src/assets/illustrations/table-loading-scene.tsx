import { useId } from 'react';
import Box from '@mui/material/Box';

import { StudentSearchingCharacter } from './student-searching-character';

const accent = 'var(--student-loader-accent)';

export function TableLoadingScene() {
  const id = useId();
  const tableClip = `${id}-table`;
  const barClip = `${id}-bar`;

  return (
    <Box
      component="g"
      sx={{
        '& .search-trace': { animation: 'student-search-trace 3.2s linear infinite' },
        '& .search-progress': { animation: 'student-search-progress 1.6s ease-in-out infinite' },
        '& .search-dot': { animation: 'student-search-dot 1.6s ease-in-out infinite' },
        '@keyframes student-search-trace': { to: { strokeDashoffset: -100 } },
        '@keyframes student-search-progress': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(163px)' },
        },
        '@keyframes student-search-dot': {
          '0%, 70%, 100%': { opacity: 0.25 },
          '35%': { opacity: 1 },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '& .search-trace, & .search-progress, & .search-dot': {
            animation: 'none',
          },
          '& .search-progress': { display: 'none' },
        },
      }}
    >
      <defs>
        <clipPath id={tableClip}>
          <rect x="135" y="99" width="119" height="72" rx="5" />
        </clipPath>
        <clipPath id={barClip}>
          <rect x="136" y="182" width="117" height="4" rx="2" />
        </clipPath>
      </defs>
      <circle cx="145" cy="96" r="76" fill="var(--student-search-backdrop)" />
      <rect
        x="134"
        y="98"
        width="121"
        height="74"
        rx="6"
        fill="var(--student-loader-table)"
        stroke="var(--student-loader-border)"
        strokeWidth="1.2"
      />
      <g clipPath={`url(#${tableClip})`}>
        <path d="M135 99H254V112H135Z" fill="var(--student-loader-header)" />
        <path d="M144 105H160" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M135 112H254M135 132H254M135 152H254M168 112V171M211 112V171"
          stroke="var(--student-loader-grid)"
          strokeWidth="0.8"
        />
        <g fill={accent} opacity="0.55">
          {[120, 140, 160].map((y) => (
            <g key={y}>
              <rect x="144" y={y} width="16" height="4" rx="2" />
              <rect x="177" y={y} width="25" height="4" rx="2" />
              <rect x="220" y={y} width="23" height="4" rx="2" />
            </g>
          ))}
        </g>
      </g>
      <g transform="translate(11 -9) scale(0.8)">
        <StudentSearchingCharacter loading />
      </g>
      <rect
        className="search-trace"
        x="134"
        y="98"
        width="121"
        height="74"
        rx="6"
        pathLength="100"
        stroke={accent}
        strokeWidth="1.8"
        strokeDasharray="16 84"
      />
      <rect x="136" y="182" width="117" height="4" rx="2" fill="var(--student-loader-track)" />
      <g clipPath={`url(#${barClip})`}>
        <rect
          className="search-progress"
          x="93"
          y="182"
          width="46"
          height="4"
          rx="2"
          fill={accent}
        />
      </g>
      <g fill={accent}>
        {[0, 1, 2].map((dot) => (
          <circle
            key={dot}
            className="search-dot"
            cx={186 + dot * 10}
            cy="79"
            r="2.5"
            style={{ animationDelay: `${dot * 0.16}s` }}
          />
        ))}
      </g>
    </Box>
  );
}
