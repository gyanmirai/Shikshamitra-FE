'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Alert, Stack, Paper, Button, Typography } from '@mui/material';

import { TimelineTrack } from './timeline/TimelineTrack';
import { TimelineSkeleton } from './timeline/TimelineSkeleton';
import { DayHeaderNavigator } from './timeline/DayHeaderNavigator';

import type { LessonPlanRow } from '../lessonPlanData';
import type { LessonFormState } from './AddLessonPlanModal';

type Props = {
  selectedDate: Dayjs;
  onChangeDate: (date: Dayjs) => void;
  slots: any[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
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

const DailyTimelineTab = ({
  selectedDate,
  onChangeDate,
  slots = [],
  isLoading,
  hasError = false,
  onRetry,
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
  canView = true,
  canManage = true,
}: Props) => (
  <Card
    sx={{
      p: { xs: 1.25, sm: 2 },
      flex: '1 0 auto',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 'var(--shadows-2)',
    }}
  >
    {/* ── 1. Compact Date Navigation Toolbar ── */}
    <DayHeaderNavigator selectedDate={selectedDate} onChangeDate={onChangeDate} />

    {/* ── 3. Main Timeline Area (Cards with Direct Actions, No Attention Banner) ── */}
    {isLoading ? (
      <TimelineSkeleton />
    ) : hasError ? (
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        Failed to load lesson details. Please try again.
      </Alert>
    ) : slots.length === 0 ? (
      /* Empty State */
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 7,
          px: 3,
          borderRadius: 1.5,
          borderStyle: 'dashed',
          bgcolor: 'background.neutral',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <Iconify icon="solar:calendar-minimalistic-bold" width={32} />
        </Box>

        <Typography variant="subtitle1" fontWeight={800} color="text.primary">
          No Lessons Scheduled for Today
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mt: 0.5, mb: 2 }}>
          No teaching periods are assigned for {selectedDate.format('dddd, DD MMMM YYYY')}. Select
          another date above or create a lesson plan.
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<Iconify icon="solar:calendar-bold" width={16} />}
            onClick={() => onChangeDate(dayjs())}
            sx={{ fontWeight: 600 }}
          >
            Go to Today
          </Button>
        </Stack>
      </Paper>
    ) : (
      /* Full-Width Timeline Layout */
      <Stack spacing={1.25} sx={{ flex: 1 }}>
        <TimelineTrack
          slots={slots}
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
      </Stack>
    )}
  </Card>
);

export default DailyTimelineTab;
