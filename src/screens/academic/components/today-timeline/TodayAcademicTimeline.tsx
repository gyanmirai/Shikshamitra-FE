'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { academicPaths } from 'src/constants/academic-menu';
import { Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import { DashboardWidgetWrapper } from 'src/screens/mainDashboard/component/dashboard-widget-wrapper';
import { useGetLessonPlanTimelineQuery } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import { TodayTimelineItem } from './TodayTimelineItem';

const TimelineSkeleton = () => (
  <Stack spacing={1.5} aria-label="Loading today's timeline">
    {[0, 1, 2].map((item) => (
      <Stack key={item} direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="circular" width={36} height={36} />
        <Skeleton variant="rounded" height={64} sx={{ flex: 1 }} />
      </Stack>
    ))}
  </Stack>
);

export function TodayAcademicTimeline({ contextLabel }: { contextLabel?: string }) {
  const [now, setNow] = useState(() => new Date());
  const today = dayjs(now).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
  const { data, isLoading, isFetching, isError, refetch } = useGetLessonPlanTimelineQuery({
    date: today,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <DashboardWidgetWrapper
      title="Today's Timeline"
      subheader={contextLabel || 'Live periods from your timetable and lesson plans'}
      action={
        <Button
          component={Link}
          href={academicPaths.curriculum.lessonPlan}
          size="small"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
        >
          Lesson Plans
        </Button>
      }
      sx={{ minHeight: 300 }}
    >
      {isLoading ? <TimelineSkeleton /> : null}

      {!isLoading && isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Today&apos;s timetable could not be loaded.
        </Alert>
      ) : null}

      {!isLoading && !isError && !data?.slots.length ? (
        <EmptyContent
          filled
          title="No periods scheduled today"
          description="Published timetable periods and lesson plans will appear here."
          action={
            <Button component={Link} href={academicPaths.curriculum.lessonPlan} size="small">
              Open lesson plans
            </Button>
          }
          sx={{ minHeight: 220 }}
          slotProps={{ img: { maxWidth: 96 } }}
        />
      ) : null}

      {!isLoading && !isError && data?.slots.length ? (
        <Stack component="ol" spacing={0} sx={{ p: 0, m: 0, listStyle: 'none' }}>
          {data.slots.map((slot, index) => {
            const isLast = index === data.slots.length - 1;

            return (
              <TodayTimelineItem key={slot.timetableSlotId} slot={slot} now={now} isLast={isLast} />
            );
          })}
        </Stack>
      ) : null}

      {isFetching && !isLoading ? (
        <Typography variant="caption" color="text.secondary" aria-live="polite">
          Refreshing timeline…
        </Typography>
      ) : null}
    </DashboardWidgetWrapper>
  );
}
