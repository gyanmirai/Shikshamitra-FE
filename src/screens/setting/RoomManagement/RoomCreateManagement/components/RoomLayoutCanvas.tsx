import { useId } from 'react';
import { useTheme } from '@mui/material/styles';

import { RoomBenchIllustration } from './RoomBenchIllustration';

export function RoomLayoutCanvas({
  columns,
  students,
  zoom,
}: {
  columns: number[];
  students: number;
  zoom: number | 'fit';
}) {
  const titleId = useId();
  const benchId = `${titleId}-bench`;
  const { palette } = useTheme().vars;
  const columnWidth = Math.max(190, students * 36 + 44);
  const width = columns.length * columnWidth + 64;
  const height = Math.max(...columns) * 156 + 132;
  const total = columns.reduce((sum, rows) => sum + rows, 0);
  return (
    <svg
      role="img"
      aria-labelledby={titleId}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: 'block',
        width: zoom === 'fit' ? '100%' : `${zoom * 100}%`,
        height: `min(${50 * (zoom === 'fit' ? 1 : zoom)}vh, ${560 * (zoom === 'fit' ? 1 : zoom)}px)`,
        marginInline: 'auto',
        maxWidth: 'none',
      }}
    >
      <title
        id={titleId}
      >{`Room layout: ${columns.map((count, index) => `column ${index + 1} has ${count} benches`).join(', ')}. Each bench seats ${students} students. Total capacity ${total * students}.`}</title>
      <defs>
        <g id={benchId}>
          <RoomBenchIllustration width={columnWidth - 44} students={students} />
        </g>
      </defs>
      <rect
        x={8}
        y={8}
        width={width - 16}
        height={height - 16}
        rx={12}
        fill={palette.background.neutral}
        stroke={palette.divider}
        strokeWidth={2}
      />
      <path
        d={`M32 30 H${width - 32}`}
        stroke={palette.text.secondary}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text
        x={width / 2}
        y={54}
        textAnchor="middle"
        fontSize={22}
        fontWeight={600}
        fill={palette.text.primary}
      >
        Front of room
      </text>
      {columns.map((count, column) => (
        <g key={column} transform={`translate(${column * columnWidth + 54},0)`}>
          <text
            x={(columnWidth - 44) / 2}
            y={92}
            textAnchor="middle"
            fontSize={20}
            fontWeight={600}
            fill={palette.text.primary}
          >
            Column {column + 1}
          </text>
          {Array.from({ length: count }, (_, row) => (
            <g key={row} transform={`translate(0,${row * 156 + 108})`}>
              <use href={`#${benchId}`} />
              <text
                x={(columnWidth - 44) / 2}
                y={137}
                textAnchor="middle"
                fontSize={18}
                fill={palette.text.secondary}
              >
                Bench {row + 1}
              </text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
