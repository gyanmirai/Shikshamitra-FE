'use client';

import type { Dayjs } from 'dayjs';

import React from 'react';
import { Box } from '@mui/material';

import { TimelineLessonItem } from './TimelineLessonItem';

type Props = {
  slots: any[];
  selectedDate: Dayjs;
  onAddLesson: (date: Dayjs, prefill?: any) => void;
  onEditLesson: (plan: any) => void;
  onViewDetails: (plan: any) => void;
  onSubmitDiary: (plan: any) => void;
  onSubmitPlan: (planId: string) => void;
  onCreateHomework?: (plan: any) => void;
};

export const TimelineTrack: React.FC<Props> = ({
  slots,
  selectedDate,
  onAddLesson,
  onEditLesson,
  onViewDetails,
  onSubmitDiary,
  onSubmitPlan,
  onCreateHomework,
}) => {
  if (slots.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {slots.map((slot, index) => (
        <TimelineLessonItem
          key={
            slot.timetableSlotId ??
            `manual-${slot.lessonPlan?.id ?? slot.lessonPlan?.Id ?? index}`
          }
          slot={slot}
          selectedDate={selectedDate}
          onAddLesson={onAddLesson}
          onEditLesson={onEditLesson}
          onViewDetails={onViewDetails}
          onSubmitDiary={onSubmitDiary}
          onSubmitPlan={onSubmitPlan}
          onCreateHomework={onCreateHomework}
        />
      ))}
    </Box>
  );
};

export default TimelineTrack;
