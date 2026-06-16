import type { TimetableSlot } from 'src/screens/academic/timetable-schedule-management/timeTable/type';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Box, Card, Typography, CircularProgress } from '@mui/material';
import TimeTableView from 'src/screens/academic/timetable-schedule-management/timeTable/component/timeTableView';
import { useGetTimetableByStandardDivisionQuery } from 'src/redux/academicAPI/timetableApi/timetableManagementApi';

const DAY_ABBREV: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const formatTime = (value: string) => {
  const parsed = dayjs(value, ['HH:mm:ss', 'HH:mm', 'h:mm A'], true);
  return parsed.isValid() ? parsed.format('hh:mm A') : value;
};

const transformToSlots = (timetableData: Record<string, any[]>): TimetableSlot[] => {
  const slotMap = new Map<string, TimetableSlot>();

  Object.entries(timetableData).forEach(([dayName, slots]) => {
    const day = DAY_ABBREV[dayName] ?? dayName;
    (slots ?? []).forEach((slot: any) => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, {
          startTime: formatTime(slot.startTime),
          endTime: formatTime(slot.endTime),
          isBreak: slot.type === 1,
          dayData: [],
        });
      }

      if (slot.type !== 1) {
        const subjects = (slot.subjects ?? []).map((subject: any) => ({
          subject: subject.subjectName ?? subject.subject ?? '',
          teacher: subject.teacherName ?? '',
          room: subject.roomName ?? '',
        }));

        (slotMap.get(key) as TimetableSlot).dayData.push({
          day,
          subjectColor: slot.subjects?.[0]?.subjectColor ?? '#90caf9',
          subjects: subjects.length > 0 ? subjects : [{ subject: '' }],
        });
      }
    });
  });

  return Array.from(slotMap.values()).sort((a, b) => {
    const toMin = (time: string) => {
      const parsed = dayjs(time, 'hh:mm A');
      return parsed.isValid() ? parsed.hour() * 60 + parsed.minute() : 0;
    };
    return toMin(a.startTime) - toMin(b.startTime);
  });
};

interface AcademicTimetableProps {
  standardId?: string;
  divisionId?: string;
}

const AcademicTimetable = ({ standardId, divisionId }: AcademicTimetableProps) => {
  const { data, isLoading } = useGetTimetableByStandardDivisionQuery(
    { standardId: standardId!, divisionId: divisionId! },
    { skip: !standardId || !divisionId }
  );

  const slots = useMemo((): TimetableSlot[] => {
    const raw = data?.timetable ?? data?.data?.timetable;
    if (!raw || typeof raw !== 'object') return [];
    return transformToSlots(raw as Record<string, any[]>);
  }, [data]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Card sx={{ p: 1.5 }}>
        <Typography variant="h6" mb={2}>
          Timetable
        </Typography>
        {slots.length > 0 ? (
          <TimeTableView
            isClassVisible={false}
            isDivisionVisible={false}
            isDrag={false}
            isRoomVisible
            isTeacherVisible
            timeTableData={slots}
            showThreeDots={false}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 6 }}>
            No timetable found.
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default AcademicTimetable;
