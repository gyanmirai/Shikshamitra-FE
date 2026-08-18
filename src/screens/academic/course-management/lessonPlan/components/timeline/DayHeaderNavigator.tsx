'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  Stack,
  Button,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';

type Props = {
  selectedDate: Dayjs;
  onChangeDate: (date: Dayjs) => void;
  plannedCount?: number;
  totalCount?: number;
  onOpenSummaryDrawer?: () => void;
};

export const DayHeaderNavigator: React.FC<Props> = ({
  selectedDate,
  onChangeDate,
  plannedCount = 0,
  totalCount = 0,
  onOpenSummaryDrawer,
}) => {
  const theme = useTheme();

  const handlePrevDay = () => onChangeDate(selectedDate.subtract(1, 'day').startOf('day'));
  const handleNextDay = () => onChangeDate(selectedDate.add(1, 'day').startOf('day'));
  const handleToday = () => onChangeDate(dayjs().startOf('day'));

  const isToday = selectedDate.isSame(dayjs(), 'day');

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'center' }}
      spacing={1.25}
      sx={{
        p: { xs: 1, sm: 1.25 },
        mb: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      {/* Left: Day Stepper & Date Picker */}
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
        <Tooltip title="Previous Day" arrow>
          <IconButton
            onClick={handlePrevDay}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              border: (t) => `1px solid ${t.palette.divider}`,
              p: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="mdi:chevron-left" width={18} />
          </IconButton>
        </Tooltip>

        <DatePicker
          label="Selected Date"
          value={selectedDate}
          onChange={(newVal) => newVal && onChangeDate(newVal.startOf('day'))}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              size: 'small',
              sx: {
                minWidth: 145,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '& .MuiInputBase-input': {
                  fontWeight: 600,
                  fontSize: 12.5,
                  py: 0.75,
                },
              },
            },
          }}
        />

        <Tooltip title="Next Day" arrow>
          <IconButton
            onClick={handleNextDay}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              border: (t) => `1px solid ${t.palette.divider}`,
              p: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="mdi:chevron-right" width={18} />
          </IconButton>
        </Tooltip>

        <Button
          variant={isToday ? 'contained' : 'outlined'}
          color={isToday ? 'primary' : 'inherit'}
          size="small"
          onClick={handleToday}
          startIcon={<Iconify icon="solar:calendar-bold" width={15} />}
          sx={{
            fontWeight: 700,
            fontSize: 12,
            px: 1.25,
            py: 0.5,
            bgcolor: isToday ? 'primary.main' : 'background.paper',
          }}
        >
          Today
        </Button>
      </Stack>

      {/* Right: Date Label & Day Summary Drawer Action */}
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Iconify icon="solar:calendar-date-bold" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {selectedDate.format('dddd, DD MMMM YYYY')}
          </Typography>
        </Stack>

        {onOpenSummaryDrawer && (
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<Iconify icon="solar:chart-square-bold" width={16} />}
            onClick={onOpenSummaryDrawer}
            sx={{
              fontWeight: 600,
              fontSize: 12,
              bgcolor: 'background.paper',
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            Day Summary
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default DayHeaderNavigator;
