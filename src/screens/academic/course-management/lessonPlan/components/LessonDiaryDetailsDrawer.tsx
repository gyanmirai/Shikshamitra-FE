'use client';

import type { ReactNode } from 'react';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import Drawer from '@mui/material/Drawer';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Divider, Typography, IconButton, LinearProgress, Card } from '@mui/material';

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

const TextBlock = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={700}
      sx={{ display: 'block', mb: 0.5 }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'background.neutral',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {value || '-'}
      </Typography>
    </Box>
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
      <Stack sx={{ height: 1, overflow: 'hidden' }}>
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
          sx={{ p: 2.5, pb: 4, overflowY: 'auto', flex: 1, bgcolor: 'background.neutral' }}
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
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} sx={{ mb: 1.5 }}>
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
              <Box sx={{ gridColumn: 'span 2' }}>
                <DetailItem label="Teacher" value={plan.teacherName} />
              </Box>
            </Box>

            <Stack spacing={1.5} sx={{ mb: 1.5 }}>
              <TextBlock label="Topic" value={plan.topic} />
              <TextBlock label="Learning Objective" value={plan.learningObjective} />
              <TextBlock label="Teaching Method" value={plan.teachingMethod} />
              <TextBlock label="Resources Required" value={plan.resourcesRequired} />
            </Stack>

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

          {/* Diary Entry Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5, mb: 1, px: 0.5, flexShrink: 0 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'success.lighter',
                  color: 'success.main',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="mdi:notebook-outline" width={16} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Diary Entry
              </Typography>
            </Stack>
            <Label
              color={diary ? (diaryStatusColor[diary.diaryStatus] ?? 'default') : 'default'}
              variant="soft"
            >
              {diary ? diary.diaryStatus : 'Pending'}
            </Label>
          </Stack>

          {diary ? (
            <Stack spacing={1.5}>
              {/* Card 1: Core Execution Details */}
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Iconify icon="mdi:calendar-check" width={18} color="primary.main" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Core Execution Details
                  </Typography>
                </Stack>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Actual Date
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(diary.actualDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Class Conducted
                    </Typography>
                    {diary.classConducted ? (
                      <Label color="success" variant="soft" startIcon={<Iconify icon="mdi:check-circle" />}>
                        Yes
                      </Label>
                    ) : (
                      <Label color="error" variant="soft" startIcon={<Iconify icon="mdi:close-circle" />}>
                        No
                      </Label>
                    )}
                  </Box>
                </Box>
                <TextBlock
                  label="Actual Topic Covered"
                  value={diary.actualTopicCovered || diary.actualTopicTaught}
                />
              </Card>

              {/* Card 2: Classroom Metrics & Engagement */}
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Iconify icon="mdi:chart-bar" width={18} color="warning.main" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Classroom Metrics & Engagement
                  </Typography>
                </Stack>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Understanding Level
                    </Typography>
                    {(() => {
                      const val = diary.classUnderstandingLevel || '';
                      let color: 'success' | 'warning' | 'error' | 'default' = 'default';
                      if (/high/i.test(val)) color = 'success';
                      else if (/medium/i.test(val)) color = 'warning';
                      else if (/low/i.test(val)) color = 'error';
                      return (
                        <Label color={color} variant="soft">
                          {val || '-'}
                        </Label>
                      );
                    })()}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Engagement Level
                    </Typography>
                    {(() => {
                      const val = diary.studentEngagementLevel || '';
                      let color: 'success' | 'warning' | 'error' | 'default' = 'default';
                      if (/high/i.test(val)) color = 'success';
                      else if (/medium/i.test(val)) color = 'warning';
                      else if (/low/i.test(val)) color = 'error';
                      return (
                        <Label color={color} variant="soft">
                          {val || '-'}
                        </Label>
                      );
                    })()}
                  </Box>
                </Box>
                <ProgressRow
                  label="Actual Completion"
                  value={diary.actualCompletionPercentage}
                  color="success"
                />
              </Card>

              {/* Card 3: Reflections & Takeaways */}
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Iconify icon="mdi:comment-quote" width={18} color="info.main" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Reflections & Takeaways
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <TextBlock label="Content Summary" value={diary.actualContentSummary} />
                  <TextBlock label="Student Response" value={diary.studentResponse} />
                  <TextBlock label="Reflection" value={diary.reflection} />
                  <TextBlock label="What Went Well" value={diary.whatWentWell} />
                  <TextBlock label="Difficulties Encountered" value={diary.whatWasDifficult} />
                </Stack>
              </Card>

              {/* Card 4: Targeted Student Support */}
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 2,

                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Iconify icon="mdi:account-group" width={18} color="success.main" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Targeted Student Support & Follow-up
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <TextBlock label="Students Needing Support" value={diary.studentsNeedingSupport} />
                  <TextBlock label="Next Class Follow-up" value={diary.nextClassFollowUp} />
                  <TextBlock label="Homework Assigned" value={diary.homeworkAssigned} />
                  <TextBlock label="Teacher Remarks" value={diary.teacherRemarks} />
                </Stack>
              </Card>
            </Stack>
          ) : (
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                overflow: 'visible',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
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
            </Card>
          )}
          <Box sx={{ height: 24, flexShrink: 0 }} />
        </Stack>

        <Divider />

        {/* Footer */}
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
          <Button size="small" variant="outlined" onClick={onClose} startIcon={<Iconify icon="mdi:close" />}>
            Close
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default LessonDiaryDetailsDrawer;
