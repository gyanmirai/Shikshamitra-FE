import { Box, Typography } from '@mui/material';

import type { LessonPlanRow } from '../lessonPlanData';

type Props = {
  plan: LessonPlanRow;
};

const ContextItem = ({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) => (
  <Box sx={{ minWidth: 0, gridColumn: { sm: wide ? 'span 2' : 'auto' } }}>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        display: 'block',
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: 0.45,
        lineHeight: 1.4,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ mt: 0.25, color: 'text.primary', fontWeight: 600, lineHeight: 1.45 }}
    >
      {value || '—'}
    </Typography>
  </Box>
);

export function TeacherDiaryPlanContext({ plan }: Props) {
  return (
    <Box
      component="section"
      aria-label="Lesson information"
      sx={{
        mx: 3,
        mt: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
        Lesson information
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          columnGap: 3,
          rowGap: 1.5,
        }}
      >
        <ContextItem label="Class" value={`${plan.className}-${plan.divisionName}`} />
        <ContextItem label="Subject" value={plan.subjectName} />
        <ContextItem label="Planned coverage" value={`${plan.plannedCompletionPercentage}%`} />
        <ContextItem label="Chapter" value={plan.chapterName} />
        <ContextItem label="Planned topic" value={plan.topic} wide />
      </Box>
    </Box>
  );
}
