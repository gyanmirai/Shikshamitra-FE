import type { AdmissionApplicationWorkflow } from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { List, Stack, ListItem, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import { applicationHistoryCardProps } from './application-history-card-props';

export function TransitionHistoryCard({ workflow }: { workflow?: AdmissionApplicationWorkflow }) {
  if (!workflow?.history.length) return null;
  return (
    <FormSectionCard
      {...applicationHistoryCardProps}
      title="Transition History"
      titleTypographyProps={{ component: 'h4' }}
      descriptionTooltip="Recorded moves between admission stages, with the staff member and reason when available."
      icon="mdi:source-branch"
    >
      <List disablePadding>
        {workflow.history.map((history, index) => {
          const from = workflow.stages.find((stage) => stage.id === history.fromStageInstanceId);
          const to = workflow.stages.find((stage) => stage.id === history.toStageInstanceId);
          const destination = history.toStageInstanceId ? (to?.name ?? 'Stage') : 'Completed';
          return (
            <ListItem
              key={history.id}
              disableGutters
              divider={index < workflow.history.length - 1}
              sx={{ alignItems: 'flex-start', gap: 1, minWidth: 0, py: 0.75 }}
            >
              <Iconify
                icon={history.action === 1 ? 'mdi:skip-next-outline' : 'mdi:source-branch'}
                width={16}
                sx={{ mt: 0.25, color: history.action === 2 ? 'warning.main' : 'text.secondary' }}
                aria-hidden
              />
              <Stack spacing={0.25} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                <Typography variant="subtitle2">
                  {from?.name ?? 'Stage'} → {destination}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Handled by: {history.actorName || 'Name not recorded'} ·{' '}
                  {fDateTime(history.occurredAt, ADMISSION_DATE_TIME_FORMAT)}
                </Typography>
                {history.reason && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-wrap' }}
                  >
                    {history.reason}
                  </Typography>
                )}
              </Stack>
            </ListItem>
          );
        })}
      </List>
    </FormSectionCard>
  );
}
