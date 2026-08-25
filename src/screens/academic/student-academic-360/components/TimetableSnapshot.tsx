'use client';

import React, { useMemo } from 'react';
import { Box, Card, Chip, Stack, Typography, CircularProgress } from '@mui/material';
import TimetableBoard from 'src/components/timetable/TimetableBoard';

import { Academic360EmptyState } from './Academic360EmptyState';

import type { Subject, TimeSlot, DayOfWeek } from 'src/components/timetable/types';
import type { Academic360StudentRow } from '../types';

export type TimetableSummaryItem = {
  id?: string;
  name: string;
  code?: string;
  color: string;
  totalSlots: number;
  occupiedSlots: number;
  unoccupiedSlots: number;
  isElective?: boolean;
};

export type TransformedBoardTimetable = {
  boardSlots: Record<DayOfWeek, TimeSlot[]>;
  subjects: Subject[];
  summary: TimetableSummaryItem[];
  totalSlots: number;
  occupiedSlots: number;
  unoccupiedSlots: number;
  hasSlots: boolean;
};

type TimetableSnapshotProps = {
  timetable: unknown;
  isLoading: boolean;
  student?: Academic360StudentRow | null;
};

const DAY_MAP: Record<string, DayOfWeek> = {
  MONDAY: 'MONDAY',
  Monday: 'MONDAY',
  Mon: 'MONDAY',
  mon: 'MONDAY',
  TUESDAY: 'TUESDAY',
  Tuesday: 'TUESDAY',
  Tue: 'TUESDAY',
  tue: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  Wednesday: 'WEDNESDAY',
  Wed: 'WEDNESDAY',
  wed: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  Thursday: 'THURSDAY',
  Thu: 'THURSDAY',
  thu: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  Friday: 'FRIDAY',
  Fri: 'FRIDAY',
  fri: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  Saturday: 'SATURDAY',
  Sat: 'SATURDAY',
  sat: 'SATURDAY',
};

const ALL_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const getDaysMap = (payload: unknown): Record<string, any[]> | null => {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, any>;

  if (p.days && typeof p.days === 'object' && !Array.isArray(p.days)) {
    return p.days as Record<string, any[]>;
  }
  if (p.timetable && typeof p.timetable === 'object') {
    if (p.timetable.days && typeof p.timetable.days === 'object' && !Array.isArray(p.timetable.days)) {
      return p.timetable.days as Record<string, any[]>;
    }
    if (!Array.isArray(p.timetable)) {
      return p.timetable as Record<string, any[]>;
    }
  }
  if (p.data && typeof p.data === 'object') {
    return getDaysMap(p.data);
  }

  const keys = Object.keys(p);
  if (keys.some((k) => DAY_MAP[k])) {
    return p as Record<string, any[]>;
  }

  return null;
};

