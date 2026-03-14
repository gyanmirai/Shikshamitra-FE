'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Select, MenuItem, Typography, FormControl } from '@mui/material';

import { DashboardWidgetWrapper } from '../../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------

type Holiday = {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'national' | 'regional' | 'school';
};

const HOLIDAYS_BY_MONTH: Record<string, Holiday[]> = {
  jan: [
    { id: 'h1', name: 'New Year', date: 'Jan 1', day: 'Wednesday', type: 'national' },
    { id: 'h2', name: 'Makar Sankranti', date: 'Jan 14', day: 'Tuesday', type: 'regional' },
    { id: 'h3', name: 'Republic Day', date: 'Jan 26', day: 'Sunday', type: 'national' },
  ],
  feb: [{ id: 'h4', name: 'Mahashivratri', date: 'Feb 26', day: 'Wednesday', type: 'regional' }],
  mar: [
    { id: 'h5', name: 'Holi', date: 'Mar 14', day: 'Friday', type: 'national' },
    { id: 'h6', name: 'Holi (2nd Day)', date: 'Mar 15', day: 'Saturday', type: 'regional' },
    { id: 'h7', name: 'Annual Sports Day', date: 'Mar 25', day: 'Tuesday', type: 'school' },
  ],
  apr: [
    { id: 'h8', name: 'Good Friday', date: 'Apr 18', day: 'Friday', type: 'national' },
    { id: 'h9', name: 'Easter', date: 'Apr 20', day: 'Sunday', type: 'national' },
    { id: 'h10', name: 'Ram Navami', date: 'Apr 6', day: 'Sunday', type: 'regional' },
  ],
  may: [
    { id: 'h11', name: 'Labour Day', date: 'May 1', day: 'Thursday', type: 'national' },
    { id: 'h12', name: 'Buddha Purnima', date: 'May 12', day: 'Monday', type: 'national' },
  ],
  jun: [{ id: 'h13', name: 'Summer Vacation Start', date: 'Jun 2', day: 'Monday', type: 'school' }],
  jul: [
    { id: 'h14', name: 'Summer Vacation End', date: 'Jul 1', day: 'Tuesday', type: 'school' },
    { id: 'h15', name: 'Muharram', date: 'Jul 6', day: 'Sunday', type: 'national' },
  ],
  aug: [
    { id: 'h16', name: 'Independence Day', date: 'Aug 15', day: 'Friday', type: 'national' },
    { id: 'h17', name: 'Janmashtami', date: 'Aug 16', day: 'Saturday', type: 'regional' },
    { id: 'h18', name: 'Raksha Bandhan', date: 'Aug 9', day: 'Saturday', type: 'regional' },
  ],
  sep: [
    { id: 'h19', name: "Teachers' Day", date: 'Sep 5', day: 'Friday', type: 'school' },
    { id: 'h20', name: 'Ganesh Chaturthi', date: 'Sep 27', day: 'Saturday', type: 'regional' },
  ],
  oct: [
    { id: 'h21', name: 'Gandhi Jayanti', date: 'Oct 2', day: 'Thursday', type: 'national' },
    { id: 'h22', name: 'Dussehra', date: 'Oct 2', day: 'Thursday', type: 'national' },
    { id: 'h23', name: "Children's Day", date: 'Oct 14', day: 'Tuesday', type: 'school' },
    { id: 'h24', name: 'Diwali (Holiday)', date: 'Oct 20', day: 'Monday', type: 'national' },
    { id: 'h25', name: 'Diwali (Holiday)', date: 'Oct 21', day: 'Tuesday', type: 'national' },
  ],
  nov: [
    { id: 'h26', name: 'Diwali Vacation End', date: 'Nov 1', day: 'Saturday', type: 'school' },
    { id: 'h27', name: 'Guru Nanak Jayanti', date: 'Nov 5', day: 'Wednesday', type: 'national' },
  ],
  dec: [
    { id: 'h28', name: 'Christmas', date: 'Dec 25', day: 'Thursday', type: 'national' },
    { id: 'h29', name: 'Winter Vacation Start', date: 'Dec 26', day: 'Friday', type: 'school' },
    { id: 'h30', name: 'New Year Eve', date: 'Dec 31', day: 'Wednesday', type: 'school' },
  ],
};

const MONTHS = [
  { value: 'jan', label: 'January' },
  { value: 'feb', label: 'February' },
  { value: 'mar', label: 'March' },
  { value: 'apr', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'jun', label: 'June' },
  { value: 'jul', label: 'July' },
  { value: 'aug', label: 'August' },
  { value: 'sep', label: 'September' },
  { value: 'oct', label: 'October' },
  { value: 'nov', label: 'November' },
  { value: 'dec', label: 'December' },
];

// Current month index (0-based) → key
const CURRENT_MONTH_KEY = MONTHS[new Date().getMonth()].value;

const TYPE_CONFIG = {
  national: { label: 'National', color: '#1976d2', bg: '#1976d215' },
  regional: { label: 'Regional', color: '#ed6c02', bg: '#ed6c0215' },
  school: { label: 'School', color: '#2e7d32', bg: '#2e7d3215' },
};

// ----------------------------------------------------------------------

function HolidayChip({ type }: { type: 'national' | 'regional' | 'school' }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        height: 18,
        fontSize: '0.6rem',
        fontWeight: 700,
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}40`,
        borderRadius: '6px',
      }}
    />
  );
}

// ----------------------------------------------------------------------

export default function TeacherMonthlyHolidays() {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH_KEY);

  const holidays = HOLIDAYS_BY_MONTH[selectedMonth] || [];

  return (
    <DashboardWidgetWrapper
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:calendar-bold-duotone" width={20} />
          <span>Monthly Holidays</span>
        </Stack>
      }
      action={
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ fontSize: '0.75rem', height: 30 }}
          >
            {MONTHS.map((m) => (
              <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.75rem' }}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
    >
      {holidays.length === 0 ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 3 }}>
          <Iconify
            icon="solar:sun-fog-bold-duotone"
            width={40}
            sx={{ color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            No holidays this month
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={1}>
          {holidays.map((holiday, idx) => (
            <motion.div
              key={holiday.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.06 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: 'background.neutral',
                  border: '1px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: `${theme.palette.primary.main}08`,
                    borderColor: `${theme.palette.primary.main}20`,
                  },
                }}
              >
                {/* Date badge */}
                <Box
                  sx={{
                    minWidth: 46,
                    height: 46,
                    borderRadius: '10px',
                    bgcolor: TYPE_CONFIG[holiday.type].bg,
                    border: `1px solid ${TYPE_CONFIG[holiday.type].color}30`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: TYPE_CONFIG[holiday.type].color,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      lineHeight: 1,
                    }}
                  >
                    {holiday.date.split(' ')[1]}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: TYPE_CONFIG[holiday.type].color,
                      fontSize: '0.6rem',
                      opacity: 0.8,
                    }}
                  >
                    {holiday.date.split(' ')[0]}
                  </Typography>
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}
                    noWrap
                  >
                    {holiday.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {holiday.day}
                  </Typography>
                </Box>

                <HolidayChip type={holiday.type} />
              </Stack>
            </motion.div>
          ))}
        </Stack>
      )}

      {/* Legend */}
      <Stack direction="row" spacing={1.5} mt={1.5} flexWrap="wrap">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <Stack key={key} direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color }} />
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
              {cfg.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}
