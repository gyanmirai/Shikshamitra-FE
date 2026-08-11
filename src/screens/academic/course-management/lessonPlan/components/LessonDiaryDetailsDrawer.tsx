'use client';

import type { ReactNode } from 'react';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import Drawer from '@mui/material/Drawer';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Button, Typography, IconButton, LinearProgress, Card } from '@mui/material';

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

type AccordionCardProps = {
  icon: string;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
};

const AccordionCard = ({
  icon,
  iconBgColor = 'primary.lighter',
  iconColor = 'primary.main',
  title,
  action,
  children,
  defaultExpanded = true,
}: AccordionCardProps) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    sx={{
      borderRadius: '12px !important',
      bgcolor: 'background.paper',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      '&:before': { display: 'none' },
      '&.Mui-expanded': { margin: 0 },
      overflow: 'hidden',
      boxShadow: 'none',
    }}
  >
    <AccordionSummary
      expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={16} />}
      sx={{
        px: 2,
        py: 0.5,
        minHeight: 48,
        '& .MuiAccordionSummary-content': {
          my: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          mr: 1,
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: iconBgColor,
            color: iconColor,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={16} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {action && (
        <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0, ml: 'auto', mr: 1 }}>
          {action}
        </Box>
      )}
    </AccordionSummary>
    <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
      <Stack spacing={1.5}>{children}</Stack>
    </AccordionDetails>
  </Accordion>
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
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.44)',
            backdropFilter: 'blur(3px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 560 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Lesson & Diary Details
            </Typography>
            <CustomTooltip
              title="Comprehensive overview of lesson plan details and actual teacher diary execution logs."
              placement="right"
              arrow
            >
              <Iconify
                icon={GlobalIcons.info}
                color="info.main"
                width={16}
                height={16}
                sx={{ cursor: 'pointer' }}
              />
            </CustomTooltip>
            {planStatus && (
              <Label color={planStatusColor[planStatus] ?? 'default'} variant="soft">
                Plan: {planStatus}
              </Label>
            )}
            <Label
              color={diary ? (diaryStatusColor[diary.diaryStatus] ?? 'default') : 'default'}
              variant="soft"
            >
              Diary: {diary ? diary.diaryStatus : 'Pending'}
            </Label>
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ color: 'text.secondary', typography: 'caption' }}
          >
            <span>
              {plan.subjectName} &mdash; {plan.chapterName}
            </span>
          </Stack>
        </Stack>

        <IconButton onClick={onClose} sx={{ p: 0.5, color: 'text.secondary' }}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      {/* Content wrapper with scrollbar */}
      <Scrollbar sx={{ flex: 1, '& .simplebar-content': { p: 2 }, p: 1.5 }}>
        <Stack spacing={1.5}>
          {/* Plan Details Accordion */}
        <AccordionCard
          icon="mdi:clipboard-text-outline"
          title="Plan Details"
        >
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} sx={{ mb: 1 }}>
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

          <Stack spacing={1.5}>
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
        </AccordionCard>

        {diary ? (
          <Stack spacing={1.5}>
            {/* Card 1: Core Execution Details Accordion */}
            <AccordionCard
              icon="mdi:calendar-check"
              iconBgColor="primary.lighter"
              iconColor="primary.main"
              title="Core Execution Details"
            >
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
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
            </AccordionCard>

            {/* Card 2: Classroom Metrics & Engagement Accordion */}
            <AccordionCard
              icon="mdi:chart-bar"
              iconBgColor="warning.lighter"
              iconColor="warning.main"
              title="Classroom Metrics & Engagement"
            >
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
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
            </AccordionCard>

            {/* Card 3: Reflections & Takeaways Accordion */}
            <AccordionCard
              icon="mdi:comment-quote"
              iconBgColor="info.lighter"
              iconColor="info.main"
              title="Reflections & Takeaways"
            >
              <TextBlock label="Content Summary" value={diary.actualContentSummary} />
              <TextBlock label="Student Response" value={diary.studentResponse} />
              <TextBlock label="Reflection" value={diary.reflection} />
              <TextBlock label="What Went Well" value={diary.whatWentWell} />
              <TextBlock label="Difficulties Encountered" value={diary.whatWasDifficult} />
            </AccordionCard>

            {/* Card 4: Targeted Student Support Accordion */}
            <AccordionCard
              icon="mdi:account-group"
              iconBgColor="success.lighter"
              iconColor="success.main"
              title="Targeted Student Support & Follow-up"
            >
              <TextBlock label="Students Needing Support" value={diary.studentsNeedingSupport} />
              <TextBlock label="Next Class Follow-up" value={diary.nextClassFollowUp} />
              <TextBlock label="Homework Assigned" value={diary.homeworkAssigned} />
              <TextBlock label="Teacher Remarks" value={diary.teacherRemarks} />
            </AccordionCard>
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
        </Stack>
      </Scrollbar>

      {/* Drawer Footer Actions */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.neutral',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
          size="small"
        >
          Close
        </Button>
      </Box>
    </Drawer>
  );
};

export default LessonDiaryDetailsDrawer;
