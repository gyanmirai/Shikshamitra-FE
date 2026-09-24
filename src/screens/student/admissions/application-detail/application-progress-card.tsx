'use client';

import type {
  AdmissionApplicationStage,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Paper,
  Alert,
  Stack,
  Button,
  Divider,
  Accordion,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { ApplicationStageJourney } from './application-stage-journey';
import { getWorkflowProgress, getStageStatusLabel } from './application-progress-model';

type Props = {
  workflow?: AdmissionApplicationWorkflow;
  currentStage?: AdmissionApplicationStage;
  canOverride: boolean;
  onOverride: () => void;
};

export function ApplicationProgressCard({
  workflow,
  currentStage,
  canOverride,
  onOverride,
}: Props) {
  const [mobileJourneyExpanded, setMobileJourneyExpanded] = useState(false);
  const stages = workflow?.stages ?? [];
  const progress = getWorkflowProgress(stages);
  const orderedStages = [...stages].sort((left, right) => left.displayOrder - right.displayOrder);
  const currentIndex = currentStage
    ? Math.max(
        orderedStages.findIndex((stage) => stage.id === currentStage.id),
        0
      )
    : Math.max(progress.completed - 1, 0);
  const showOverride = Boolean(
    workflow?.status === 0 &&
    currentStage &&
    canOverride &&
    workflow.availableTransitions.length > 0
  );

  const journey = (
    <ApplicationStageJourney
      stages={orderedStages}
      currentStageId={workflow?.currentStageInstanceId}
    />
  );

  const overrideAction = showOverride ? (
    <Button
      fullWidth
      size="small"
      variant="outlined"
      color="inherit"
      startIcon={<Iconify icon="mdi:routes" />}
      onClick={onOverride}
      sx={{ minHeight: 44 }}
    >
      Override route
    </Button>
  ) : null;

  return (
    <>
      <Paper
        component="aside"
        variant="outlined"
        aria-labelledby="application-journey-heading"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          gridColumn: 1,
          gridRow: 1,
          minWidth: 0,
          minHeight: 0,
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography id="application-journey-heading" variant="h6">
                Admission journey
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.completed} of {progress.total} completed
              </Typography>
            </Box>
            {workflow?.status === 1 && <Label color="success">Completed</Label>}
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2, overscrollBehavior: 'contain' }}>
          {journey}
          {workflow?.status === 1 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Admission workflow completed.
            </Alert>
          )}
        </Box>
        {overrideAction && (
          <Box sx={{ p: 2, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
            {overrideAction}
          </Box>
        )}
      </Paper>

      <Paper
        component="section"
        variant="outlined"
        aria-label="Admission journey summary"
        sx={{
          display: { xs: 'block', lg: 'none' },
          gridColumn: 1,
          gridRow: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Accordion
          disableGutters
          elevation={0}
          expanded={mobileJourneyExpanded}
          onChange={(_, expanded) => setMobileJourneyExpanded(expanded)}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<Iconify icon="mdi:chevron-down" />}
            aria-controls="mobile-admission-journey"
            sx={{ minHeight: 56, '& .MuiAccordionSummary-content': { minWidth: 0 } }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ width: 1, minWidth: 0, pr: 1 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {stages.length
                    ? `Step ${currentIndex + 1} of ${stages.length} · ${currentStage?.name ?? 'Admission journey'}`
                    : 'Admission journey'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {progress.completed} of {progress.total} completed
                </Typography>
              </Box>
              {currentStage && (
                <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
                  <Label color={currentStage.status === 2 ? 'success' : 'default'}>
                    {getStageStatusLabel(currentStage.status)}
                  </Label>
                  <Typography variant="caption" sx={{ textDecoration: 'underline' }}>
                    View journey
                  </Typography>
                </Stack>
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails
            id="mobile-admission-journey"
            sx={{ borderTop: 1, borderColor: 'divider', p: 1.5 }}
          >
            <Box sx={{ maxHeight: '42dvh', overflowY: 'auto', overscrollBehavior: 'contain' }}>
              {journey}
            </Box>
            {workflow?.status === 1 && (
              <Alert severity="success" sx={{ mt: 1.5 }}>
                Admission workflow completed.
              </Alert>
            )}
            {overrideAction && <Box sx={{ mt: 1.5 }}>{overrideAction}</Box>}
          </AccordionDetails>
        </Accordion>
      </Paper>
    </>
  );
}
