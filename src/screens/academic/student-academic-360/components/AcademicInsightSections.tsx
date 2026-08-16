'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, Typography } from '@mui/material';

import { Academic360EmptyState } from './Academic360EmptyState';
import { SubjectPerformanceCard } from './SubjectPerformanceCard';
import { ExamsResultsDashboardCard } from './ExamsResultsDashboardCard';
import { HomeworkAssignmentDashboardCard } from './HomeworkAssignmentDashboardCard';

import type {
  Academic360Alert,
  Academic360ExamResult,
  Academic360LearningTasks,
  Academic360SubjectPerformance,
} from '../types';

type AcademicInsightSectionsProps = {
  learningTasks?: Academic360LearningTasks;
  exams?: Academic360ExamResult[];
  subjectPerformance?: Academic360SubjectPerformance[];
  alerts?: Academic360Alert[];
  showExams?: boolean;
  showHomework?: boolean;
  showSubjectPerformance?: boolean;
};

function SectionHeader({ icon, title, badge }: { icon: string; title: string; badge?: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: (theme) => `${theme.palette.primary.main}14`,
          color: 'primary.main',
        }}
      >
        <Iconify icon={icon} width={19} />
      </Box>
      <Typography variant="subtitle1" sx={{ flex: 1 }}>{title}</Typography>
      {badge && <Chip size="small" variant="soft" label={badge} />}
    </Stack>
  );
}

export function AcademicInsightSections({
  learningTasks,
  exams = [],
  subjectPerformance = [],
  alerts = [],
  showExams = true,
  showHomework = true,
  showSubjectPerformance = false,
}: AcademicInsightSectionsProps) {
  return (
    <Stack spacing={1}>
      {showHomework && <HomeworkAssignmentDashboardCard learningTasks={learningTasks} />}

      {showExams && <ExamsResultsDashboardCard exams={exams} />}

      {showSubjectPerformance && (
        <SubjectPerformanceCard subjectPerformance={subjectPerformance} />
      )}

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1}>
          <SectionHeader icon="mdi:bell-alert-outline" title="Academic Alerts" />
          {alerts.length > 0 ? (
            <Stack spacing={1}>
              {alerts.map((alert) => (
                <Chip
                  key={`${alert.source}-${alert.title}`}
                  size="small"
                  color={alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                  variant="soft"
                  label={`${alert.title}: ${alert.message}`}
                  sx={{ justifyContent: 'flex-start', height: 'auto', py: 0.5, '& .MuiChip-label': { whiteSpace: 'normal' } }}
                />
              ))}
            </Stack>
          ) : (
            <Academic360EmptyState
              icon="mdi:bell-check-outline"
              color="success"
              title="No academic alerts"
              description="This student has no active academic alerts. Anything worth flagging will show up here automatically."
              compact
            />
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
