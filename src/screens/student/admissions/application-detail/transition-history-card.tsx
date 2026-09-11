import type { AdmissionApplicationWorkflow } from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography, CardContent } from '@mui/material';

export function TransitionHistoryCard({ workflow }: { workflow?: AdmissionApplicationWorkflow }) {
  if (!workflow?.history.length) return null;
  return (
    <Card><CardContent>
      <Typography variant="h6" sx={{ mb: 2 }}>Transition history</Typography>
      <Stack spacing={1.5}>
        {workflow.history.map((history) => {
          const from = workflow.stages.find((stage) => stage.id === history.fromStageInstanceId);
          const to = workflow.stages.find((stage) => stage.id === history.toStageInstanceId);
          return (
            <Stack key={history.id} direction="row" spacing={1.5}>
              <Iconify icon={history.action === 1 ? 'mdi:skip-next-outline' : 'mdi:source-branch'} color={history.action === 2 ? 'warning.main' : 'primary.main'} />
              <Box>
                <Typography variant="body2" fontWeight={600}>{from?.name ?? 'Stage'} {to ? `→ ${to.name}` : '→ Completed'}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(history.occurredAt).toLocaleString()}{history.reason ? ` · ${history.reason}` : ''}</Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </CardContent></Card>
  );
}
