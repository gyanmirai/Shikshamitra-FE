import { useTheme } from '@mui/material/styles';

export function RoomBenchIllustration({ width, students }: { width: number; students: number }) {
  const { palette } = useTheme().vars;
  return (
    <g>
      <rect
        x={5}
        y={17}
        width={width}
        height={44}
        rx={6}
        fill={palette.text.primary}
        opacity={0.08}
      />
      <rect x={12} y={51} width={7} height={14} rx={2} fill={palette.text.secondary} />
      <rect x={width - 19} y={51} width={7} height={14} rx={2} fill={palette.text.secondary} />
      <rect
        y={10}
        width={width}
        height={44}
        rx={6}
        fill={palette.background.paper}
        stroke={palette.text.secondary}
        strokeWidth={1.5}
      />
      <rect x={1} y={44} width={width - 2} height={9} rx={3} fill={palette.background.neutral} />
      <path d={`M1 44 H${width - 1}`} stroke={palette.divider} strokeWidth={2} />
      <path d={`M12 19 H${width - 12}`} stroke={palette.divider} strokeWidth={1} />
      <rect
        x={8}
        y={105}
        width={width - 16}
        height={12}
        rx={4}
        fill={palette.background.paper}
        stroke={palette.text.secondary}
      />
      {Array.from({ length: students }, (_, seat) => {
        const x = ((seat + 0.5) * width) / students;
        return (
          <g key={seat} aria-hidden="true">
            <rect
              x={x - 14}
              y={87}
              width={28}
              height={19}
              rx={7}
              fill={palette.background.paper}
              stroke={palette.text.secondary}
            />
            <path
              d={`M${x - 10} 91 L${x - 15} 81 L${x - 12} 62 M${x + 10} 91 L${x + 15} 81 L${x + 12} 62`}
              stroke={palette.text.secondary}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <path
              d={`M${x - 9} 101 V89 Q${x - 9} 81 ${x} 81 Q${x + 9} 81 ${x + 9} 89 V101 Z`}
              fill={palette.text.secondary}
            />
            <circle cx={x} cy={73} r={7} fill={palette.text.primary} />
          </g>
        );
      })}
    </g>
  );
}
