'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Menu,
  Stack,
  Button,
  Divider,
  MenuItem,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

import { weekDays, weekStartIso } from '../lessonPlanData';

import type { LessonPlanRow } from '../lessonPlanData';

const planStatusColor: Record<
  string,
  'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'
> = {
  Draft: 'default',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'error',
  NeedsChanges: 'warning',
  Missed: 'error',
  Rescheduled: 'info',
  Cancelled: 'default',
  AutoCreated: 'info',
  AiGenerated: 'secondary',
};

type Props = {
  lessonPlans: LessonPlanRow[];
  onAddLesson: (date: Dayjs) => void;
  onEditLesson: (plan: LessonPlanRow) => void;
  onSubmitDiary: (plan: LessonPlanRow) => void;
  onMarkMissed: (plan: LessonPlanRow) => void;
  onCreateFromTimetable: (date: Dayjs) => void;
  onCopyPreviousWeek: () => void;
  onSubmitWeekPlan: (plans: LessonPlanRow[]) => void;
};

const WeeklyPlannerTab = ({
  lessonPlans,
  onAddLesson,
  onEditLesson,
  onSubmitDiary,
  onMarkMissed,
  onCreateFromTimetable,
  onCopyPreviousWeek,
  onSubmitWeekPlan,
}: Props) => {
  const [weekStart, setWeekStart] = useState<Dayjs | null>(dayjs(weekStartIso));
  const [cardMenuAnchor, setCardMenuAnchor] = useState<{
    el: HTMLElement;
    plan: LessonPlanRow;
  } | null>(null);

  const openCardMenu = (el: HTMLElement, plan: LessonPlanRow) => setCardMenuAnchor({ el, plan });
  const closeCardMenu = () => setCardMenuAnchor(null);

  const weekDraftPlans = lessonPlans.filter((p) => {
    const start = (weekStart || dayjs(weekStartIso)).format('YYYY-MM-DD');
    const end = (weekStart || dayjs(weekStartIso)).add(6, 'day').format('YYYY-MM-DD');
    return p.plannedDate >= start && p.plannedDate <= end && p.planStatus === 'Draft';
  });

  const diaryColor = (status: string) => {
    if (status === 'Approved') return 'success';
    if (status === 'Submitted') return 'warning';
    if (status === 'Rejected') return 'error';
    return 'default';
  };

  return (
    <Card sx={{ p: 2 }}>
      {/* Week selector header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <DatePicker
            label="Week Starting"
            value={weekStart}
            onChange={setWeekStart}
            slotProps={{ textField: { size: 'small', sx: { maxWidth: 180 } } }}
          />
          <Button size="small" variant="outlined" onClick={() => setWeekStart(dayjs(weekStartIso))}>
            This Week
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:content-copy" />}
            onClick={onCopyPreviousWeek}
          >
            Copy Previous Week
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:send-outline" />}
            disabled={weekDraftPlans.length === 0}
            onClick={() => onSubmitWeekPlan(weekDraftPlans)}
          >
            Submit Week Plan ({weekDraftPlans.length})
          </Button>
        </Stack>
      </Stack>

      {/* Day grid */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            xl: 'repeat(3, 1fr)',
          },
        }}
      >
        {weekDays.map((day, index) => {
          const date = (weekStart || dayjs(weekStartIso)).add(index, 'day');
          const dateStr = date.format('YYYY-MM-DD');
          const isToday = dateStr === dayjs().format('YYYY-MM-DD');
          const plansForDay = lessonPlans
            .filter((p) => p.plannedDate === dateStr)
            .sort((a, b) => a.period.localeCompare(b.period));

          return (
            <Card
              key={day}
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                borderColor: isToday ? 'primary.main' : 'divider',
                borderWidth: isToday ? 2 : 1,
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                {/* Day header */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {day}
                      </Typography>
                      {isToday && (
                        <Label color="primary" variant="filled" sx={{ height: 18, fontSize: 10 }}>
                          Today
                        </Label>
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {date.format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    title="Add lesson for this day"
                    onClick={() => onAddLesson(date)}
                    color="primary"
                  >
                    <Iconify icon="mdi:plus-circle-outline" />
                  </IconButton>
                </Stack>

                {/* Lessons or empty state */}
                <Stack spacing={1}>
                  {plansForDay.length === 0 ? (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 1 }}
                      >
                        No lesson planned
                      </Typography>
                      <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<Iconify icon="mdi:plus" width={14} />}
                          onClick={() => onAddLesson(date)}
                          sx={{ fontSize: 11 }}
                        >
                          Add Lesson
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<Iconify icon="mdi:timetable" width={14} />}
                          onClick={() => onCreateFromTimetable(date)}
                          sx={{ fontSize: 11 }}
                        >
                          From Timetable
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    plansForDay.map((plan) => (
                      <Box
                        key={plan.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor:
                            plan.executionStatus === 'Missed' ? 'error.light' : 'divider',
                          bgcolor:
                            plan.executionStatus === 'Missed'
                              ? 'error.lighter'
                              : 'background.paper',
                        }}
                      >
                        {/* Period + Status row */}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                              {plan.period}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              • {plan.plannedTime}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.5}>
                            <Label
                              color={planStatusColor[plan.planStatus] || 'default'}
                              variant="soft"
                              sx={{ height: 18, fontSize: 10 }}
                            >
                              {plan.planStatus}
                            </Label>
                            {plan.isAiGenerated && (
                              <Label
                                color="secondary"
                                variant="soft"
                                sx={{ height: 18, fontSize: 10 }}
                              >
                                AI
                              </Label>
                            )}
                          </Stack>
                        </Stack>

                        {/* Subject + Chapter */}
                        <Typography variant="body2" fontWeight={500}>
                          {plan.subjectName} — {plan.chapterName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {plan.topic}
                        </Typography>

                        {/* Progress + Diary row */}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mt: 0.75 }}
                        >
                          <Stack spacing={0.25}>
                            <Typography variant="caption" color="text.secondary">
                              Progress: {plan.actualCompletionPercentage}% /{' '}
                              {plan.plannedCompletionPercentage}%
                            </Typography>
                            <Label
                              color={diaryColor(plan.diaryStatus) as any}
                              variant="soft"
                              sx={{ height: 18, fontSize: 10 }}
                            >
                              {`Diary: ${plan.diaryStatus === 'NotSubmitted' ? 'Pending' : plan.diaryStatus}`}
                            </Label>
                          </Stack>
                          <IconButton
                            size="small"
                            onClick={(e) => openCardMenu(e.currentTarget, plan)}
                          >
                            <Iconify icon="mdi:dots-vertical" width={16} />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Card actions menu */}
      <Menu
        anchorEl={cardMenuAnchor?.el}
        open={Boolean(cardMenuAnchor)}
        onClose={closeCardMenu}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (cardMenuAnchor) onSubmitDiary(cardMenuAnchor.plan);
            closeCardMenu();
          }}
        >
          <Iconify icon="mdi:notebook-edit-outline" width={18} sx={{ mr: 1 }} />
          Create / Edit Diary
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (cardMenuAnchor) onEditLesson(cardMenuAnchor.plan);
            closeCardMenu();
          }}
        >
          <Iconify icon="mdi:pencil-outline" width={18} sx={{ mr: 1 }} />
          Edit Plan
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (cardMenuAnchor) onMarkMissed(cardMenuAnchor.plan);
            closeCardMenu();
          }}
        >
          <Iconify icon="mdi:calendar-remove-outline" width={18} sx={{ mr: 1 }} />
          Mark Missed
        </MenuItem>
        <Divider />
        <MenuItem disabled onClick={closeCardMenu}>
          <Iconify icon="mdi:robot-outline" width={18} sx={{ mr: 1 }} />
          Generate Diary with AI
        </MenuItem>
        <MenuItem disabled onClick={closeCardMenu}>
          <Iconify icon="mdi:calendar-arrow-right" width={18} sx={{ mr: 1 }} />
          Reschedule
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default WeeklyPlannerTab;
