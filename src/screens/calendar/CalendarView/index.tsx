'use client';

import type { EventClickArg } from '@fullcalendar/core';

import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CommonCalender from 'src/components/calender';
import { Box, Chip, Button, Divider } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import CalendarViewDialog from './Components/ViewDialog';
import FilterControls, {
  statusOptions,
  eventTypesOptions,
  holidayTypesOptions,
} from './Components/FilterControls';

import type { Filters } from './Components/FilterDialog';

type EventMode = 'offline' | 'online';

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
    title: 'Workshop: React Best Practices',
    type: 'event',
    holidayType: null,
    eventType: 'Workshop',
    startDate: '2025-11-20T14:00:00+05:30',
    endDate: '2025-10-20T16:00:00+05:30',
    description: 'Internal workshop on modern React patterns.',
    audience: 'Frontend Developers',
    mode: 'offline' as EventMode,
    venue: 'Conference Room A',
  },
  {
    id: 5,
    title: 'Parent-Teacher Conference',
    type: 'meeting',
    holidayType: null,
    eventType: 'Conference',
    startDate: '2025-11-05T10:00:00+05:30',
    endDate: '2025-10-05T14:00:00+05:30',
    description: 'Quarterly parent-teacher meeting to discuss student progress.',
    audience: 'Parents & Teachers',
    mode: 'online' as EventMode,
    meetingLink: 'https://meet.example.com/ptc-2025',
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
  {
    id: 7,
    title: 'Annual Sports Day',
    type: 'event',
    holidayType: null,
    eventType: 'Sports',
    startDate: '2025-11-15T09:00:00+05:30',
    endDate: '2025-02-15T17:00:00+05:30',
    description: 'School-wide sports competitions and activities.',
    audience: 'All Students',
    mode: 'offline' as EventMode,
    venue: 'School Playground',
  },
  {
    id: 8,
    title: 'Board Meeting',
    type: 'meeting',
    holidayType: null,
    eventType: 'Meeting',
    startDate: '2025-11-10T15:00:00+05:30',
    endDate: '2025-03-10T17:00:00+05:30',
    description: 'Monthly board meeting to review progress.',
    audience: 'Board Members',
    mode: 'online' as EventMode,
    meetingLink: 'https://meet.example.com/board-meeting',
  },
  {
    id: 9,
    title: 'Holi',
    type: 'holiday',
    holidayType: 'Festival',
    eventType: null,
    startDate: '2025-11-18T00:00:00+05:30',
    endDate: '2025-03-18T23:59:59+05:30',
    description: 'Festival of colors celebrated across India.',
  },
  {
    id: 10,
    title: 'Science Exhibition',
    type: 'event',
    holidayType: null,
    eventType: 'Exhibition',
    startDate: '2025-11-05T10:00:00+05:30',
    endDate: '2025-04-05T16:00:00+05:30',
    description: 'Annual science exhibition for students.',
    audience: 'Students & Parents',
    mode: 'offline' as EventMode,
    venue: 'School Auditorium',
  },
  {
    id: 11,
    title: 'Staff Training',
    type: 'event',
    holidayType: null,
    eventType: 'Training',
    startDate: '2025-11-12T09:00:00+05:30',
    endDate: '2025-05-12T12:00:00+05:30',
    description: 'Training session for staff on new policies.',
    audience: 'All Staff',
    mode: 'offline' as EventMode,
    venue: 'Training Hall',
  },
  {
    id: 12,
    title: 'Summer Vacation',
    type: 'holiday',
    holidayType: 'Vacation',
    eventType: null,
    startDate: '2025-11-01T00:00:00+05:30',
    endDate: '2025-06-30T23:59:59+05:30',
    description: 'School closed for summer vacation.',
  },
  {
    id: 13,
    title: 'Admission Open',
    type: 'event',
    holidayType: null,
    eventType: 'Admission',
    startDate: '2025-11-01T09:00:00+05:30',
    endDate: '2025-07-15T17:00:00+05:30',
    description: 'Admissions open for new academic year.',
    audience: 'Prospective Students',
    mode: 'offline' as EventMode,
    venue: 'School Office',
  },
  {
    id: 14,
    title: 'Teacher Orientation',
    type: 'meeting',
    holidayType: null,
    eventType: 'Orientation',
    startDate: '2025-11-20T10:00:00+05:30',
    endDate: '2025-07-20T12:00:00+05:30',
    description: 'Orientation for new teachers.',
    audience: 'New Teachers',
    mode: 'online' as EventMode,
    meetingLink: 'https://meet.example.com/orientation',
  },
  {
    id: 15,
    title: 'Raksha Bandhan',
    type: 'holiday',
    holidayType: 'Festival',
    eventType: null,
    startDate: '2025-11-19T00:00:00+05:30',
    endDate: '2025-08-19T23:59:59+05:30',
    description: 'Festival celebrating the bond between siblings.',
  },
  {
    id: 16,
    title: 'Math Olympiad',
    type: 'event',
    holidayType: null,
    eventType: 'Competition',
    startDate: '2025-11-10T09:00:00+05:30',
    endDate: '2025-09-10T13:00:00+05:30',
    description: 'Inter-school math olympiad competition.',
    audience: 'Selected Students',
    mode: 'offline' as EventMode,
    venue: 'Math Lab',
  },
  {
    id: 17,
    title: 'Gandhi Jayanti',
    type: 'holiday',
    holidayType: 'National',
    eventType: null,
    startDate: '2025-11-02T00:00:00+05:30',
    endDate: '2025-10-02T23:59:59+05:30',
    description: "Celebration of Mahatma Gandhi's birthday.",
  },
  {
    id: 18,
    title: 'Library Committee Meeting',
    type: 'meeting',
    holidayType: null,
    eventType: 'Meeting',
    startDate: '2025-11-08T11:00:00+05:30',
    endDate: '2025-10-08T12:00:00+05:30',
    description: 'Monthly meeting to discuss library improvements.',
    audience: 'Library Committee',
    mode: 'online' as EventMode,
    meetingLink: 'https://meet.example.com/library-committee',
  },
  {
    id: 19,
    title: "Children's Day",
    type: 'holiday',
    holidayType: 'National',
    eventType: null,
    startDate: '2025-11-14T00:00:00+05:30',
    endDate: '2025-11-14T23:59:59+05:30',
    description: "Celebration of Children's Day in India.",
  },
  {
    id: 20,
    title: 'Coding Bootcamp',
    type: 'event',
    holidayType: null,
    eventType: 'Bootcamp',
    startDate: '2025-11-20T09:00:00+05:30',
    endDate: '2025-11-20T17:00:00+05:30',
    description: 'Full-day coding bootcamp for students.',
    audience: 'Senior Students',
    mode: 'online' as EventMode,
    meetingLink: 'https://meet.example.com/coding-bootcamp',
  },
  {
    id: 21,
    title: 'Christmas',
    type: 'holiday',
    holidayType: 'Festival',
    eventType: null,
    startDate: '2025-11-25T00:00:00+05:30',
    endDate: '2025-12-25T23:59:59+05:30',
    description: 'Christmas holiday.',
  },
  {
    id: 22,
    title: 'New Year Celebration',
    type: 'event',
    holidayType: null,
    eventType: 'Celebration',
    startDate: '2025-11-31T20:00:00+05:30',
    endDate: '2026-01-01T01:00:00+05:30',
    description: 'New Year party for staff and students.',
    audience: 'All',
    mode: 'offline' as EventMode,
    venue: 'School Hall',
  },
  {
    id: 23,
    title: 'Alumni Meet',
    type: 'event',
    holidayType: null,
    eventType: 'Meet',
    startDate: '2025-11-10T16:00:00+05:30',
    endDate: '2025-12-10T19:00:00+05:30',
    description: 'Annual alumni gathering.',
    audience: 'Alumni',
    mode: 'online' as EventMode,
    meetingLink: 'https://meet.example.com/alumni-meet',
  },
  {
    id: 24,
    title: 'Exam Preparation Workshop',
    type: 'event',
    holidayType: null,
    eventType: 'Workshop',
    startDate: '2025-11-05T10:00:00+05:30',
    endDate: '2025-11-05T13:00:00+05:30',
    description: 'Workshop for exam strategies.',
    audience: 'Senior Students',
    mode: 'offline' as EventMode,
    venue: 'Lecture Room 2',
  },
  {
    id: 25,
    title: 'Art Competition',
    type: 'event',
    holidayType: null,
    eventType: 'Competition',
    startDate: '2025-11-25T09:00:00+05:30',
    endDate: '2025-09-25T12:00:00+05:30',
    description: 'School-wide art competition.',
    audience: 'All Students',
    mode: 'offline' as EventMode,
    venue: 'Art Room',
  },
];

