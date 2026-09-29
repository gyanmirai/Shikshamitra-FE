'use client';

import Tab from '@mui/material/Tab';
import { useRef, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import { ReviewQueueTabLabel } from './ReviewQueueTabLabel';

const LESSON_PLAN_TABS = [
  { value: 'dailyTimeline', label: 'Daily Timeline', icon: 'mdi:clock-outline' },
  { value: 'lessonList', label: 'Lesson Plans', icon: 'mdi:book-open-outline' },
  { value: 'teacherDiary', label: 'Teacher Diary', icon: 'mdi:notebook-edit-outline' },
  { value: 'reviewQueue', label: 'Review Queue', icon: 'mdi:clipboard-check-outline' },
] as const;

export type LessonPlanTabValue = (typeof LESSON_PLAN_TABS)[number]['value'] | 'weeklyPlanner';

interface LessonPlanNavigationTabsProps {
  value: LessonPlanTabValue;
  canReviewSubmissions: boolean;
  pendingReviewCount: number;
  onChange: (value: LessonPlanTabValue) => void;
}

export function LessonPlanNavigationTabs({
  value,
  canReviewSubmissions,
  pendingReviewCount,
  onChange,
}: LessonPlanNavigationTabsProps) {
  const selectedTabRef = useRef<HTMLDivElement>(null);
  const visibleTabs = LESSON_PLAN_TABS.filter(
    (tab) => tab.value !== 'reviewQueue' || canReviewSubmissions
  );

  useEffect(() => {
    selectedTabRef.current?.scrollIntoView({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [value]);

  return (
    <CustomTabs
      value={value}
      onChange={(_, nextValue) => onChange(nextValue as LessonPlanTabValue)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        flex: 1,
        minWidth: 0,
        '& .MuiTabs-flexContainer': { gap: 1 },
        '& .MuiTabs-indicator': { display: 'none' },
        '& .MuiTab-root': {
          gap: 0.75,
          px: 1.5,
          minWidth: 'auto',
          minHeight: 40,
          borderRadius: 1,
          color: 'text.secondary',
          '&.Mui-selected': {
            color: 'text.primary',
            bgcolor: 'action.selected',
          },
        },
      }}
      role="tablist"
    >
      {visibleTabs.map((tab) => (
        <Tab
          key={tab.value}
          ref={tab.value === value ? selectedTabRef : undefined}
          value={tab.value}
          iconPosition="start"
          label={
            tab.value === 'reviewQueue' ? (
              <ReviewQueueTabLabel pendingCount={pendingReviewCount} />
            ) : (
              tab.label
            )
          }
          icon={<Iconify icon={tab.icon} width={20} />}
        />
      ))}
    </CustomTabs>
  );
}
