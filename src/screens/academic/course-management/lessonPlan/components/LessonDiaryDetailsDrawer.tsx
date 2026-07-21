'use client';

import type { ReactNode } from 'react';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import Drawer from '@mui/material/Drawer';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Divider, Typography, IconButton, LinearProgress } from '@mui/material';

import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

type Props = {
  open: boolean;
  plan: LessonPlanRow | null;
  diary?: TeacherDiaryRow | null;
  onClose: () => void;
};

type DetailItemProps = {
  label: string;
  value?: string | number | null;
};

const DetailItem = ({ label, value }: DetailItemProps) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value || '-'}
    </Typography>
  </Box>
);

type ProgressRowProps = {
  label: string;
  value?: number | null;
  color?: 'primary' | 'success';
};

const ProgressRow = ({ label, value, color = 'primary' }: ProgressRowProps) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={value ?? 0}
        color={color}
        sx={{ flex: 1, height: 6, borderRadius: 1 }}
      />
      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 36, textAlign: 'right' }}>
        {value ?? 0}%
      </Typography>
    </Stack>
  </Box>
);

const planStatusColor: Record<string, LabelColor> = {
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

const diaryStatusColor: Record<string, LabelColor> = {
  NotSubmitted: 'default',
  Draft: 'default',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'error',
  NeedsChanges: 'warning',
  Backdated: 'info',
  EvidenceMissing: 'error',
};

const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD-MM-YYYY') : '-');

const SectionCard = ({
  icon,
  title,
  action,
  children,
}: {
  icon: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: 2,
      bgcolor: 'background.paper',
      border: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={16} />
        </Box>
        <Typography variant="subtitle2" sx={{ letterSpacing: 0.2 }}>
          {title}
        </Typography>
      </Stack>
      {action}
    </Stack>
    <Stack spacing={1}>{children}</Stack>
  </Box>
);

const LessonDiaryDetailsDrawer = ({ open, plan, diary, onClose }: Props) => {
  if (!plan) return null;

  const planStatus = plan.planStatus || plan.status || '';
  const planReviewRemarks = plan.reviewRemarks?.trim();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, maxWidth: '100%' } }}
    >
      <Stack sx={{ height: 1 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
          <Box>
            <Typography variant="h6">Lesson & Diary Details</Typography>
            <Typography variant="body2" color="text.secondary">
              {plan.subjectName} &mdash; {plan.chapterName}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>

        <Divider />

        {/* Content */}
        <Stack
          spacing={1}
          sx={{ p: 2.5, overflowY: 'auto', flex: 1, bgcolor: 'background.neutral' }}
        >
          {/* Plan Details */}
          <SectionCard
            icon="mdi:clipboard-text-outline"
            title="Plan Details"
            action={
              planStatus ? (
                <Label color={planStatusColor[planStatus] ?? 'default'} variant="soft">
                  {planStatus}
                </Label>
              ) : null
            }
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <DetailItem label="Date" value={formatDate(plan.plannedDate)} />
              <DetailItem label="Period" value={plan.period} />
              <DetailItem label="Time" value={plan.plannedTime} />
              <DetailItem
                label="Class / Division"
                value={
                  plan.className || plan.divisionName
                    ? `${plan.className || '-'}-${plan.divisionName || '-'}`
                    : undefined
                }
              />
            </Stack>

            <DetailItem label="Teacher" value={plan.teacherName} />
            <DetailItem label="Topic" value={plan.topic} />
            <DetailItem label="Learning Objective" value={plan.learningObjective} />
            <DetailItem label="Teaching Method" value={plan.teachingMethod} />
            <DetailItem label="Resources Required" value={plan.resourcesRequired} />

            <ProgressRow label="Planned Completion" value={plan.plannedCompletionPercentage} />

            {planReviewRemarks ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'warning.lighter',
                  border: (theme) => `1px solid ${theme.palette.warning.light}`,
                }}
              >
                <Typography variant="caption" color="warning.dark">
                  Admin Comment
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mt: 0.5 }}>
                  {planReviewRemarks}
                </Typography>
              </Box>
            ) : null}
          </SectionCard>

          {/* Diary Entry */}
          <SectionCard
            icon="mdi:notebook-outline"
            title="Diary Entry"
            action={
              <Label
                color={diary ? (diaryStatusColor[diary.diaryStatus] ?? 'default') : 'default'}
                variant="soft"
              >
                {diary ? diary.diaryStatus : 'Pending'}
              </Label>
            }
          >
            {diary ? (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <DetailItem label="Actual Date" value={formatDate(diary.actualDate)} />
                  <DetailItem label="Class Conducted" value={diary.classConducted ? 'Yes' : 'No'} />
                </Stack>

                <DetailItem
                  label="Actual Topic Covered"
                  value={diary.actualTopicCovered || diary.actualTopicTaught}
                />
                <DetailItem label="Content Summary" value={diary.actualContentSummary} />
                <DetailItem label="Student Response" value={diary.studentResponse} />
                <DetailItem label="Understanding Level" value={diary.classUnderstandingLevel} />
                <DetailItem label="Engagement Level" value={diary.studentEngagementLevel} />
                <DetailItem label="Reflection" value={diary.reflection} />
                <DetailItem label="What Went Well" value={diary.whatWentWell} />
                <DetailItem label="Difficulties" value={diary.whatWasDifficult} />
                <DetailItem label="Students Needing Support" value={diary.studentsNeedingSupport} />
                <DetailItem label="Next Class Follow-up" value={diary.nextClassFollowUp} />
                <DetailItem label="Homework Assigned" value={diary.homeworkAssigned} />
                <DetailItem label="Teacher Remarks" value={diary.teacherRemarks} />

                <ProgressRow
                  label="Actual Completion"
                  value={diary.actualCompletionPercentage}
                  color="success"
                />
              </>
            ) : (
              <Stack
                spacing={1}
                alignItems="center"
                justifyContent="center"
                sx={{
                  py: 4,
                  px: 2,
                  borderRadius: 1.5,
                  border: (theme) => `dashed 1px ${theme.palette.divider}`,
                  bgcolor: 'background.neutral',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                <Iconify icon="mdi:notebook-remove-outline" width={36} sx={{ opacity: 0.6 }} />
                <Typography variant="body2">
                  No diary has been submitted for this lesson yet.
                </Typography>
              </Stack>
            )}
          </SectionCard>
        </Stack>

        <Divider />

        {/* Footer */}
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
          <Button size="small" variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default LessonDiaryDetailsDrawer;