export const transformToBoardTimetable = (payload: unknown): TransformedBoardTimetable => {
  const emptyBoardSlots: Record<DayOfWeek, TimeSlot[]> = {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
  };

  if (!payload || typeof payload !== 'object') {
    return {
      boardSlots: emptyBoardSlots,
      subjects: [],
      summary: [],
      totalSlots: 0,
      occupiedSlots: 0,
      unoccupiedSlots: 0,
      hasSlots: false,
    };
  }

  const rawObj = payload as Record<string, any>;
  const daysMap = getDaysMap(payload);

  if (!daysMap) {
    // Check if flat array of slots or items
    const flatList: any[] = Array.isArray(payload)
      ? (payload as any[])
      : Array.isArray(rawObj.items)
        ? rawObj.items
        : Array.isArray(rawObj.slots)
          ? rawObj.slots
          : [];

    if (flatList.length === 0) {
      return {
        boardSlots: emptyBoardSlots,
        subjects: [],
        summary: [],
        totalSlots: 0,
        occupiedSlots: 0,
        unoccupiedSlots: 0,
        hasSlots: false,
      };
    }

    const boardSlots: Record<DayOfWeek, TimeSlot[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
    };

    flatList.forEach((slot, index) => {
      const canonicalDay = DAY_MAP[slot.day] || 'MONDAY';
      const isBreak = slot.type === 1 || slot.type === 'BREAK' || slot.isBreak === true;
      const subjectsList = (slot.subjects ?? (slot.subjectName || slot.subject ? [slot] : [])).map((s: any) => ({
        subjectId: s.subjectId || s.id || '',
        subjectAssignmentId: s.subjectAssignmentId || '',
        name: s.name || s.subjectName || s.subject || '',
        color: s.color || s.subjectColor || slot.electiveGroupColor || '#2563EB',
        teacherId: s.teacherId || '',
        teacherName: s.teacherName || s.teacher || '',
        roomId: s.roomId || '',
        roomName: s.roomName || s.room || '',
      }));

      boardSlots[canonicalDay].push({
        id: slot.id || `slot-${canonicalDay}-${slot.sequence ?? index + 1}`,
        sequence: slot.sequence ?? index + 1,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: isBreak ? 'BREAK' : 'LECTURE',
        breakType: slot.breakType === 1 || slot.breakType === 'LUNCH' ? 'LUNCH' : 'SHORT',
        day: canonicalDay,
        subjectType: slot.subjectType ?? (slot.electiveGroupId ? 1 : 0),
        electiveGroupId: slot.electiveGroupId || null,
        electiveGroupName: slot.electiveGroupName || null,
        subjects: subjectsList,
      });
    });

    const totalCount = Object.values(boardSlots).reduce((acc, list) => acc + list.length, 0);
    const occupiedCount = Object.values(boardSlots).reduce(
      (acc, list) => acc + list.filter((s) => s.type === 'LECTURE' && s.subjects && s.subjects.length > 0).length,
      0
    );

    return {
      boardSlots,
      subjects: [],
      summary: [],
      totalSlots: totalCount,
      occupiedSlots: occupiedCount,
      unoccupiedSlots: Math.max(0, totalCount - occupiedCount),
      hasSlots: totalCount > 0,
    };
  }

  // Map each day's array of slots into TimeSlot[]
  const boardSlots: Record<DayOfWeek, TimeSlot[]> = {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
  };

  Object.entries(daysMap).forEach(([rawDayKey, daySlots]) => {
    const canonicalDay = DAY_MAP[rawDayKey];
    if (!canonicalDay || !Array.isArray(daySlots)) return;

    boardSlots[canonicalDay] = daySlots.map((slot: any, index: number) => {
      const isBreak = slot.type === 1 || slot.type === 'BREAK' || slot.isBreak === true;
      const subjectsList = (slot.subjects ?? []).map((s: any) => ({
        subjectId: s.subjectId || s.id || '',
        subjectAssignmentId: s.subjectAssignmentId || '',
        name: s.name || s.subjectName || s.subject || '',
        color: s.color || s.subjectColor || slot.electiveGroupColor || '#2563EB',
        teacherId: s.teacherId || '',
        teacherName: s.teacherName || s.teacher || '',
        roomId: s.roomId || '',
        roomName: s.roomName || s.room || '',
      }));

      return {
        id: slot.id || `slot-${canonicalDay}-${slot.sequence ?? index + 1}`,
        sequence: slot.sequence ?? index + 1,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: isBreak ? 'BREAK' : 'LECTURE',
        breakType: slot.breakType === 1 || slot.breakType === 'LUNCH' ? 'LUNCH' : 'SHORT',
        day: canonicalDay,
        subjectType: slot.subjectType ?? (slot.electiveGroupId ? 1 : 0),
        electiveGroupId: slot.electiveGroupId || null,
        electiveGroupName: slot.electiveGroupName || null,
        subjects: subjectsList,
      };
    });
  });

  // Extract or build Subject[] and summary
  const summary: TimetableSummaryItem[] = [];
  const subjects: Subject[] = [];
  const rawSummaryList = Array.isArray(rawObj.subjectSummary)
    ? rawObj.subjectSummary
    : Array.isArray(rawObj.timetable?.subjectSummary)
      ? rawObj.timetable.subjectSummary
      : [];

  if (rawSummaryList.length > 0) {
    rawSummaryList.forEach((item: any) => {
      const sub0 = item.subjects?.[0];
      const name =
        item.electiveGroupName ||
        sub0?.subjectName ||
        sub0?.name ||
        sub0?.subject ||
        item.subjectName ||
        item.name ||
        'Subject';
      const code = sub0?.subjectCode || sub0?.code || item.subjectCode || '';
      const color = item.color || item.electiveGroupColor || sub0?.color || '#2563EB';

      summary.push({
        id: item.id || item.subjectAssignmentId,
        name,
        code,
        color,
        totalSlots: item.totalSlots ?? 0,
        occupiedSlots: item.occupiedSlots ?? 0,
        unoccupiedSlots: item.unoccupiedSlots ?? 0,
        isElective: item.subjectType === 1 || Boolean(item.electiveGroupId),
      });

      subjects.push({
        subjectId: sub0?.subjectId || item.id || '',
        subjectAssignmentId: item.subjectAssignmentId || '',
        name,
        color,
        teacherId: sub0?.teacherId || '',
        teacherName: sub0?.teacherName || '',
        roomId: sub0?.roomId || '',
        roomName: sub0?.roomName || '',
        totalLectures: item.totalSlots ?? 0,
      });
    });
  } else {
    // Derive from slots
    const subjectMap = new Map<string, { count: number; color: string; code: string; isElective: boolean; teacherName?: string; roomName?: string }>();
    Object.values(boardSlots).forEach((daySlots) => {
      daySlots.forEach((slot) => {
        if (slot.type === 'BREAK') return;
        (slot.subjects || []).forEach((sub) => {
          if (!sub.name) return;
          const existing = subjectMap.get(sub.name);
          if (existing) {
            existing.count += 1;
          } else {
            subjectMap.set(sub.name, {
              count: 1,
              color: sub.color || '#2563EB',
              code: '',
              isElective: Boolean(slot.electiveGroupId),
              teacherName: sub.teacherName,
              roomName: sub.roomName,
            });
          }
        });
      });
    });

    subjectMap.forEach((val, name) => {
      summary.push({
        name,
        code: val.code,
        color: val.color,
        totalSlots: val.count,
        occupiedSlots: val.count,
        unoccupiedSlots: 0,
        isElective: val.isElective,
      });
      subjects.push({
        subjectId: name,
        subjectAssignmentId: name,
        name,
        color: val.color,
        teacherName: val.teacherName,
        roomName: val.roomName,
        totalLectures: val.count,
      });
    });
  }

  const totalSlotCount =
    rawObj.totalSlots ??
    rawObj.timetable?.totalSlots ??
    Object.values(boardSlots).reduce((acc, list) => acc + list.length, 0);

  const occupiedSlotCount =
    rawObj.occupiedSlots ??
    rawObj.timetable?.occupiedSlots ??
    Object.values(boardSlots).reduce(
      (acc, list) => acc + list.filter((s) => s.type === 'LECTURE' && s.subjects && s.subjects.length > 0).length,
      0
    );

  const unoccupiedSlotCount =
    rawObj.unoccupiedSlots ??
    rawObj.timetable?.unoccupiedSlots ??
    Math.max(0, totalSlotCount - occupiedSlotCount);

  const hasSlots = totalSlotCount > 0;

  return {
    boardSlots,
    subjects,
    summary,
    totalSlots: totalSlotCount,
    occupiedSlots: occupiedSlotCount,
    unoccupiedSlots: unoccupiedSlotCount,
    hasSlots,
  };
};

