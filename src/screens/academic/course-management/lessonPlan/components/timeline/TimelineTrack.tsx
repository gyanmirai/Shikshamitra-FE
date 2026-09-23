'use client';

import type { Dayjs } from 'dayjs';

import React from 'react';
import { Box } from '@mui/material';

import { TimelineLessonItem } from './TimelineLessonItem';

import type { LessonPlanRow } from '../../lessonPlanData';
import type { LessonFormState } from '../AddLessonPlanModal';

type Props = {
  slots: any[];
  selectedDate: Dayjs;
  onAddLesson: (date: Dayjs, prefill?: any) => void;
  onEditLesson: (plan: any) => void;
  onViewDetails: (plan: any) => void;
  onSubmitDiary: (plan: any) => void;
  onSubmitPlan: (planId: string) => void;
  onCreateLesson?: (form: LessonFormState, submitAfterSave: boolean) => void | Promise<void>;
  onCreateHomework?: (plan: any) => void;
  academicYearId?: string;
  academicYearName?: string;
  teacherId?: string;
  teacherName?: string;
  lessonPlans?: LessonPlanRow[];
  canView?: boolean;
  canManage?: boolean;
};

export const TimelineTrack: React.FC<Props> = ({
  slots,
  selectedDate,
  onAddLesson,
  onEditLesson,
  onViewDetails,
  onSubmitDiary,
  onSubmitPlan,
  onCreateLesson,
  onCreateHomework,
  academicYearId,
  academicYearName,
  teacherId,
  teacherName,
  lessonPlans,
  canView,
  canManage,
}) => {
  if (slots.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {slots.map((slot, index) => (
        <TimelineLessonItem
          key={`${selectedDate.format('YYYY-MM-DD')}-${
            slot.timetableSlotId ?? `manual-${slot.lessonPlan?.id ?? slot.lessonPlan?.Id ?? index}`
          }`}
          slot={slot}
          selectedDate={selectedDate}
          onAddLesson={onAddLesson}
          onEditLesson={onEditLesson}
          onViewDetails={onViewDetails}
          onSubmitDiary={onSubmitDiary}
          onSubmitPlan={onSubmitPlan}
          onCreateLesson={onCreateLesson}
          onCreateHomework={onCreateHomework}
          academicYearId={academicYearId}
          academicYearName={academicYearName}
          teacherId={teacherId}
          teacherName={teacherName}
          lessonPlans={lessonPlans}
          canView={canView}
          canManage={canManage}
        />
      ))}
    </Box>
  );
};

export default TimelineTrack;
