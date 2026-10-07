import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Box, Link, Typography } from '@mui/material';
import { academicPaths } from 'src/constants/academic-menu';

type Props = {
  standardId?: string | null;
  divisionIds: string[];
};

export function EmptyElectiveSchedule({ standardId, divisionIds }: Props) {
  const medium = useSelector((state: RootState) => state.globalState.currentMedium) as Medium;
  const standard = medium.educationMediumStages
    ?.flatMap((stage) => stage.standards ?? [])
    .find((item) => item.id === standardId);
  const selectedIds = divisionIds.filter((id) => id !== 'all');
  const names = selectedIds.map((id) => standard?.divisions.find((item) => item.id === id)?.name);
  const scope =
    names.length > 0 && names.every(Boolean)
      ? `Div${names.length === 1 ? '' : 's'} ${names.join(', ')}`
      : 'the selected divisions';

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2">No students are assigned to this elective in {scope}.</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        This elective is excluded from scheduling. You can continue scheduling the other subjects.
      </Typography>
      <Link
        href={academicPaths.curriculum.electiveAssignment}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'inline-block', mt: 1 }}
      >
        Open Elective Assignment (new tab)
      </Link>
    </Box>
  );
}
