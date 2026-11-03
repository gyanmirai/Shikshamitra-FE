import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';

import type { IExamFormValues } from '../type';

export function ExamContextHeader({ values, step }: { values: IExamFormValues; step: number }) {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const classes: Standards[] =
    currentMedium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) ||
    [];
  const schoolClass = classes.find((item) => item.id === values.className);
  const divisions =
    schoolClass?.divisions?.filter((item) => values.divisions.includes(item.id)) || [];

  if (step === 0) return null;

  const details = [
    values.examName,
    schoolClass?.name,
    divisions.length ? `Division ${divisions.map((item) => item.name).join(', ')}` : '',
    `${values.subjects.length} selected subject${values.subjects.length === 1 ? '' : 's'}`,
  ].filter(Boolean);

  return (
    <Box
      aria-label="Exam context"
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.neutral',
        minWidth: 0,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
        {details.join(' · ')}
      </Typography>
    </Box>
  );
}
