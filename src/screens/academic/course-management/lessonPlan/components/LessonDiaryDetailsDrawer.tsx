'use client';

import Drawer from '@mui/material/Drawer';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Button, Typography, IconButton } from '@mui/material';

import { StatusBadge } from './LessonDiaryDetailFields';
import { LessonPlanDetailSection } from './LessonPlanDetailSection';
import { TeacherDiaryDetailSections } from './TeacherDiaryDetailSections';

import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

type Props = {
  open: boolean;
  plan: LessonPlanRow | null;
  diary?: TeacherDiaryRow | null;
  onClose: () => void;
};

const LessonDiaryDetailsDrawer = ({ open, plan, diary, onClose }: Props) => {
  if (!plan) return null;

  const planStatus = plan.planStatus || plan.status || '';

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
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
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
                color="text.secondary"
                width={16}
                height={16}
                sx={{ cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {plan.subjectName} &mdash; {plan.chapterName}
          </Typography>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {planStatus && <StatusBadge label="Plan" value={planStatus} />}
            <StatusBadge label="Diary" value={diary ? diary.diaryStatus : 'Pending'} />
          </Stack>
        </Stack>

        <IconButton
          aria-label="Close lesson and diary details"
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      {/* Content wrapper with scrollbar */}
      <Scrollbar
        sx={{
          flex: 1,
          bgcolor: 'background.neutral',
          '& .simplebar-content': { p: 2 },
        }}
      >
        <Stack spacing={1.5}>
          <LessonPlanDetailSection plan={plan} />
          <TeacherDiaryDetailSections diary={diary} />
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
          bgcolor: 'background.paper',
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
