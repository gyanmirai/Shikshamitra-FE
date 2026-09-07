'use client';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Box, Stack, Typography } from '@mui/material';

import { SubjectPerformanceCard } from './SubjectPerformanceCard';
import { ExamsResultsDashboardCard } from './ExamsResultsDashboardCard';
import { HomeworkAssignmentDashboardCard } from './HomeworkAssignmentDashboardCard';

import type {
  Academic360ExamResult,
  Academic360LearningTasks,
  Academic360SubjectPerformance,
  Academic360StudentRow,
  Academic360Alert,
} from '../types';

type AcademicInsightSectionsProps = {
  learningTasks?: Academic360LearningTasks;
  exams?: Academic360ExamResult[];
  subjectPerformance?: Academic360SubjectPerformance[];
  alerts?: Academic360Alert[];
  student?: Academic360StudentRow | null;
  showExams?: boolean;
  showHomework?: boolean;
  showSubjectPerformance?: boolean;
};

export function SectionHeader({ icon, title, badge }: { icon: string; title: string; badge?: string }) {
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
      {badge && <Label variant="soft" color="default">{badge}</Label>}
    </Stack>
  );
}

export function AcademicInsightSections({
  learningTasks,
  exams = [],
  subjectPerformance = [],
  student,
  showExams = true,
  showHomework = true,
  showSubjectPerformance = false,
}: AcademicInsightSectionsProps) {
  return (
    <Stack spacing={1}>
      {showHomework && <HomeworkAssignmentDashboardCard learningTasks={learningTasks} />}
      {showExams && <ExamsResultsDashboardCard exams={exams} student={student} />}
      {showSubjectPerformance && (
        <SubjectPerformanceCard subjectPerformance={subjectPerformance} />
      )}
    </Stack>
  );
}
