'use client';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Chip,
  Stack,
  Paper,
  Button,
  Collapse,
  Typography,
  LinearProgress,
} from '@mui/material';

import {
  getJourneyTab,
  canOpenJourneyStep,
  getJourneyStateLabel,
} from './applicant-command-workspace-model';

import type { ApplicantJourneyStep } from './applicant-journey-model';
import type { ApplicantCommandTab } from './applicant-command-workspace-model';

type Props = {
  steps: ApplicantJourneyStep[];
  currentStep?: ApplicantJourneyStep;
  selectedTab: ApplicantCommandTab;
  onSelect: (tab: ApplicantCommandTab) => void;
};

const stateTone = (state: ApplicantJourneyStep['state']) => {
  if (state === 'complete') return 'success';
  if (state === 'needs-review') return 'warning';
  if (state === 'blocked') return 'error';
  if (state === 'in-progress') return 'primary';
  return 'default';
};

const stateIcon = (step: ApplicantJourneyStep, index: number) => {
  if (step.state === 'complete') return 'solar:check-circle-bold';
  if (step.state === 'blocked') return 'solar:lock-keyhole-minimalistic-bold';
  if (step.state === 'skipped') return 'solar:minus-circle-bold';
  if (step.state === 'needs-review') return 'solar:danger-triangle-bold';
  return `${index + 1}`;
};

function JourneyStepContent({
  step,
  index,
  current,
  selected,
  compact = false,
}: {
  step: ApplicantJourneyStep;
  index: number;
  current: boolean;
  selected: boolean;
  compact?: boolean;
}) {
  const tone = stateTone(step.state);
  const icon = stateIcon(step, index);
  const iconIsNumber = /^\d+$/.test(icon);

  return (
    <Stack direction="row" alignItems="flex-start" gap={1} sx={{ minWidth: 0, width: '100%' }}>
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          width: 28,
          height: 28,
          mt: 0.1,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          bgcolor:
            tone === 'default'
              ? theme.palette.action.selected
              : alpha(theme.palette[tone].main, selected || current ? 0.2 : 0.12),
          color: tone === 'default' ? 'text.secondary' : `${tone}.main`,
          border: 1,
          borderColor: selected ? 'primary.main' : 'divider',
          fontSize: 12,
          fontWeight: 700,
        })}
      >
        {iconIsNumber ? icon : <Iconify icon={icon} width={17} />}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: selected ? 'primary.main' : 'text.primary', overflowWrap: 'anywhere' }}
        >
          {step.label}
        </Typography>
        <Stack direction="row" gap={0.5} alignItems="center" flexWrap="wrap">
          <Typography
            variant="caption"
            color={tone === 'default' ? 'text.secondary' : `${tone}.main`}
          >
            {getJourneyStateLabel(step)}
          </Typography>
          {current ? (
            <Chip size="small" color="primary" label="Current" sx={{ height: 20 }} />
          ) : null}
        </Stack>
        {(compact || current || step.state === 'blocked' || step.state === 'skipped') && step.reason ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.25, overflowWrap: 'anywhere' }}
          >
            {step.reason}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

export function ApplicantJourneyNavigator({ steps, currentStep, selectedTab, onSelect }: Props) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(false);
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStep?.id)
  );
  const progress = steps.length ? ((currentIndex + 1) / steps.length) * 100 : 0;

  if (!steps.length) return null;

  if (compact) {
    return (
      <Paper component="nav" aria-label="Admission journey" variant="outlined" sx={{ p: 1.25 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary">
                Admission Journey
              </Typography>
              <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                {currentStep?.label || 'Applicant progress'} · Step {currentIndex + 1} of{' '}
                {steps.length}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="text"
              aria-expanded={expanded}
              aria-controls="applicant-journey-details"
              endIcon={
                <Iconify icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
              }
              onClick={() => setExpanded((value) => !value)}
              sx={{ minHeight: 44, flexShrink: 0 }}
            >
              {expanded ? 'Hide journey' : 'View journey'}
            </Button>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            aria-label={`Admission journey progress: step ${currentIndex + 1} of ${steps.length}`}
          />
          <Collapse in={expanded}>
            <Stack id="applicant-journey-details" spacing={0.75} pt={0.5}>
              {steps.map((step, index) => {
                const tab = getJourneyTab(step);
                const openable = canOpenJourneyStep(step);
                const content = (
                  <JourneyStepContent
                    step={step}
                    index={index}
                    current={step.id === currentStep?.id}
                    selected={tab === selectedTab}
                    compact
                  />
                );

                return openable ? (
                  <Button
                    key={step.id}
                    color="inherit"
                    aria-controls="applicant-stage-panel"
                    aria-current={step.id === currentStep?.id ? 'step' : undefined}
                    onClick={() => onSelect(tab)}
                    sx={{ minHeight: 52, p: 1, justifyContent: 'flex-start', textAlign: 'left' }}
                  >
                    {content}
                  </Button>
                ) : (
                  <Box
                    key={step.id}
                    role="group"
                    aria-label={`${step.label}, ${getJourneyStateLabel(step)}${step.reason ? `: ${step.reason}` : ''}`}
                    sx={{ minHeight: 52, p: 1 }}
                  >
                    {content}
                  </Box>
                );
              })}
            </Stack>
          </Collapse>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      component="nav"
      aria-label="Admission journey"
      variant="outlined"
      sx={{ p: 1, overflow: 'hidden' }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
          gap: 0.75,
          minWidth: 0,
        }}
      >
        {steps.map((step, index) => {
          const tab = getJourneyTab(step);
          const openable = canOpenJourneyStep(step);
          const content = (
            <JourneyStepContent
              step={step}
              index={index}
              current={step.id === currentStep?.id}
              selected={tab === selectedTab}
            />
          );

          return openable ? (
            <Button
              key={step.id}
              color="inherit"
              aria-controls="applicant-stage-panel"
              aria-current={step.id === currentStep?.id ? 'step' : undefined}
              onClick={() => onSelect(tab)}
              sx={{
                minWidth: 0,
                minHeight: 64,
                p: 0.75,
                justifyContent: 'flex-start',
                textAlign: 'left',
                border: 1,
                borderColor: tab === selectedTab ? 'primary.main' : 'transparent',
                bgcolor: tab === selectedTab ? 'action.selected' : 'transparent',
              }}
            >
              {content}
            </Button>
          ) : (
            <Box
              key={step.id}
              role="group"
              aria-label={`${step.label}, ${getJourneyStateLabel(step)}${step.reason ? `: ${step.reason}` : ''}`}
              sx={{ minWidth: 0, minHeight: 64, p: 0.75 }}
            >
              {content}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