const CalendarView = () => {
  const theme = useTheme();
  const [filters, setFilters] = useState<Filters>({
    eventType: eventTypesOptions,
    holidayType: holidayTypesOptions,
    status: statusOptions,
  });
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);

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

  const handleApply = (currentFilters: Filters) => {
    // Applied directly from inline autocomplete controls
    setFilters(currentFilters);
  };

  // Helpers for ALL logic (if 'ALL' is present we treat as no filtering regardless of other items)
  const isAllSelected = (arr: string[]) => arr.includes('ALL');

  // Function to handle removing a filter (ignores when ALL is selected)
  const handleRemoveFilter = (type: keyof Filters, value: string) => {
    setFilters((prevFilters) => {
      const current = prevFilters[type];
      if (isAllSelected(current)) return prevFilters; // nothing to remove
      const next = current.filter((item) => item !== value);
      return { ...prevFilters, [type]: next.length ? next : ['ALL'] };
    });
  };

  // Check if any filters are applied (ALL means not active)
  const hasActiveFilters = Object.values(filters).some(
    (filterArray) => filterArray.length > 0 && !isAllSelected(filterArray)
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: 2 }}>
      <CustomBreadcrumbs
        heading="Calendar View"
        links={[{ name: 'Calendar' }, { name: 'Calendar View' }]}
        sx={{ mb: 2 }}
      />

      {/* Inline filter controls */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FilterControls filters={filters} onChange={handleApply} />
      </Box>

      {/* Display active filters - grouped blocks */}
      {hasActiveFilters && (
        <Box
          sx={{
            display: 'flex',
            // flexDirection: 'column',
            gap: 1.5,
            mb: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {filters.eventType.length > 0 && !isAllSelected(filters.eventType) && (
            <FilterGroupBlock
              title="Events"
              color="primary"
              items={filters.eventType}
              onDelete={(v) => handleRemoveFilter('eventType', v)}
              chipColor="primary"
            />
          )}
          {filters.holidayType.length > 0 && !isAllSelected(filters.holidayType) && (
            <FilterGroupBlock
              title="Holidays"
              color="error"
              items={filters.holidayType}
              onDelete={(v) => handleRemoveFilter('holidayType', v)}
              chipColor="error"
            />
          )}
          {filters.status.length > 0 && !isAllSelected(filters.status) && (
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
              onClick={() =>
                setFilters({ eventType: ['ALL'], holidayType: ['ALL'], status: ['ALL'] })
              }
            >
              Clear All (
              {filters.eventType.length + filters.holidayType.length + filters.status.length})
            </Button>
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      <CommonCalender
        data={calendarData}
        showCalendarToolbar
        onDateClick={(e) => {
          handleEventClick(e);
        }}
        // Drawer filter removed; inline controls used instead
        showCalendarFilter={false}
        containerProps={{
          sx: {
            height: '100%',
          },
        }}
        canReset={hasActiveFilters}
        nowIndicator
      />

      <CalendarViewDialog
        open={Boolean(currentDateClick)}
        onClose={() => setCurrentDateClick(null)}
        data={currentDateClick}
      />
      {/* Removed FilterDialog drawer; replaced by inline FilterControls */}
    </Box>
  );
};

export default CalendarView;

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
          // minWidth: 90,
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 600,
          // color: theme.palette[color].main,
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
