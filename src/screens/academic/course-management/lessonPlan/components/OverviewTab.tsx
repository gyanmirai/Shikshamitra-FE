'use client';

import dayjs from 'dayjs';
import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Divider,
  Typography,
  CardContent,
  LinearProgress,
} from '@mui/material';

import { todayIso, teacherOptions, subjectOptions } from '../lessonPlanData';

import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

type Props = {
  lessonPlans: LessonPlanRow[];
  diaryEntries: TeacherDiaryRow[];
  onGoToReviewQueue: () => void;
  onGoToMissedLessons: () => void;
  onGoToCoverageTracker: () => void;
};

const OverviewTab = ({
  lessonPlans,
  diaryEntries,
  onGoToReviewQueue,
  onGoToMissedLessons,
  onGoToCoverageTracker,
}: Props) => {
  const todayPlans = lessonPlans.filter((p) => p.plannedDate === todayIso);
  const pendingApprovals = lessonPlans.filter((p) => p.planStatus === 'Submitted');
  const missedLessons = diaryEntries.filter((e) => !e.classConducted);
  const syllabusDelayed = lessonPlans.filter(
    (p) => p.plannedCompletionPercentage - p.actualCompletionPercentage > 10
  );

  // Teacher compliance
  const teacherCompliance = teacherOptions.map((teacher) => {
    const plans = lessonPlans.filter((p) => p.teacherName === teacher.value);
    const approved = plans.filter((p) => p.diaryStatus === 'Submitted').length;
    const pending = plans.filter((p) => p.diaryStatus === 'NotSubmitted').length;
    const rate = plans.length ? Math.round((approved / plans.length) * 100) : 0;
    return { teacher: teacher.label, planned: plans.length, approved, pending, compliance: rate };
  });

  // AI Risk Alerts
  const riskAlerts = [
    ...syllabusDelayed.map((p) => ({
      type: 'warning' as const,
      message: `${p.subjectName} - ${p.chapterName} is ${p.plannedCompletionPercentage - p.actualCompletionPercentage}% behind schedule (${p.teacherName})`,
      action: 'Open Delay Report',
      onAction: onGoToCoverageTracker,
    })),
    ...pendingApprovals.slice(0, 3).map((p) => ({
      type: 'info' as const,
      message: `Lesson plan pending approval: ${p.teacherName} — ${p.subjectName} (${p.chapterName})`,
      action: 'Review Now',
      onAction: onGoToReviewQueue,
    })),
    ...missedLessons.slice(0, 2).map((e) => {
      const plan = lessonPlans.find((p) => p.id === e.lessonPlanId);
      return {
        type: 'error' as const,
        message: `Missed lesson: ${plan?.subjectName} — ${plan?.topic} (${plan?.teacherName || 'Unknown'}) on ${e.actualDate}`,
        action: 'Schedule Reschedule',
        onAction: onGoToMissedLessons,
      };
    }),
  ].slice(0, 8);

  return (
    <Stack spacing={2}>
      {/* Teaching Command Center header */}
      <Card sx={{ p: 2, bgcolor: 'primary.darker', color: 'white' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Teaching Command Center
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {dayjs().format('dddd, DD MMMM YYYY')} • Real-time academic execution overview
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {[
              { label: "Today's Plans", value: todayPlans.length, icon: 'mdi:calendar-today' },
              {
                label: 'Pending Reviews',
                value: pendingApprovals.length,
                icon: 'mdi:clipboard-check-outline',
              },
              {
                label: 'Missed Lessons',
                value: missedLessons.length,
                icon: 'mdi:calendar-remove-outline',
              },
              {
                label: 'Syllabus Delayed',
                value: syllabusDelayed.length,
                icon: 'mdi:chart-line-variant',
              },
            ].map((item) => (
              <Box key={item.label} sx={{ textAlign: 'center', minWidth: 80 }}>
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  <Iconify icon={item.icon} width={16} />
                  <Typography variant="h5" fontWeight={700}>
                    {item.value}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Card>

      <Box
        sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}
      >
        {/* Today's lessons */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <Typography variant="subtitle1">Today&apos;s Planned Lessons</Typography>
              <Label color="primary" variant="soft">
                {todayPlans.length}
              </Label>
            </Stack>
            {todayPlans.length === 0 ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                <Iconify
                  icon="mdi:calendar-blank-outline"
                  width={32}
                  sx={{ color: 'text.disabled' }}
                />
                <Typography variant="body2" color="text.secondary">
                  No lessons planned for today.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1}>
                {todayPlans.map((plan) => (
                  <Box
                    key={plan.id}
                    sx={{
                      p: 1.25,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {plan.period} • {plan.subjectName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.className}-{plan.divisionName} • {plan.teacherName}
                        </Typography>
                      </Box>
                      <Stack spacing={0.5} alignItems="flex-end">
                        <Label
                          color={
                            plan.planStatus === 'Approved'
                              ? 'success'
                              : plan.planStatus === 'Submitted'
                                ? 'warning'
                                : 'default'
                          }
                          variant="soft"
                        >
                          {plan.planStatus}
                        </Label>
                        <Label
                          color={plan.diaryStatus === 'Submitted' ? 'info' : 'default'}
                          variant="soft"
                        >
                          {`Diary: ${plan.diaryStatus === 'NotSubmitted' ? 'Pending' : plan.diaryStatus}`}
                        </Label>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* AI Risk Alerts */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Iconify icon="mdi:robot-outline" color="secondary.main" />
              <Typography variant="subtitle1">AI Risk Alerts</Typography>
              {riskAlerts.length > 0 && (
                <Label color="error" variant="soft">
                  {riskAlerts.length}
                </Label>
              )}
            </Stack>
            {riskAlerts.length === 0 ? (
              <Alert severity="success">No risk alerts. Teaching execution looks healthy!</Alert>
            ) : (
              <Stack spacing={1}>
                {riskAlerts.map((alert, i) => (
                  <Alert
                    key={i}
                    severity={alert.type}
                    action={
                      <Button size="small" color="inherit" onClick={alert.onAction}>
                        {alert.action}
                      </Button>
                    }
                    sx={{ '& .MuiAlert-message': { fontSize: 12 } }}
                  >
                    {alert.message}
                  </Alert>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Teacher Compliance */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
            Teacher-wise Diary Compliance
          </Typography>
          <Stack spacing={1.5}>
            {teacherCompliance.map((item) => (
              <Box key={item.teacher}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={500}>
                      {item.teacher}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({item.approved}/{item.planned} diaries submitted)
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {item.pending > 0 && (
                      <Label color="warning" variant="soft">
                        {`${item.pending} pending`}
                      </Label>
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        item.compliance >= 70
                          ? 'success.main'
                          : item.compliance >= 50
                            ? 'warning.main'
                            : 'error.main'
                      }
                    >
                      {item.compliance}%
                    </Typography>
                  </Stack>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={item.compliance}
                  color={
                    item.compliance >= 70 ? 'success' : item.compliance >= 50 ? 'warning' : 'error'
                  }
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Divider />

      {/* Quick actions */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
            Quick Actions
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {[
              {
                label: 'View Review Queue',
                icon: 'mdi:clipboard-check-outline',
                color: 'primary' as const,
                onClick: onGoToReviewQueue,
              },
              {
                label: 'View Missed Lessons',
                icon: 'mdi:calendar-remove-outline',
                color: 'error' as const,
                onClick: onGoToMissedLessons,
              },
              {
                label: 'Coverage Tracker',
                icon: 'mdi:chart-line-variant',
                color: 'warning' as const,
                onClick: onGoToCoverageTracker,
              },
            ].map((item) => (
              <Button
                key={item.label}
                variant="outlined"
                color={item.color}
                size="small"
                startIcon={<Iconify icon={item.icon} />}
                onClick={item.onClick}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Subject-wise planned vs actual */}
      <CustomizableTable
        tableId="overview-subject-progress-table"
        tableTitle="Subject-wise Planned vs Actual Progress"
        data={subjectOptions.map((subject) => {
          const plans = lessonPlans.filter((p) => p.subjectName === subject.value);
          const avgPlanned = plans.length
            ? Math.round(
                plans.reduce((s, p) => s + p.plannedCompletionPercentage, 0) / plans.length
              )
            : 0;
          const avgActual = plans.length
            ? Math.round(plans.reduce((s, p) => s + p.actualCompletionPercentage, 0) / plans.length)
            : 0;
          return {
            subject: subject.label,
            totalPlans: plans.length,
            plannedAverage: avgPlanned,
            actualAverage: avgActual,
            gap: avgActual - avgPlanned,
            status: avgActual >= avgPlanned - 5 ? 'On Track' : 'Delayed',
          };
        })}
        columns={[
          { id: 'subject', label: 'Subject', minWidth: 160 },
          { id: 'totalPlans', label: 'Total Plans', filterType: 'number' as const, minWidth: 110 },
          {
            id: 'plannedAverage',
            label: 'Planned Avg %',
            filterType: 'number' as const,
            minWidth: 130,
            render: (v: any) => `${v}%`,
          },
          {
            id: 'actualAverage',
            label: 'Actual Avg %',
            filterType: 'number' as const,
            minWidth: 130,
            render: (v: any) => `${v}%`,
          },
          {
            id: 'gap',
            label: 'Gap',
            filterType: 'number' as const,
            minWidth: 100,
            render: (v: any) => (
              <Typography
                variant="body2"
                fontWeight={600}
                color={v < 0 ? 'error.main' : 'success.main'}
              >
                {v > 0 ? '+' : ''}
                {v}%
              </Typography>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: 110,
            render: (v: any) => (
              <Label color={v === 'On Track' ? 'success' : 'warning'} variant="soft">
                {v}
              </Label>
            ),
          },
        ]}
      />
    </Stack>
  );
};

export default OverviewTab;
