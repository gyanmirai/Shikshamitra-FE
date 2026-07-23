'use client';

import type { TimeSlot, DayOfWeek } from 'src/components/timetable/types';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store';
import { SlotType } from 'src/components/timetable/types';
import TimetableBoard from 'src/components/timetable/TimetableBoard';
import { useGetLessonPlanTimelineQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

type Props = {
  employeeId?: string;
};

export default function TeacherSchedule({ employeeId }: Props = {}) {
  const { employee } = useSelector((state: any) => state.auth);
  const targetEmployeeId = employeeId || employee?.id || employee?._id;
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const academicDates = useMemo(() => {
    console.log('currentYear', currentYear);

    if (!currentYear) return { startDate: '', endDate: '' };
    return {
      startDate: dayjs(currentYear?.startDate).format('YYYY-MM-DD'),
      endDate: dayjs(currentYear?.endDate).format('YYYY-MM-DD'),
    };
  }, [currentYear]);

  const { data: timelineData, isLoading } = useGetLessonPlanTimelineQuery(
    {
      startDate: academicDates.startDate,
      endDate: academicDates.endDate,
      teacherId: targetEmployeeId,
    },
    { skip: !targetEmployeeId }
  );

  const scheduleSlots = useMemo(() => {
    const result: Record<DayOfWeek, TimeSlot[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
    };

    if (!timelineData) return result;

    const slotsArray = Array.isArray(timelineData) ? timelineData : timelineData.slots;
    if (!slotsArray || !Array.isArray(slotsArray)) return result;

    const seen = new Set<string>();

    slotsArray.forEach((slot: any, index: number) => {
      let day = (slot.day || slot.dayOfWeek || '').toUpperCase();
      if (!day && slot.date) {
        day = dayjs(slot.date).format('dddd').toUpperCase();
      }
      if (!day || !result[day as DayOfWeek]) return;

      const uniqueKey = `${day}-${slot.startTime}-${slot.endTime}-${slot.subjectId}-${slot.standardId}-${slot.divisionId}`;
      if (seen.has(uniqueKey)) return;
      seen.add(uniqueKey);

      result[day as DayOfWeek].push({
        id: slot.timetableSlotId || `${day}-${index}`,
        sequence: index,
        day: day as DayOfWeek,
        startTime: slot.startTime || '00:00',
        endTime: slot.endTime || '00:00',
        type: SlotType.LECTURE,
        subjects: [
          {
            subjectId: slot.subjectId,
            subjectAssignmentId: '',
            name: slot.subjectName || slot.subject?.name || 'Subject',
            color: '#1573b6ff',
            roomId: slot.roomId || 'room-1',
            roomName: slot.roomName || slot.room?.name || 'Room',
            className: slot.standardName || slot.standard?.name || '',
            division: slot.divisionName || slot.division?.name || '',
          },
        ],
        subjectId: slot.subjectId,
      });
    });

    // Sort slots by start time
    Object.keys(result).forEach((dayKey) => {
      result[dayKey as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return result;
  }, [timelineData]);

  return (
    <DashboardWidgetWrapper
      title="Today's Schedule"
      subheader="Week-wise timetable — Subject · Class/Div · Room"
    >
      <TimetableBoard
        slots={scheduleSlots}
        onChange={() => {}}
        subjects={[]}
        readOnly
        selectedClass="10"
        selectedDivision="A"
      />
    </DashboardWidgetWrapper>
  );
}
