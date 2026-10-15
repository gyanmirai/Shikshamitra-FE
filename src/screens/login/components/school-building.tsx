import { useTheme } from '@mui/material/styles';

export function SchoolBuilding() {
  const { vars } = useTheme();
  const p = vars.palette.primary;
  const { white } = vars.palette.common;

  return (
    <g>
      <path d="m450 146 14-9v133l-14 9Z" fill={p.dark} />
      <path d="M107 141h343v130H107Z" fill={p.lighter} />
      <path d="M107 141h13v130h-13Zm330 0h13v130h-13Z" fill={p.light} />
      <path d="M101 133h349l14 8H101Z" fill={p.dark} />
      <path d="M101 133h349v12H101Z" fill={p.main} />
      <path d="M115 123h322l13 10H101Z" fill={p.light} />
      <path d="M120 126h312" stroke={p.lighter} strokeWidth="2" opacity="0.7" />
      <path d="M120 199h317v7H120Z" fill={p.light} />
      <path d="M120 200h317" stroke={white} strokeWidth="2" opacity="0.7" />
      {[129, 209, 336, 422].map((x) => (
        <g key={x} fill={white} opacity="0.65">
          <rect x={x} y="151" width="5" height="43" rx="1" />
          <rect x={x} y="211" width="5" height="45" rx="1" />
        </g>
      ))}
      {[145, 183, 352, 390].map((x) => (
        <g key={x}>
          {[156, 215].map((y) => (
            <g key={y}>
              <rect x={x - 2} y={y - 2} width="29" height="39" rx="3" fill={white} />
              <rect x={x} y={y} width="25" height="34" rx="2" fill={p.darker} />
              <path d={`M${x + 3} ${y + 3}h19v13h-19Z`} fill={p.dark} />
              <path
                d={`m${x + 5} ${y + 13} 9-8m-4 12 9-8`}
                stroke={p.lighter}
                strokeWidth="2"
                opacity="0.45"
              />
              <path d={`M${x + 12.5} ${y}v34m-12.5-17h25`} stroke={p.light} strokeWidth="2" />
              <rect
                x={x - 4}
                y={y + 35}
                width="33"
                height="4"
                rx="1"
                fill={p.main}
                opacity="0.45"
              />
            </g>
          ))}
        </g>
      ))}
      <path d="M228 103h114v168H228Z" fill={p.dark} opacity="0.3" />
      <path d="M220 104h116v167H220Z" fill={white} />
      <path d="M326 104h10v167h-10Z" fill={p.lighter} />
      <path d="m211 113 69-52 69 52v6H211Z" fill={p.main} />
      <path d="m211 110 69-52 69 52Z" fill={p.light} />
      <path d="m226 107 54-40 54 40Z" fill={p.lighter} />
      <path d="m238 103 42-31 42 31" fill="none" stroke={white} strokeWidth="2" opacity="0.6" />
      <path d="M280 62V28" stroke={p.lighter} strokeWidth="3" strokeLinecap="round" />
      <path d="M282 29h34l-7 10 7 10h-34Z" fill={p.light} />
      <circle cx="280" cy="139" r="26" fill={p.lighter} />
      <circle cx="280" cy="139" r="22" fill={p.main} />
      <circle cx="280" cy="139" r="18" fill={white} />
      {Array.from({ length: 12 }, (_, hour) => (
        <path
          key={hour}
          d="M280 124v2"
          transform={`rotate(${hour * 30} 280 139)`}
          stroke={p.dark}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M280 128v11l8 5"
        stroke={p.darker}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="280" cy="139" r="2" fill={p.main} />
      <rect x="241" y="177" width="78" height="23" rx="3" fill={p.lighter} />
      <path d="M259 183v12l10-2 11 2 11-2 10 2v-12l-10-2-11 2-11-2Z" fill={p.dark} />
      <path d="M280 183v12" stroke={white} strokeWidth="1.5" />
      <path d="M252 269v-35a28 28 0 0 1 56 0v35Z" fill={p.lighter} />
      <path d="M258 269v-35a22 22 0 0 1 44 0v35Z" fill={p.dark} />
      <path d="M263 269v-35a17 17 0 0 1 34 0v35Z" fill={p.darker} />
      <path d="m266 231 11-9m-11 16 11-9" stroke={p.lighter} strokeWidth="2" opacity="0.35" />
      <path d="M280 215v54m-17-29h34" stroke={p.light} strokeWidth="2" />
      <circle cx="274" cy="252" r="1.5" fill={p.lighter} />
      <circle cx="286" cy="252" r="1.5" fill={p.lighter} />
      <path d="M238 268h84v6h-84Zm-8 6h100v6H230Zm-8 6h116v6H222Z" fill={p.light} />
      <path d="M238 274h84m-92 6h100" stroke={p.main} strokeWidth="1" />
    </g>
  );
}
