'use client';

import LockOutlined from '@mui/icons-material/LockOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import RemoveCircleOutlineOutlined from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Paper, Step, Stepper, Tooltip, StepLabel, StepButton, Typography } from '@mui/material';

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

function JourneyStateIcon({
  step,
  selected,
  index,
}: {
  step: ApplicantJourneyStep;
  selected: boolean;
  index: number;
}) {
  const common = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    border: 1,
    borderColor: selected ? 'primary.main' : 'divider',
  } as const;

  if (step.state === 'complete') {
    return <TaskAltOutlined color="success" sx={{ fontSize: 28 }} />;
  }
  if (step.state === 'blocked') {
    return (
      <Box sx={{ ...common, color: 'error.main', bgcolor: 'error.lighter' }}>
        <LockOutlined sx={{ fontSize: 16 }} />
      </Box>
    );
  }
  if (step.state === 'needs-review') {
    return <WarningAmberOutlined color="warning" sx={{ fontSize: 28 }} />;
  }
  if (step.state === 'skipped') {
    return <RemoveCircleOutlineOutlined color="disabled" sx={{ fontSize: 28 }} />;
  }
  return (
    <Box
      sx={(theme) => ({
        ...common,
        color: selected ? 'primary.contrastText' : 'text.secondary',
        bgcolor: selected ? 'primary.main' : alpha(theme.palette.text.primary, 0.08),
        fontSize: 12,
        fontWeight: 700,
      })}
    >
      {index + 1}
    </Box>
  );
}

export function ApplicantJourneyNavigator({ steps, currentStep, selectedTab, onSelect }: Props) {
  const theme = useTheme();
  const vertical = useMediaQuery(theme.breakpoints.down('md'));
  const selectedIndex = Math.max(
    0,
    steps.findIndex((step) => getJourneyTab(step) === selectedTab)
  );

  if (!steps.length) return null;

  return (
    <Paper
      component="nav"
      aria-label="Admission journey"
      variant="outlined"
      sx={{ px: { xs: 1, sm: 1.5 }, py: 1.25, overflow: 'hidden' }}
    >
      <Stepper
        activeStep={selectedIndex}
        orientation={vertical ? 'vertical' : 'horizontal'}
        alternativeLabel={!vertical}
        sx={{
          '& .MuiStepConnector-line': { borderColor: 'divider' },
          '& .MuiStepLabel-labelContainer': { minWidth: 0 },
          '& .MuiStepButton-root': { borderRadius: 1, minHeight: 44 },
        }}
      >
        {steps.map((step, index) => {
          const tab = getJourneyTab(step);
          const selected = tab === selectedTab;
          const current = step.id === currentStep?.id;
          const openable = canOpenJourneyStep(step);
          const reason = step.reason || `${step.label} is not available yet.`;
          const icon = <JourneyStateIcon step={step} selected={selected} index={index} />;
          const optional = (
            <Typography variant="caption" color="text.secondary">
              {current ? 'Current · ' : ''}
              {getJourneyStateLabel(step)}
            </Typography>
          );
          const title = (
            <Typography variant="subtitle2" color={selected ? 'primary.main' : 'text.primary'}>
              {step.label}
            </Typography>
          );

          return (
            <Step
              key={step.id}
              completed={step.state === 'complete'}
              active={selected}
              aria-current={current ? 'step' : undefined}
            >
              {openable ? (
                <StepButton
                  icon={icon}
                  optional={optional}
                  aria-controls="applicant-stage-panel"
                  onClick={() => onSelect(tab)}
                >
                  {title}
                </StepButton>
              ) : (
                <Tooltip title={reason} arrow describeChild>
                  <Box
                    tabIndex={0}
                    role="group"
                    aria-label={`${step.label}, ${getJourneyStateLabel(step)}. ${reason}`}
                    sx={{ borderRadius: 1, cursor: 'help', '&:focus-visible': { outline: 2, outlineColor: 'primary.main' } }}
                  >
                    <StepLabel icon={icon} optional={optional}>
                      {title}
                    </StepLabel>
                  </Box>
                </Tooltip>
              )}
            </Step>
          );
        })}
      </Stepper>
    </Paper>
  );
}
