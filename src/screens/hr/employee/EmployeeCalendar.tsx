'use client';

import type { EventClickArg } from '@fullcalendar/core';

import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonCalender from 'src/components/calender';

interface EmployeeCalendarProps {
  employee?: any;
}

type EventMode = 'offline' | 'online';

interface Filters {
  eventType: string[];
  holidayType: string[];
  status: string[];
}

const data = [
  {
    id: 1,
    title: 'Independence Day',
    type: 'holiday',
    holidayType: 'National',
    eventType: null,
    startDate: '2025-11-15T00:00:00+05:30',
    endDate: '2025-10-15T23:59:59+05:30',
    description: "National holiday celebrating India's independence.",
  },
  {
    id: 2,
    title: 'Team Meeting',
    type: 'event',
    holidayType: null,
    eventType: 'Meeting',
    startDate: '2025-11-10T10:00:00+05:30',
    endDate: '2025-10-10T11:00:00+05:30',
    description: 'Quarterly team sync to discuss roadmap and goals.',
    audience: 'Development Team',
    mode: 'online' as EventMode,
    meetingLink: 'https://meet.example.com/team-meeting',
  },
  {
    id: 3,
    title: 'Diwali',
    type: 'holiday',
    holidayType: 'Festival',
    eventType: null,
    startDate: '2025-11-01T00:00:00+05:30',
    endDate: '2025-10-01T23:59:59+05:30',
    description: 'Festival of lights celebrated across India.',
  },
  {
    id: 4,
    title: 'Staff Training Session',
    type: 'event',
    holidayType: null,
    eventType: 'Training',
    startDate: '2025-11-20T14:00:00+05:30',
    endDate: '2025-10-20T16:00:00+05:30',
    description: 'Professional development training for staff.',
    audience: 'All Staff',
    mode: 'offline' as EventMode,
    venue: 'Training Hall',
  },
  {
    id: 5,
    title: 'Department Meeting',
    type: 'meeting',
    holidayType: null,
    eventType: 'Meeting',
    startDate: '2025-11-05T10:00:00+05:30',
    endDate: '2025-10-05T14:00:00+05:30',
    description: 'Monthly department review meeting.',
    audience: 'Department Heads',
    mode: 'online' as EventMode,
    meetingLink: 'https://meet.example.com/dept-meeting',
  },
  {
    id: 6,
    title: 'Republic Day',
    type: 'holiday',
    holidayType: 'National',
    eventType: null,
    startDate: '2025-11-26T00:00:00+05:30',
    endDate: '2025-01-26T23:59:59+05:30',
    description: "Celebration of India's Republic Day.",
  },
];

const EmployeeCalendar = ({ employee }: EmployeeCalendarProps) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<Filters>({
    eventType: [],
    holidayType: [],
    status: [],
  });
  const [, setCurrentDateClick] = useState<EventClickArg | null>(null);
  const filterDialog = useBoolean();

  const calendarData = useMemo(
    () =>
      data.map((i: any) => ({
        ...i,
        start: i.startDate,
        color: i.type === 'holiday' ? theme.palette.error.main : theme.vars.palette.success.main,
        end: i.endDate,
        allDay: false,
        textColor:
          i.type === 'holiday' ? theme.palette.error.main : theme.vars.palette.success.main,
        title: i.title,
        description: i.description,
      })) || [],
    [theme.palette.error.main, theme.vars.palette.success.main]
  );

  const handleEventClick = (info: any) => {
    const clickedEvent = data.find((event) => event.id.toString() === info.event.id);
    setCurrentDateClick(clickedEvent as any);
  };

  // const handleApply = (currentFilters: Filters) => {
  //   console.log('Applied filters:', currentFilters);
  //   filterDialog.onFalse();
  //   setFilters(currentFilters);
  // };

  // Function to handle removing a filter
  const handleRemoveFilter = (type: keyof Filters, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [type]: prevFilters[type].filter((item) => item !== value),
    }));
  };

  // Check if any filters are applied
  const hasActiveFilters = Object.values(filters).some((filterArray) => filterArray.length > 0);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: 2 }}>
      {/* Display active filters - grouped blocks */}
      {hasActiveFilters && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            mb: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {filters.eventType.length > 0 && (
            <FilterGroupBlock
              title="Events"
              color="primary"
              items={filters.eventType}
              onDelete={(v) => handleRemoveFilter('eventType', v)}
              chipColor="primary"
            />
          )}
          {filters.holidayType.length > 0 && (
            <FilterGroupBlock
              title="Holidays"
              color="error"
              items={filters.holidayType}
              onDelete={(v) => handleRemoveFilter('holidayType', v)}
              chipColor="error"
            />
          )}
          {filters.status.length > 0 && (
            <FilterGroupBlock
              title="Status"
              color="info"
              items={filters.status}
              onDelete={(v) => handleRemoveFilter('status', v)}
              chipColor="info"
            />
          )}
          <Box>
            <Button
              size="small"
              color="error"
              startIcon={
                <Iconify icon="solar:trash-bin-trash-bold" sx={{ width: '20px', height: '20px' }} />
              }
              onClick={() => setFilters({ eventType: [], holidayType: [], status: [] })}
            >
              Clear All (
              {filters.eventType.length + filters.holidayType.length + filters.status.length})
            </Button>
          </Box>
        </Box>
      )}

      <CommonCalender
        data={calendarData}
        showCalendarToolbar
        onDateClick={(e) => {
          console.log(e);
          handleEventClick(e);
        }}
        showCalendarFilter
        onOPenFiler={() => {
          console.log('open filter');
          filterDialog.onTrue();
        }}
        containerProps={{
          sx: {
            height: '100%',
          },
        }}
        canReset={hasActiveFilters}
        nowIndicator
      />

      {/* View Dialog - You'll need to create this component or import from student version */}
      {/* <CalendarViewDialog
        open={Boolean(currentDateClick)}
        onClose={() => setCurrentDateClick(null)}
        data={currentDateClick}
      /> */}

      {/* Filter Dialog - You'll need to create this component or import from student version */}
      {/* <FilterDialog
        open={filterDialog.value}
        onClose={() => filterDialog.onFalse()}
        handleApply={handleApply}
        filters={filters}
      /> */}
    </Box>
  );
};

export default EmployeeCalendar;

// Group block component for filters
interface FilterGroupBlockProps {
  title: string;
  items: string[];
  onDelete: (value: string) => void;
  color: 'primary' | 'error' | 'info' | 'success' | 'warning' | 'secondary';
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const FilterGroupBlock = ({
  title,
  items,
  onDelete,
  color,
  chipColor = 'primary',
}: FilterGroupBlockProps) => {
  const theme = useTheme();
  if (!items.length) return null;
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1.2,
        p: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        backgroundColor: theme.vars.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {title}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {items.map((item) => (
          <Chip
            key={`${title}-${item}`}
            label={item}
            onDelete={() => onDelete(item)}
            color={chipColor}
            variant="soft"
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};
