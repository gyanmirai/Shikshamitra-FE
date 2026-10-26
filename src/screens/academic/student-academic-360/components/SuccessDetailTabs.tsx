'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import {
  Box,
  Tab,
  Card,
  Chip,
  Tabs,
  Stack,
  Typography,
} from '@mui/material';
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineConnector,
  TimelineSeparator,
  TimelineOppositeContent,
} from '@mui/lab';

import { TimetableSnapshot } from './TimetableSnapshot';
import { AttendanceCalendar } from './AttendanceCalendar';
import { AttendanceMonthlyList } from './AttendanceMonthlyList';
import { Academic360EmptyState } from './Academic360EmptyState';
import { AcademicInsightSections } from './AcademicInsightSections';
import { Academic360SectionHeader } from './Academic360SectionHeader';
import { ExamsResultsDashboardCard } from './ExamsResultsDashboardCard';

import type { Academic360Response, Academic360StudentRow, Academic360TimelineEvent } from '../types';

type SuccessDetailTabsProps = {
  data?: Academic360Response;
  activeTab: string;
  isLoading: boolean;
  student?: Academic360StudentRow | null;
};

const timelineDotColor = (type?: string) => {
  const normalized = (type || '').toLowerCase();
  if (normalized.includes('alert') || normalized.includes('concern')) return 'error';
  if (normalized.includes('exam') || normalized.includes('result')) return 'warning';
  if (normalized.includes('achievement') || normalized.includes('award')) return 'success';
  if (normalized.includes('attendance')) return 'info';
  return 'primary';
};

type TimelineFilter = 'All' | 'Exam' | 'Alert' | 'Attendance' | 'Achievement';

const TIMELINE_FILTERS: TimelineFilter[] = ['All', 'Exam', 'Alert', 'Attendance', 'Achievement'];

const matchesTimelineFilter = (event: Academic360TimelineEvent, filter: TimelineFilter): boolean => {
  if (filter === 'All') return true;
  const t = (event.type || '').toLowerCase();
  switch (filter) {
    case 'Exam': return t.includes('exam') || t.includes('result');
    case 'Alert': return t.includes('alert') || t.includes('concern');
    case 'Attendance': return t.includes('attendance');
    case 'Achievement': return t.includes('achievement') || t.includes('award');
    default: return true;
  }
};

const filterColor = (f: TimelineFilter): 'default' | 'primary' | 'warning' | 'error' | 'info' | 'success' => {
  switch (f) {
    case 'Exam': return 'warning';
    case 'Alert': return 'error';
    case 'Attendance': return 'info';
    case 'Achievement': return 'success';
    default: return 'default';
  }
};

export function SuccessDetailTabs({ data, activeTab, isLoading, student }: SuccessDetailTabsProps) {
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('All');
  const [attendanceView, setAttendanceView] = useState<'calendar' | 'list'>('calendar');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const matchesDateRange = (eventDate?: string | null) => {
    if (!startDate && !endDate) return true;
    if (!eventDate) return false;
    const date = dayjs(eventDate);
    if (!date.isValid()) return false;

    if (startDate && date.isBefore(startDate, 'day')) return false;
    if (endDate && date.isAfter(endDate, 'day')) return false;
    return true;
  };

  if (activeTab === 'attendance') {
    return (
      <Stack spacing={2}>
        <Academic360SectionHeader
          icon={GlobalIcons.calendar}
          title="Attendance"
          description="Daily attendance history shown as a calendar or monthly list."
        />
        <Tabs
          value={attendanceView}
          onChange={(_e, val) => setAttendanceView(val)}
          sx={{
            mb: 1,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          }}
        >
          <Tab
            value="calendar"
            label="Calendar View"
            icon={<Iconify icon="mdi:calendar-month" width={18} />}
            iconPosition="start"
          />
          <Tab
            value="list"
            label="List View"
            icon={<Iconify icon="mdi:format-list-bulleted" width={18} />}
            iconPosition="start"
          />
        </Tabs>

        {attendanceView === 'calendar' ? (
          <AttendanceCalendar attendance={data?.attendance} />
        ) : (
          <AttendanceMonthlyList attendance={data?.attendance} isLoading={isLoading} />
        )}
      </Stack>
    );
  }

  if (activeTab === 'learning') {
    return <AcademicInsightSections learningTasks={data?.learningTasks} showExams={false} />;
  }

  if (activeTab === 'exams') {
    return (
      <ExamsResultsDashboardCard
        exams={data?.exams}
        isLoading={isLoading}
        student={student}
        fullView
      />
    );
  }

  if (activeTab === 'timetable') {
    return (
      <TimetableSnapshot
        timetable={data?.timetable}
        isLoading={isLoading}
        student={student || data?.student}
      />
    );
  }

  if (activeTab === 'timeline') {
    const events = data?.timeline || [];
    const filteredEvents = events.filter(
      (e) => matchesTimelineFilter(e, timelineFilter) && matchesDateRange(e.date)
    );

    return (
      <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Academic360SectionHeader
            icon={GlobalIcons.history}
            title="Academic Timeline"
            description="Academic events for this student, filtered by event type and date range."
          />
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 2 }}
        >
          {/* Filter chips */}
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {TIMELINE_FILTERS.map((f) => (
              <Chip
                key={f}
                size="small"
                label={f}
                color={timelineFilter === f ? filterColor(f) : 'default'}
                variant={timelineFilter === f ? 'filled' : 'outlined'}
                onClick={() => setTimelineFilter(f)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>

          {/* Date range picker */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 240, minWidth: 200 }}>
              <CustomDateRangePicker
                label="Timeline Date Range"
                value={[startDate, endDate]}
                dateFormat="DD/MM/YYYY"
                onChange={(value) => {
                  setStartDate(value[0]);
                  setEndDate(value[1] ? value[1].endOf('day') : null);
                }}
              />
            </Box>
            {(startDate || endDate) && (
              <Chip
                size="small"
                label="Clear"
                onDelete={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Stack>
        </Stack>

        {filteredEvents.length > 0 ? (
          <Timeline
            sx={{
              m: 0,
              p: 0,
              [`& .MuiTimelineItem-root:before`]: { flex: 0, padding: 0 },
            }}
          >
            {filteredEvents.map((event, index) => (
              <TimelineItem key={`${event.type}-${event.title}-${event.date}`}>
                <TimelineOppositeContent sx={{ flex: 0.22, minWidth: 90, py: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {event.date ? dayjs(event.date).format('DD MMM') : '-'}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={timelineDotColor(event.type)} variant="outlined" />
                  {index < filteredEvents.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip
                      size="small"
                      variant="soft"
                      color={timelineDotColor(event.type)}
                      label={event.type || 'Event'}
                    />
                    <Typography variant="subtitle2">{event.title}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{event.description}</Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Academic360EmptyState
            title={
              timelineFilter === 'All'
                ? startDate || endDate
                  ? 'No events in selected range'
                  : 'No timeline events yet'
                : `No ${timelineFilter} events`
            }
            description="Exams, alerts and achievements will appear here as they happen."
          />
        )}
      </Card>
    );
  }

  // Fallback (should not normally be reached with explicit tabs)
  return (
    <AcademicInsightSections
      learningTasks={data?.learningTasks}
      exams={data?.exams}
    />
  );
}