export function TimetableSnapshot({ timetable, isLoading, student }: TimetableSnapshotProps) {
  const { boardSlots, subjects, summary, totalSlots, occupiedSlots, unoccupiedSlots, hasSlots } =
    useMemo(() => transformToBoardTimetable(timetable), [timetable]);

  const standardName = student?.standard || student?.standardName || '';
  const divisionName = student?.division || student?.divisionName || '';

  return (
    <Card variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1">Timetable</Typography>
          <Typography variant="caption" color="text.secondary">
            Class and division weekly timetable schedule
          </Typography>
        </Box>

        {hasSlots && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" variant="outlined" label={`Total Slots: ${totalSlots}`} />
            <Chip size="small" color="primary" variant="soft" label={`Lectures: ${occupiedSlots}`} />
            {unoccupiedSlots > 0 && (
              <Chip
                size="small"
                color="warning"
                variant="soft"
                label={`Breaks / Free: ${unoccupiedSlots}`}
              />
            )}
          </Stack>
        )}
      </Stack>

      {/* Subject Summary Pills */}
      {summary.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          {summary.map((sub, idx) => (
            <Chip
              key={sub.id || `${sub.name}-${idx}`}
              size="small"
              variant="outlined"
              avatar={
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: sub.color || 'primary.main',
                    ml: 0.5,
                  }}
                />
              }
              label={
                sub.totalSlots > 0
                  ? `${sub.name}${sub.code ? ` (${sub.code})` : ''} • ${sub.totalSlots}`
                  : `${sub.name}${sub.code ? ` (${sub.code})` : ''}`
              }
              sx={{
                fontWeight: 500,
                borderColor: `${sub.color}40`,
                bgcolor: `${sub.color}0A`,
              }}
            />
          ))}
        </Stack>
      )}

      {isLoading ? (
        <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      ) : hasSlots ? (
        <Box
          sx={{
            overflowX: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 1.5,
            border: 1,
            borderColor: 'divider',
            p: 0.5,
          }}
        >
          <TimetableBoard
            slots={boardSlots}
            onChange={() => {}}
            subjects={subjects}
            readOnly={true}
            selectedClass={standardName}
            selectedDivision={divisionName}
          />
        </Box>
      ) : (
        <Academic360EmptyState
          icon="mdi:timetable"
          color="info"
          title="No timetable published"
          description="Once a timetable is published for this student's class and division, upcoming classes will show up here."
        />
      )}
    </Card>
  );
}
