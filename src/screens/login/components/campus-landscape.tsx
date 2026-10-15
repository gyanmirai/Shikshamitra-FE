import { useTheme } from '@mui/material/styles';

function CampusTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const { vars } = useTheme();
  const p = vars.palette.primary;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="67" rx="30" ry="7" fill={p.main} opacity="0.22" />
      <path
        d="M0 13v53m0-27L-13 26m13 5 14-14"
        fill="none"
        stroke={p.lighter}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M-30 6c-3-16 8-30 21-29C-2-47 32-39 33-19c19 7 20 35 3 43-10 7-23 5-31 0-22 12-40-1-35-18Z"
        fill={p.main}
      />
      <path
        d="M-9-23C-2-47 32-39 33-19c5 2 9 6 11 10C17 2-3-2-9-23Z"
        fill={p.light}
        opacity="0.5"
      />
      <path
        d="M0 23v13m0-5L-12 18m12 5 14-13"
        fill="none"
        stroke={p.lighter}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="m-22 3 4-8m42-11 4 5"
        stroke={p.lighter}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </g>
  );
}

export function CampusLandscape() {
  const { vars } = useTheme();
  const p = vars.palette.primary;
  return (
    <g>
      <circle cx="433" cy="72" r="31" fill={p.main} opacity="0.1" />
      <circle cx="433" cy="72" r="21" fill={p.main} opacity="0.08" />
      <g fill={p.main} opacity="0.14">
        <path d="M63 83c0-9 8-16 17-14 5-17 31-17 36 0 16-3 24 16 14 23H63Z" />
        <path d="M339 55c0-8 7-12 14-10 4-14 25-14 29 0 12-2 20 12 10 19h-53Z" />
      </g>
      <path
        d="m158 54 6-3 6 3m6 0 6-3 6 3M456 117l5-3 5 3m5 0 5-3 5 3"
        stroke={p.main}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
      />
      <ellipse cx="280" cy="289" rx="250" ry="36" fill={p.main} opacity="0.18" />
      <path d="M32 278c103-32 385-29 496 0l-12 20H43Z" fill={p.main} opacity="0.3" />
      <path d="m253 273-37 55h131l-41-55" fill={p.lighter} opacity="0.45" />
      <g stroke={p.darker} strokeWidth="1.5" opacity="0.35">
        <path d="m247 286 69 0m-81 17h95m-107 20h122m-67-39-9 44m26-44 12 44" />
      </g>
      <CampusTree x={66} y={198} scale={1.1} />
      <CampusTree x={496} y={195} scale={1.2} />
    </g>
  );
}

export function CampusGardens() {
  const { vars } = useTheme();
  const p = vars.palette.primary;
  const { white } = vars.palette.common;
  return (
    <g>
      <g fill={p.main}>
        <path d="M93 268c-7-21 13-30 22-15 3-19 26-18 30-2 16-10 26 6 21 17Z" />
        <path d="M391 268c-6-18 12-29 21-14 5-21 26-19 31-2 14-9 25 6 20 16Z" />
      </g>
      <path d="M87 267h87v5H87Zm298 0h83v5h-83Z" fill={p.light} opacity="0.5" />
      <g stroke={p.main} strokeWidth="3" strokeLinecap="round">
        <path d="M118 289h50m-47 7h44m-40-7v16m35-16v16M392 289h50m-47 7h44m-40-7v16m35-16v16" />
      </g>
      <path d="M118 284h50m224 0h50" stroke={p.light} strokeWidth="3" strokeLinecap="round" />
      <CampusTree x={35} y={248} scale={0.6} />
      <CampusTree x={525} y={246} scale={0.62} />
      {[190, 359].map((x) => (
        <g key={x}>
          <path d={`M${x} 278v-10m0 5-5-4m5 7 5-5`} stroke={p.light} strokeWidth="2" fill="none" />
          <circle cx={x} cy="266" r="3" fill={white} />
          <path d={`M${x - 8} 278h16l-3 11h-10Z`} fill={p.light} />
          <path d={`M${x - 8} 278h16v3h-16Z`} fill={p.lighter} />
        </g>
      ))}
      <g fill={p.lighter} opacity="0.7">
        <path d="m84 307 3-9 3 9 3-6 2 9H81Zm381 3 3-9 3 9 3-6 2 9h-14Z" />
        <circle cx="191" cy="309" r="2" />
        <circle cx="374" cy="313" r="2" />
      </g>
    </g>
  );
}
