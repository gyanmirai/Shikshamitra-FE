'use client';

import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import { getStageStatusColor, getStageStatusLabel } from './application-progress-model';

type Props = {
  stages: AdmissionApplicationStage[];
  currentStageId?: string | null;
};

export function ApplicationStageJourney({ stages, currentStageId }: Props) {
  const orderedStages = [...stages].sort((left, right) => left.displayOrder - right.displayOrder);

  if (!orderedStages.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No admission stages are available for this application.
      </Typography>
    );
  }

  return (
    <Stack component="ol" aria-label="Admission journey" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {orderedStages.map((stage, index) => {
        const completed = stage.status === 2;
        const current = stage.id === currentStageId || stage.status === 1;
        const error = stage.status === 4 || stage.status === 5;
        const skipped = stage.status === 3;

        return (
          <Box
            component="li"
            key={stage.id}
            aria-current={current ? 'step' : undefined}
            sx={{
              display: 'grid',
              gridTemplateColumns: '36px minmax(0, 1fr)',
              gap: 1,
              p: 1,
              mx: -1,
              borderRadius: 1.5,
              bgcolor: current ? 'action.hover' : 'transparent',
              minWidth: 0,
            }}
          >
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              {index < orderedStages.length - 1 && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: 32,
                    bottom: -16,
                    left: '50%',
                    borderLeft: 2,
                    borderColor: completed ? 'success.light' : 'divider',
                  }}
                />
              )}
              <Box
                aria-hidden
                sx={{
                  width: 32,
                  height: 32,
                  zIndex: 1,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  border: 2,
                  borderColor: completed
                    ? 'success.main'
                    : current
                      ? 'text.primary'
                      : error
                        ? 'error.main'
                        : skipped
                          ? 'warning.main'
                          : 'action.disabledBackground',
                  bgcolor: completed ? 'success.main' : 'background.paper',
                  color: completed
                    ? 'success.contrastText'
                    : current
                      ? 'text.primary'
                      : error
                        ? 'error.main'
                        : skipped
                          ? 'warning.main'
                          : 'text.disabled',
                  fontWeight: 700,
                }}
              >
                {completed ? <Iconify icon="mdi:check" width={18} /> : index + 1}
              </Box>
            </Box>
            <Box sx={{ minWidth: 0, pb: index < orderedStages.length - 1 ? 1.25 : 0 }}>
              <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                {stage.name}
              </Typography>
              <Label color={getStageStatusColor(stage.status)} sx={{ mt: 0.5 }}>
                {getStageStatusLabel(stage.status)}
              </Label>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
