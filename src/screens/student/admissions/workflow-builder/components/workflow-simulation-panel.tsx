'use client';

import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  List,
  Chip,
  Alert,
  Paper,
  Stack,
  MenuItem,
  TextField,
  Accordion,
  Typography,
  AlertTitle,
  ListItemText,
  ListItemButton,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import {
  simulateWorkflowRoute,
  getWorkflowConditionFields,
  WORKFLOW_SIMULATION_SCENARIOS,
} from '../workflow-route-simulator';

type Props = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};

const fieldLabels: Record<string, string> = {
  'inquiry.management.outcome': 'Inquiry outcome',
  'assessment.outcome': 'Assessment outcome',
  'documents.status': 'Document status',
  'documents.waivedCount': 'Document waivers',
  'eligibility.status': 'Eligibility status',
  'payment.status': 'Payment status',
  'review.decision': 'Review decision',
  'offer.status': 'Offer status',
  'seat.status': 'Seat status',
};

export function WorkflowSimulationPanel({ stages, transitions }: Props) {
  const [scenarioId, setScenarioId] = useState(WORKFLOW_SIMULATION_SCENARIOS[0].id);
  const [facts, setFacts] = useState<Record<string, string>>(
    WORKFLOW_SIMULATION_SCENARIOS[0].facts
  );
  const scenario = WORKFLOW_SIMULATION_SCENARIOS.find((item) => item.id === scenarioId)!;
  const conditionFields = useMemo(() => getWorkflowConditionFields(transitions), [transitions]);
  const result = useMemo(
    () => simulateWorkflowRoute(stages, transitions, facts),
    [facts, stages, transitions]
  );
  const scenarioResults = useMemo(
    () =>
      WORKFLOW_SIMULATION_SCENARIOS.map((item) => ({
        scenario: item,
        result: simulateWorkflowRoute(stages, transitions, item.facts),
      })),
    [stages, transitions]
  );
  const completedScenarioCount = scenarioResults.filter(
    (item) => item.result.status === 'completed'
  ).length;
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const selectScenario = (nextScenarioId: string) => {
    const next = WORKFLOW_SIMULATION_SCENARIOS.find((item) => item.id === nextScenarioId);
    if (!next) return;
    setScenarioId(next.id);
    setFacts(next.facts);
  };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            aria-hidden
            sx={{
              width: 36,
              height: 36,
              display: 'grid',
              flexShrink: 0,
              borderRadius: 1.5,
              placeItems: 'center',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Iconify icon="mdi:flask-outline" width={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">Test one applicant outcome at a time</Typography>
            <Typography variant="body2" color="text.secondary">
              Change the scenario or its values to see which route the applicant follows. Final
              validation remains authoritative before publication. This tests routing and configured outcomes;
              it does not submit forms, verify evidence, collect money, or make an admission decision.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Stack component="section" spacing={1} aria-labelledby="workflow-test-scenario-heading">
        <Typography id="workflow-test-scenario-heading" variant="subtitle2">
          Scenario
        </Typography>
        <TextField
          select
          fullWidth
          size="small"
          label="Test scenario"
          value={scenarioId}
          onChange={(event) => selectScenario(event.target.value)}
        >
          {WORKFLOW_SIMULATION_SCENARIOS.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          {scenario.description}
        </Typography>
      </Stack>

      {conditionFields.length > 0 ? (
        <Stack
          component="section"
          spacing={1.25}
          aria-labelledby="workflow-scenario-values-heading"
        >
          <Typography id="workflow-scenario-values-heading" variant="subtitle2">
            Scenario values
          </Typography>
          {conditionFields.map((field) => (
            <TextField
              key={field}
              fullWidth
              size="small"
              label={fieldLabels[field] ?? field}
              value={facts[field] ?? ''}
              helperText={fieldLabels[field] ? field : undefined}
              onChange={(event) =>
                setFacts((current) => ({ ...current, [field]: event.target.value }))
              }
            />
          ))}
        </Stack>
      ) : (
        <Alert severity="info" icon={<Iconify icon="mdi:information-outline" />}>
          This workflow uses only default next steps, so there are no conditional values to vary.
        </Alert>
      )}

      <Alert
        severity={
          result.status === 'completed'
            ? 'success'
            : result.status === 'blocked'
              ? 'warning'
              : 'error'
        }
      >
        <AlertTitle>
          {result.status === 'completed'
            ? 'Scenario reaches the final stage'
            : result.status === 'blocked'
              ? 'Scenario stops before completion'
              : 'Scenario has a routing problem'}
        </AlertTitle>
        {result.message}
      </Alert>

      <Box component="section" aria-labelledby="workflow-selected-journey-heading">
        {result.steps.some((step) => (step.otherMatchingRoutes ?? 0) > 0) && <Alert severity="warning" sx={{ mb: 1 }}>
          More than one special path matches this scenario. The path with the lowest route order wins.
          Review the conditions and order before publishing.
        </Alert>}
        <Typography id="workflow-selected-journey-heading" variant="subtitle2">
          Selected journey
        </Typography>
        <Paper variant="outlined" sx={{ mt: 1, px: 1.5, py: 0.75 }}>
          {result.steps.map((step, index) => (
            <Stack
              key={`${step.stageId}-${index}`}
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              sx={{ position: 'relative', py: 1 }}
            >
              {index < result.steps.length - 1 && (
                <Box
                  aria-hidden
                  sx={{
                    top: 35,
                    bottom: -9,
                    left: 13,
                    width: 1,
                    position: 'absolute',
                    bgcolor: 'divider',
                  }}
                />
              )}
              <Box
                aria-hidden
                sx={{
                  width: 28,
                  height: 28,
                  zIndex: 1,
                  display: 'grid',
                  flexShrink: 0,
                  borderRadius: '50%',
                  placeItems: 'center',
                  typography: 'caption',
                  fontWeight: 700,
                  color: step.nextStageId ? 'text.primary' : 'success.main',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: step.nextStageId ? 'divider' : 'success.main',
                }}
              >
                {step.nextStageId ? index + 1 : <Iconify icon="mdi:check" width={16} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>
                  {step.stageName}
                </Typography>
                {step.nextStageId && (
                  <Typography variant="caption" color="text.secondary">
                    {step.routeKind === 'default' ? 'Default next step' : 'Matching condition'} →{' '}
                    {stageById.get(step.nextStageId)?.name ?? 'Missing stage'}
                  </Typography>
                )}
              </Box>
            </Stack>
          ))}
        </Paper>
      </Box>

      <Accordion disableGutters variant="outlined" sx={{ overflow: 'hidden' }}>
        <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ flex: 1, minWidth: 0, pr: 1 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2">All scenario checks</Typography>
              <Typography variant="caption" color="text.secondary">
                Open to compare every predefined outcome.
              </Typography>
            </Box>
            <Chip
              size="small"
              variant="outlined"
              color={completedScenarioCount === scenarioResults.length ? 'success' : 'warning'}
              label={`${completedScenarioCount} of ${scenarioResults.length} complete`}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, borderTop: 1, borderColor: 'divider' }}>
          <List disablePadding sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {scenarioResults.map((item) => (
              <ListItemButton
                key={item.scenario.id}
                selected={item.scenario.id === scenarioId}
                divider
                sx={{ minHeight: 52, alignItems: 'flex-start', py: 1 }}
                onClick={() => selectScenario(item.scenario.id)}
              >
                <Iconify
                  width={20}
                  sx={{ mr: 1.25, mt: 0.25, flexShrink: 0 }}
                  color={
                    item.result.status === 'completed'
                      ? 'success.main'
                      : item.result.status === 'blocked'
                        ? 'warning.main'
                        : 'error.main'
                  }
                  icon={
                    item.result.status === 'completed'
                      ? 'mdi:check-circle-outline'
                      : item.result.status === 'blocked'
                        ? 'mdi:alert-circle-outline'
                        : 'mdi:close-circle-outline'
                  }
                />
                <ListItemText
                  primary={item.scenario.label}
                  secondary={item.result.message}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItemButton>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
