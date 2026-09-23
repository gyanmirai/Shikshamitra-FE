import { Stack, Button } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import type { SubjectDependencyCounts } from '../subjectUsage.types';

interface SubjectDependencyActionsProps {
  counts: SubjectDependencyCounts;
  onNavigate: (path: string) => void;
  paths: {
    allocations: string;
    chapters: string;
    timetable: string;
    examinations: string;
    lessonPlans: string;
  };
}

export function SubjectDependencyActions({
  counts,
  paths,
  onNavigate,
}: SubjectDependencyActionsProps) {
  const actions = [
    { label: 'Class allocations', count: counts.allocations, path: paths.allocations },
    { label: 'Syllabus', count: counts.chapters, path: paths.chapters },
    { label: 'Timetable', count: counts.timetablePeriods, path: paths.timetable },
    { label: 'Examinations', count: counts.examinations, path: paths.examinations },
    { label: 'Lesson plans', count: counts.lessonPlans, path: paths.lessonPlans },
  ].filter((action) => action.count > 0);

  if (!actions.length) return null;

  return (
    <FormSectionCard
      icon="solar:link-round-linear"
      title="Dependency actions"
      description="Open the related academic records for this subject."
    >
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {actions.map((action) => (
          <Button
            key={action.label}
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => onNavigate(action.path)}
          >
            {action.label} ({action.count})
          </Button>
        ))}
      </Stack>
    </FormSectionCard>
  );
}
