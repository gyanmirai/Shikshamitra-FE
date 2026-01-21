import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { IconButton, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { Iconify } from '../iconify';
import { CustomRangeDay } from './CustomRangeDay';
// ----------------------------------------------------------------------

type CalendarPanelProps = {
  calendars?: 1 | 2 | 3;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  hoverDate: Dayjs | null;

  onCalendarSelect: (date: Dayjs) => void;
  onHoverDate: (date: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disablePast?: boolean;
  disableFuture?: boolean;
  disableWeekends?: boolean;
  shouldDisableDate?: (date: Dayjs) => boolean;
};

export function CalendarPanel({
  calendars = 1,
  startDate,
  endDate,
  hoverDate,
  onCalendarSelect,
  onHoverDate,
  minDate,
  maxDate,
  disablePast,
  disableFuture,
  disableWeekends,
  shouldDisableDate,
}: CalendarPanelProps) {
  const theme = useTheme();

  // Base month is the month shown in the first calendar
  // Default to startDate or today
  const [baseMonth, setBaseMonth] = useState<Dayjs>(startDate || dayjs());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Sync base month when startDate changes, but only if it's far away?
  // Or just keep it independent after initial open?
  // Let's keep it independent for now, but initialize it correctly.

  const renderCalendar = (index: number) => {
    const currentMonth = baseMonth.add(index, 'month');

    // Hide navigation buttons logic
    // If calendars > 1:
    // Calendar 1 (index 0): Show Prev, Hide Next
    // Calendar 2 (index 1): Hide Prev, Hide Next (if 3) or Show Next (if 2)
    // Calendar 3 (index 2): Hide Prev, Show Next

    // Simplified:
    // All sync to baseMonth.
    // We only expose navigation on the first and last calendar effectively, but mapped to baseMonth.

    // const handleMonthChange = (newMonth: Dayjs) => {
    //   setBaseMonth(newMonth.subtract(index, 'month'));
    // };

    const handleNextMonth = () => {
      setSlideDirection('right');
      setBaseMonth(baseMonth.add(1, 'month'));
    };

    const handlePrevMonth = () => {
      setSlideDirection('left');
      setBaseMonth(baseMonth.subtract(1, 'month'));
    };

    return (
      <Box
        key={index}
        sx={{
          width: 280, // Reduced from 320
          minHeight: 300, // Reduced from 340
        }}
      >
        {/* Custom Static Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1, px: 2 }}
        >
          {index === 0 ? (
            <IconButton onClick={handlePrevMonth} size="small">
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          ) : (
            <Box sx={{ width: 34 }} />
          )}

          <Typography variant="subtitle1">{currentMonth.format('MMMM YYYY')}</Typography>

          {index === calendars - 1 ? (
            <IconButton onClick={handleNextMonth} size="small">
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </IconButton>
          ) : (
            <Box sx={{ width: 34 }} />
          )}
        </Stack>

        <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: 260 }}>
          {' '}
          {/* Reduced from 280 */}
          <AnimatePresence initial={false} custom={slideDirection === 'right' ? 1 : -1}>
            <motion.div
              key={`${index}-${currentMonth.format('YYYY-MM')}`}
              custom={slideDirection === 'right' ? 1 : -1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              style={{
                position: 'absolute',
                width: '100%',
              }}
            >
              <DateCalendar
                value={null}
                referenceDate={currentMonth}
                // onMonthChange={handleMonthChange} // handled by custom buttons
                slots={{
                  day: CustomRangeDay as any,
                }}
                slotProps={{
                  day: {
                    startDate,
                    endDate,
                    hoverDate,
                    onHoverDate,
                  } as any,
                }}
                onChange={(date) => {
                  if (date) {
                    onCalendarSelect(date);
                  }
                }}
                minDate={minDate}
                maxDate={maxDate}
                disablePast={disablePast}
                disableFuture={disableFuture}
                shouldDisableDate={(date) => {
                  if (disableWeekends) {
                    const day = date.day();
                    if (day === 0 || day === 6) return true;
                  }
                  if (shouldDisableDate) {
                    return shouldDisableDate(date);
                  }
                  return false;
                }}
                sx={{
                  width: '100%',
                  maxHeight: 'unset',
                  // Hide default header completely
                  '.MuiPickersCalendarHeader-root': { display: 'none' },
                  // Fix alignment: ensure the day headers match the margin-less days
                  '.MuiDayCalendar-header': {
                    margin: 0,
                    marginBottom: 1, // Add a little space between S M T... and grid
                  },
                  '.MuiDayCalendar-weekDayLabel': {
                    margin: 0,
                    width: 36, // Match PickersDay size
                    height: 36, // Match PickersDay size
                  },
                  '.MuiPickersDay-root': {
                    width: 36,
                    height: 36,
                  },
                }}
                views={['day']}
              />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    );
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      {' '}
      {/* Explicit spacing, removed mx overriding */}
      {Array.from({ length: calendars }).map((_, i) => renderCalendar(i))}
    </Stack>
  );
}
