'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import { SubjectPerformanceCard } from './SubjectPerformanceCard';
import { ExamsResultsDashboardCard } from './ExamsResultsDashboardCard';
import { HomeworkAssignmentDashboardCard } from './HomeworkAssignmentDashboardCard';

import type { Academic360DetailFilters } from '../hooks/useStudentAcademic360Detail';
import type {
  Academic360Alert,
  Academic360ExamResult,
  Academic360StudentRow,
  Academic360LearningTasks,
  Academic360SubjectPerformance,
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
  filters?: Academic360DetailFilters;
  onFilterChange?: (filters: Partial<Academic360DetailFilters>) => void;
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
  alerts: _alerts,
  student,
  showExams = true,
  showHomework = true,
  showSubjectPerformance = false,
  filters,
  onFilterChange,
}: AcademicInsightSectionsProps) {
  return (
    <Stack spacing={1}>
      {showHomework && <HomeworkAssignmentDashboardCard learningTasks={learningTasks}
        filters={filters} onFilterChange={onFilterChange} />}
      {showExams && <ExamsResultsDashboardCard exams={exams} student={student} />}
      {showSubjectPerformance && (
        <SubjectPerformanceCard subjectPerformance={subjectPerformance} />
      )}
    </Stack>
  );
}
