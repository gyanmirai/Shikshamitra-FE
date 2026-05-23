import type { TimetableSlot } from 'src/screens/academic/timetable-schedule-management/timeTable/type';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Box, Card, Typography, CircularProgress } from '@mui/material';
import TimeTableView from 'src/screens/academic/timetable-schedule-management/timeTable/component/timeTableView';
import { useGetTimetableByStandardDivisionQuery } from 'src/redux/academicAPI/timetableApi/timetableManagementApi';

const studentTimetable: TimetableSlot[] = [
  {
    startTime: '08:00 AM',
    endTime: '08:40 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#1e88e5',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CS-12',
            teacher: 'Mr. Rao',
            room: 'Computer Lab',
          },
        ],
      },
    ],
  },
  {
    startTime: '08:40 AM',
    endTime: '09:20 AM',
    isBreak: true,
    dayData: [],
  },
  {
    startTime: '09:20 AM',
    endTime: '10:10 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#ab47bc',
        subjects: [
          {
            subject: 'Hindi',
            subjectCode: 'HIN-12',
            teacher: 'Mr. Mehta',
            room: 'Room E-201',
          },
        ],
      },
    ],
  },
  {
    startTime: '10:10 AM',
    endTime: '10:50 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#1e88e5',
        subjects: [
          {
            subject: 'Computer',
            subjectCode: 'CS-12',
            teacher: 'Mr. Rao',
            room: 'Computer Lab',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
    ],
  },
  {
    startTime: '10:50 AM',
    endTime: '11:30 AM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#3949ab',
        subjects: [
          {
            subject: 'English',
            subjectCode: 'ENG-12',
            teacher: 'Ms. Wilson',
            room: 'Room B-203',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
    ],
  },
  {
    startTime: '11:30 AM',
    endTime: '12:00 PM',
    isBreak: true,
    dayData: [],
  },
  {
    startTime: '12:00 PM',
    endTime: '12:30 PM',
    isBreak: false,
    dayData: [
      {
        day: 'Mon',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Tue',
        subjectColor: '#8d6e63',
        subjects: [
          {
            subject: 'Social Science',
            subjectCode: 'SOC-12',
            teacher: 'Mr. Desai',
            room: 'Room C-105',
          },
        ],
      },
      {
        day: 'Wed',
        subjectColor: '#43a047',
        subjects: [
          {
            subject: 'Gujarati',
            subjectCode: 'GUJ-12',
            teacher: 'Ms. Trivedi',
            room: 'Room D-102',
          },
        ],
      },
      {
        day: 'Thu',
        subjectColor: '#00acc1',
        subjects: [
          {
            subject: 'Science',
            subjectCode: 'SCI-12',
            teacher: 'Mrs. Rao',
            room: 'Lab 1',
          },
        ],
      },
      {
        day: 'Fri',
        subjectColor: '#1e88e5',
        subjects: [
          {
            subject: 'Physical Training',
            subjectCode: 'PE-12',
            teacher: 'Coach Vivek',
            room: 'Sports Ground',
          },
        ],
      },
      {
        day: 'Sat',
        subjectColor: '#ffb300',
        subjects: [
          {
            subject: 'Mathematics',
            subjectCode: 'MATH-10',
            teacher: 'Mr. Mathur',
            room: 'Room A-101',
          },
        ],
      },
    ],
  },
];

const DAY_ABBREV: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const formatTime = (t: string): string => {
  const parsed = dayjs(t, 'HH:mm');
  return parsed.isValid() ? parsed.format('hh:mm A') : t;
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
        const subjects = (slot.subjects ?? []).map((s: any) => ({
          subject: s.subjectName ?? s.subject ?? '',
          teacher: s.teacherName ?? '',
          room: s.roomName ?? '',
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
    const toMin = (t: string) => {
      const p = dayjs(t, 'hh:mm A');
      return p.isValid() ? p.hour() * 60 + p.minute() : 0;
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
        <TimeTableView
          isClassVisible={false}
          isDivisionVisible={false}
          isDrag={false}
          isRoomVisible
          isTeacherVisible
          timeTableData={slots}
          showThreeDots={false}
        />
      </Card>
    </Box>
  );
};

export default AcademicTimetable;
