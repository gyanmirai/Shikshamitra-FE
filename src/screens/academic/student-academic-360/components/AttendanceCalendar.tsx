'use client';

import type { RootState } from 'src/redux/store';
import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CommonCalender from 'src/components/calender';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Box, Card, Chip, Stack, Typography, Divider } from '@mui/material';

import { readOptionalText } from '../types';

import type { Academic360Attendance, Academic360Record } from '../types';

type AttendanceCalendarProps = {
  attendance?: Academic360Attendance;
  isLoading?: boolean;
};

export function AttendanceCalendar({ attendance, isLoading = false }: AttendanceCalendarProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [currentEventClick, setCurrentEventClick] = useState<EventClickArg | null>(null);
  const popover = usePopover();

  const records = attendance?.recentHistory || [];

  // Transform attendance records into FullCalendar events format
  const calendarData = useMemo(() => {
    return records.map((rec: Academic360Record, index: number) => {
      const rawStatus = readOptionalText(rec.status ?? rec.attendanceStatus ?? rec.attendance).toLowerCase();
      const isPresent = rec.isPresent === true || rawStatus === 'present' || rawStatus === 'p';
      const isLeave = rawStatus.includes('leave') || rawStatus === 'l';
      const isHalfDay = rawStatus.includes('half');
      const isHoliday = rawStatus.includes('holiday') || rawStatus === 'h';
      const isAbsent = rawStatus.includes('absent') || rawStatus === 'a';

      let title = 'Present';
      let color = '#2E7D32'; // Green (success)
      let labelColor: 'success' | 'error' | 'warning' | 'info' | 'default' = 'success';

      if (isPresent) {
        title = 'Present';
        color = '#2E7D32';
        labelColor = 'success';
      } else if (isLeave) {
        title = 'Leave';
        color = '#ED6C02';
        labelColor = 'warning';
      } else if (isHalfDay) {
        title = 'Half Day';
        color = '#FF9800';
        labelColor = 'warning';
      } else if (isHoliday) {
        title = 'Holiday';
        color = '#0288D1';
        labelColor = 'info';
      } else if (isAbsent) {
        title = 'Absent';
        color = '#D32F2F';
        labelColor = 'error';
      }

      const dateStr = readOptionalText(rec.date ?? rec.attendanceDate ?? rec.creationTime);
      const parsed = dayjs(dateStr);
      const dateFormatted = parsed.isValid() ? parsed.format('YYYY-MM-DD') : dateStr;

      return {
        id: String(rec.id || `${dateFormatted}-${index}`),
        title,
        start: dateFormatted,
        end: dateFormatted,
        color,
        textColor: '#FFFFFF',
        allDay: true,
        labelColor,
        remarks: readOptionalText(rec.remarks) || '-',
        dateDisplay: parsed.isValid() ? parsed.format('DD MMMM YYYY') : dateStr,
      };
    });
  }, [records]);

  const selectedEventData = useMemo(() => {
    if (!currentEventClick) return null;
    return calendarData.find((item) => item.id === currentEventClick.event.id);
  }, [calendarData, currentEventClick]);

  return (
    <Box sx={{ height: '100%', minHeight: 600 }}>
      <CommonCalender
        data={calendarData}
        isLoading={isLoading}
        onDateClick={(arg) => {
          setCurrentEventClick(arg);
          popover.onOpen(arg.jsEvent as any);
        }}
        initialView="dayGridMonth"
        formate="MMM YYYY"
        containerProps={{
          sx: {
            height: '100%',
            minHeight: '600px',
            borderRadius: 2,
            boxShadow: 'none',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
        views={{
          timeGridWeek: {
            dayHeaderFormat: { weekday: 'short', day: '2-digit' },
          },
          dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'long' },
          },
          dayGridDay: {
            titleFormat: { day: '2-digit', month: 'long', year: 'numeric' },
          },
        }}
        allDaySlot={false}
        viewOptions={[
          { value: 'dayGridMonth', label: 'Month', icon: 'mingcute:calendar-month-line' },
          { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
          { value: 'listWeek', label: 'Agenda', icon: 'fluent:calendar-agenda-24-regular' },
        ]}
        validRange={{
          start: currentYear?.startDate,
          end: currentYear?.endDate,
        }}
      />

      {/* Popover on click of attendance event in calendar */}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={() => {
          popover.onClose();
          setCurrentEventClick(null);
        }}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        {selectedEventData && (
          <Stack spacing={1.5} sx={{ p: 2, minWidth: 220 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography variant="subtitle2">{selectedEventData.dateDisplay}</Typography>
              <Label color={selectedEventData.labelColor} variant="soft">
                {selectedEventData.title}
              </Label>
            </Stack>
            <Divider />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Remarks
              </Typography>
              <Typography variant="body2">{selectedEventData.remarks}</Typography>
            </Box>
          </Stack>
        )}
      </CustomPopover>
    </Box>
  );
}
