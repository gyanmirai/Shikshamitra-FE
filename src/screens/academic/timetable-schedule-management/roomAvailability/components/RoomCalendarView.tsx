'use client';

import { useRef } from 'react';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Chip, Stack, Skeleton, Typography } from '@mui/material';

import { MOCK_RESERVATIONS } from '../roomAvailability.mock';

import type { RoomReservation } from '../types';

const TYPE_COLORS: Record<string, string> = {
  class: '#4caf50',
  practical: '#2196f3',
  exam: '#ff9800',
  meeting: '#9c27b0',
  event: '#00bcd4',
  maintenance: '#f44336',
  other: '#607d8b',
};

const toCalendarEvents = (reservations: RoomReservation[]) =>
  reservations.map((r) => ({
    id: r.id,
    title: `${r.roomName} · ${r.purpose}`,
    start: `${r.date}T${r.startTime}`,
    end: `${r.date}T${r.endTime}`,
    backgroundColor: TYPE_COLORS[r.reservationType] || '#607d8b',
    borderColor: TYPE_COLORS[r.reservationType] || '#607d8b',
    extendedProps: { reservation: r },
  }));

interface RoomCalendarViewProps {
  reservations?: RoomReservation[];
  isLoading?: boolean;
  onEventClick?: (reservation: RoomReservation) => void;
  onSlotClick?: (date: string, startTime: string) => void;
}

export const RoomCalendarView = ({
  reservations = MOCK_RESERVATIONS,
  isLoading = false,
  onEventClick,
  onSlotClick,
}: RoomCalendarViewProps) => {
  const calRef = useRef<FullCalendar>(null);
  const events = toCalendarEvents(reservations);

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={440} sx={{ borderRadius: 1.5 }} />
      </Stack>
    );
  }

  return (
    <Box>
      {/* Type legend */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" fontWeight={700}>
            Reservation Types
          </Typography>
          <CustomTooltip title="Interactive calendar displaying room bookings by date, time slot, and reservation type." arrow placement="right">
            <Iconify icon={GlobalIcons.info} color="info.main" width={16} height={16} sx={{ cursor: 'pointer' }} />
          </CustomTooltip>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <Chip
              key={type}
              size="small"
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              sx={{ bgcolor: `${color}22`, color, borderColor: color, fontSize: 11 }}
              variant="outlined"
            />
          ))}
        </Stack>
      </Stack>

      <Box
        sx={{
          '& .fc': { fontSize: 13 },
          '& .fc-toolbar-title': { fontSize: '1rem !important', fontWeight: 700 },
          '& .fc-button': { textTransform: 'capitalize' },
        }}
      >
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          events={events}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="17:00:00"
          allDaySlot={false}
          eventClick={(info) => {
            const r = info.event.extendedProps.reservation as RoomReservation;
            onEventClick?.(r);
          }}
          dateClick={(info) => {
            const [datePart, timePart] = info.dateStr.split('T');
            onSlotClick?.(datePart, timePart?.slice(0, 5) || '09:00');
          }}
          eventContent={(info) => (
            <Box sx={{ px: 0.5, py: 0.25, overflow: 'hidden' }}>
              <Typography
                variant="caption"
                fontWeight={600}
                noWrap
                display="block"
                sx={{ fontSize: 10 }}
              >
                {info.event.extendedProps.reservation?.roomName}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                display="block"
                sx={{ fontSize: 9, opacity: 0.85 }}
              >
                {info.event.extendedProps.reservation?.purpose}
              </Typography>
            </Box>
          )}
          nowIndicator
          selectable
          selectMirror
        />
      </Box>
    </Box>
  );
};
