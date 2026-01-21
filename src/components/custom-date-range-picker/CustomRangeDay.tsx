import dayjs, { type Dayjs } from 'dayjs';
import { alpha, styled } from '@mui/material/styles';
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type CustomRangeDayProps = PickersDayProps & {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  hoverDate: Dayjs | null;
  onHoverDate: (date: Dayjs | null) => void;
};

const StyledPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== 'isRangeStart' &&
    prop !== 'isRangeEnd' &&
    prop !== 'isSolidRangeEnd' &&
    prop !== 'isInRange' &&
    prop !== 'isRangeStartOfRow' &&
    prop !== 'isRangeEndOfRow' &&
    prop !== 'isHovered' &&
    prop !== 'isToday' &&
    prop !== 'isPreview',
})<{
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isSolidRangeEnd: boolean;
  isInRange: boolean;
  isRangeStartOfRow: boolean;
  isRangeEndOfRow: boolean;
  isHovered: boolean;
  isToday: boolean;
  isPreview: boolean;
}>(
  ({
    theme,
    isRangeStart,
    isRangeEnd,
    isSolidRangeEnd,
    isInRange,
    isRangeStartOfRow,
    isRangeEndOfRow,
    isHovered,
    isToday,
    isPreview,
  }) => ({
    borderRadius: '50%',

    // Default range styling (Pill Container)
    ...(isInRange && {
      // We use ::before to create the "pill" background/border
      // This allows the circle (the button itself) to sit inside/on top.
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: -1,

        // Conditional Styling:
        // If Preview (finding end date) -> Dashed Border, Transparent BG
        // If Confirmed (range selected) -> Solid Light BG, No Border
        ...(isPreview
          ? {
              borderTop: `1px dashed ${theme.palette.text.disabled}`,
              borderBottom: `1px dashed ${theme.palette.text.disabled}`,
              backgroundColor: 'transparent',
              // Start of Row Cap
              ...(isRangeStartOfRow && {
                borderLeft: `1px dashed ${theme.palette.text.disabled}`,
                borderTopLeftRadius: '50%',
                borderBottomLeftRadius: '50%',
              }),
              // End of Row Cap
              ...(isRangeEndOfRow && {
                borderRight: `1px dashed ${theme.palette.text.disabled}`,
                borderTopRightRadius: '50%',
                borderBottomRightRadius: '50%',
              }),
            }
          : {
              // Confirmed Range -> Solid Light Blue Background
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              // Start of Row Cap
              ...(isRangeStartOfRow && {
                borderTopLeftRadius: '50%',
                borderBottomLeftRadius: '50%',
              }),
              // End of Row Cap
              ...(isRangeEndOfRow && {
                borderTopRightRadius: '50%',
                borderBottomRightRadius: '50%',
              }),
            }),
      },
    }),

    // Style the button/circle itself

    // Start Date: Solid Blue
    ...(isRangeStart && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
      '&:focus': {
        backgroundColor: theme.palette.primary.main,
      },
    }),

    // End Date:
    // If Solid (Verified Selection): Same as Start Date (Solid Blue)
    // If Not Solid (Hovering): Outlined Grey
    ...(isRangeEnd && {
      ...(isSolidRangeEnd
        ? {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            '&:focus': {
              backgroundColor: theme.palette.primary.main,
            },
          }
        : {
            backgroundColor: theme.palette.common.white,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.text.secondary}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.action.hover, 0.08),
            },
          }),
    }),

    // If Start and End are same?
    ...(isRangeStart &&
      isRangeEnd && {
        // If single day range, likely just solid.
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        border: 'none',
      }),

    // Hover effect on the *cell* (not just the range)
    ...(isHovered &&
      !isRangeStart &&
      !isRangeEnd && {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      }),

    // Today Style (Outlined, light bg)
    ...(isToday &&
      !isRangeStart &&
      !isRangeEnd && {
        border: `1px solid ${theme.palette.text.secondary}`,
        backgroundColor: alpha(theme.palette.text.secondary, 0.08),
      }),
  })
);

export function CustomRangeDay({
  day,
  startDate,
  endDate,
  hoverDate,
  onHoverDate,
  ...other
}: CustomRangeDayProps) {
  // 1. Determine the actual interval [start, end]
  let rangeStart: Dayjs | null = null;
  let rangeEnd: Dayjs | null = null;

  if (startDate && endDate) {
    rangeStart = startDate.isBefore(endDate) ? startDate : endDate;
    rangeEnd = startDate.isBefore(endDate) ? endDate : startDate;
  } else if (startDate && hoverDate) {
    rangeStart = startDate.isBefore(hoverDate) ? startDate : hoverDate;
    rangeEnd = startDate.isBefore(hoverDate) ? hoverDate : startDate;
  }

  // 2. Constants for current day
  const isSelectedStartDate = !!startDate && day.isSame(startDate, 'day');
  const isSelectedEndDate = !!endDate && day.isSame(endDate, 'day');
  const isHoveredDate = !!hoverDate && day.isSame(hoverDate, 'day');

  // "Range Start" usually means the anchor (startDate).
  // "Range End" means the target (endDate or hoverDate).
  // But visually, we care about Left-most and Right-most.

  const isVisuallyRangeStart = !!rangeStart && day.isSame(rangeStart, 'day');
  const isVisuallyRangeEnd = !!rangeEnd && day.isSame(rangeEnd, 'day');

  // 3. Is inside the interval (Inclusive)
  let isInRange = false;
  if (rangeStart && rangeEnd) {
    isInRange =
      (day.isAfter(rangeStart, 'day') && day.isBefore(rangeEnd, 'day')) ||
      day.isSame(rangeStart, 'day') ||
      day.isSame(rangeEnd, 'day');
  }

  // 4. Calculate Strip Caps (Row based)
  const isStartOfWeek = day.day() === 0;
  const isEndOfWeek = day.day() === 6;

  // It is the start of the row strip if:
  // - It is the effective start date of the range
  // - OR it is Sunday (and inside the range)
  const isRangeStartOfRow = isInRange && (isVisuallyRangeStart || isStartOfWeek);

  // It is the end of the row strip if:
  // - It is the effective end date of the range
  // - OR it is Saturday (and inside the range)
  const isRangeEndOfRow = isInRange && (isVisuallyRangeEnd || isEndOfWeek);

  const isToday = day.isSame(dayjs(), 'day');

  // Prop mapping:
  // isRangeStart -> Solid Blue (The User's "Start" selection)
  // isRangeEnd -> Outlined Grey (The User's "End" cursor/selection)

  const isSolidAnchor = isSelectedStartDate;
  // If explicitly selected end date, it should be solid.
  // If hovering (preview), it should be outlined.
  const isSolidRangeEnd = isSelectedEndDate;
  const isTargetEndpoint = isSelectedEndDate || (!!startDate && !endDate && isHoveredDate);

  // Decide mode: Preview or Confirmed?
  // It is preview if we are hovering (start exists, end doesn't).
  const isPreview = !!startDate && !endDate && !!hoverDate;

  return (
    <StyledPickersDay
      {...other}
      day={day}
      disableMargin
      isRangeStart={isSolidAnchor}
      isRangeEnd={isTargetEndpoint}
      isSolidRangeEnd={isSolidRangeEnd}
      isInRange={isInRange}
      isPreview={isPreview}
      isRangeStartOfRow={isRangeStartOfRow}
      isRangeEndOfRow={isRangeEndOfRow}
      isHovered={false}
      isToday={isToday}
      onMouseEnter={() => onHoverDate(day)}
      onMouseLeave={() => onHoverDate(null)}
    />
  );
}
