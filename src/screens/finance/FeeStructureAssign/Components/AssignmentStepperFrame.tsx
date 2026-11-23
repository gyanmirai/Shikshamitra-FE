import type { ReactNode } from 'react';

import { Box } from '@mui/material';

export const assignmentEditSteps = ['Structure & policies', 'Fees & dates', 'Review & save'];
export const assignmentEditPadding = { xs: 2, sm: 3 };

export default function AssignmentStepperFrame({
  savedAssignment,
  children,
}: {
  savedAssignment: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        pt: 2,
        bgcolor: savedAssignment ? undefined : 'background.paper',
      }}
    >
      {children}
    </Box>
  );
}
