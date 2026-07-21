import type { Dayjs } from 'dayjs';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';

import { Box, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS } from 'src/enums/academic-calendar';

import { getCalendarDayTitle, toDateKey } from './academic-date-picker-utils';

import type { AcademicCalendarDay } from './types';

type Props = PickersDayProps & {
  day: Dayjs;
  calendarDaysByDate?: Record<string, AcademicCalendarDay[]>;
};

export default function AcademicCalendarPickersDay({
  day,
  calendarDaysByDate = {},
  outsideCurrentMonth,
  selected,
  sx,
  ...other
}: Props) {
  const markers = outsideCurrentMonth ? [] : calendarDaysByDate[toDateKey(day)] || [];
  const primaryMarker = markers[0];
  const markerColor = primaryMarker ? DAY_TYPE_COLORS[primaryMarker.dayType] : undefined;
  const markerTitle =
    markers.length > 0
      ? markers
          .map(
            (marker: AcademicCalendarDay) =>
              `${getCalendarDayTitle(marker)} (${DAY_TYPE_LABELS[marker.dayType]})`
          )
          .join(', ')
      : '';

  const dayNode = (
    <Box
      sx={{
        width: 40,
        height: 36,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PickersDay
        day={day}
        selected={selected}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={[
          {
            m: 0,
          },
          markerColor &&
            !selected && {
              fontWeight: 700,
              bgcolor: alpha(markerColor, 0.1),
              '&:hover': {
                bgcolor: alpha(markerColor, 0.18),
              },
              '&:focus': {
                bgcolor: alpha(markerColor, 0.18),
              },
            },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      />
      {markerColor && (
        <Box
          sx={{
            left: '50%',
            bottom: 7,
            width: markers.length > 1 ? 8 : 5,
            height: 5,
            borderRadius: '50%',
            position: 'absolute',
            pointerEvents: 'none',
            transform: 'translateX(-50%)',
            bgcolor: selected ? 'common.white' : markerColor,
            boxShadow: selected ? `0 0 0 1px ${alpha(markerColor, 0.5)}` : 'none',
          }}
        />
      )}
    </Box>
  );

  return markerTitle ? (
    <Tooltip arrow title={markerTitle}>
      {dayNode}
    </Tooltip>
  ) : (
    dayNode
  );
}
