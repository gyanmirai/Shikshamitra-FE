'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, Typography, CircularProgress } from '@mui/material';

import { readText } from '../types';
import { Academic360EmptyState } from './Academic360EmptyState';

import type { Academic360Record } from '../types';

type TimetableSnapshotProps = {
  timetable: unknown;
  isLoading: boolean;
};

const extractSlots = (payload: unknown): Academic360Record[] => {
  if (Array.isArray(payload)) return payload as Academic360Record[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Academic360Record;
  if (Array.isArray(record.items)) return record.items as Academic360Record[];
  if (Array.isArray(record.slots)) return record.slots as Academic360Record[];

  const { timetable } = record;
  if (timetable && typeof timetable === 'object') {
    return Object.entries(timetable as Record<string, unknown>).flatMap(([day, value]) =>
      Array.isArray(value)
        ? (value as Academic360Record[]).map((slot) => ({ ...slot, day }))
        : []
    );
  }

  return [];
};

export function TimetableSnapshot({ timetable, isLoading }: TimetableSnapshotProps) {
  const slots = extractSlots(timetable).slice(0, 8);

  return (
    <Card variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle1">Timetable</Typography>
          <Typography variant="caption" color="text.secondary">
            Class and division timetable snapshot
          </Typography>
        </Box>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (theme) => `${theme.palette.info.main}14`,
            color: 'info.main',
          }}
        >
          <Iconify icon="mdi:timetable" width={20} />
        </Box>
      </Stack>

      {isLoading ? (
        <Box sx={{ minHeight: 160, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : slots.length > 0 ? (
        <Stack spacing={1}>
          {slots.map((slot, index) => (
            <Box
              key={`${readText(slot.day)}-${readText(slot.startTime)}-${index}`}
              sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.neutral' }}
            >
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" noWrap>
                  {readText(slot.subjectName ?? slot.subject ?? slot.title, 'Subject')}
                </Typography>
                <Chip size="small" label={readText(slot.day, 'Day')} />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {readText(slot.startTime)} - {readText(slot.endTime)} |{' '}
                {readText(slot.teacherName ?? slot.teacher, 'Teacher pending')}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Academic360EmptyState
          icon="mdi:timetable"
          color="info"
          title="No timetable published"
          description="Once a timetable is published for this student's class and division, upcoming classes will show up here."
          compact
        />
      )}
    </Card>
  );
}
