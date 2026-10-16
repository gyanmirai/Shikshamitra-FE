'use client';

import type { SeatingPlanWorkspaceDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { GuidedSeatingStepper } from './guided-seating-stepper';
import { useGuidedSeatingWorkflow } from './use-guided-seating-workflow';
import { GuidedSeatingWorkspaceSkeleton } from './guided-seating-workspace-skeleton';

const PublishedSeatingView = dynamic(
  () => import('./published/published-seating-view').then((module) => module.PublishedSeatingView),
  { loading: () => <GuidedSeatingWorkspaceSkeleton /> }
);

export function GuidedSeatingWorkspace({ workspace }: { workspace: SeatingPlanWorkspaceDto }) {
  if (workspace.readiness.isPublished) return <PublishedSeatingView workspace={workspace} />;

  return <EditableGuidedSeatingWorkspace workspace={workspace} />;
}

function EditableGuidedSeatingWorkspace({ workspace }: { workspace: SeatingPlanWorkspaceDto }) {
  const workflow = useGuidedSeatingWorkflow(workspace);

  if (workflow.isPublished) {
    return <PublishedSeatingView workspace={workflow.publication ?? workspace} />;
  }

  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'row',
        bgcolor: 'background.neutral',
        '& .MuiStepLabel-label.Mui-active': {
          color: `${theme.palette.primary.darker} !important`,
        },
        '& .MuiAlert-message, & .MuiAlertTitle-root': {
          color: 'text.primary',
        },
        '& .MuiAlert-icon': {
          opacity: 1,
        },
        '& .MuiAlert-colorSuccess .MuiAlert-icon': { color: 'success.dark' },
        '& .MuiAlert-colorInfo .MuiAlert-icon': { color: 'info.dark' },
        '& .MuiAlert-colorWarning .MuiAlert-icon': { color: 'warning.dark' },
        '& .MuiAlert-colorError .MuiAlert-icon': { color: 'error.dark' },
        ...theme.applyStyles('dark', {
          '& .MuiStepLabel-label.Mui-active': {
            color: `${theme.palette.primary.lighter} !important`,
          },
          '& .MuiAlert-colorSuccess .MuiAlert-icon': { color: 'success.light' },
          '& .MuiAlert-colorInfo .MuiAlert-icon': { color: 'info.light' },
          '& .MuiAlert-colorWarning .MuiAlert-icon': { color: 'warning.light' },
          '& .MuiAlert-colorError .MuiAlert-icon': { color: 'error.light' },
        }),
      })}
    >
      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        <GuidedSeatingStepper workspace={workspace} workflow={workflow} />
      </Box>
    </Paper>
  );
}
