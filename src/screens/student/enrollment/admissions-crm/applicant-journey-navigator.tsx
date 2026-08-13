'use client';

import type { MouseEvent } from 'react';
import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Step,
  Paper,
  Button,
  Stepper,
  Tooltip,
  StepLabel,
  StepButton,
  Typography,
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
  returnHref: string;
  isLoading?: boolean;
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void;
  onSelect: (tab: ApplicantCommandTab) => void;
};

const stateColors: Record<ApplicantJourneyStep['state'], LabelColor> = {
  'not-started': 'default',
  'in-progress': 'primary',
  complete: 'success',
  skipped: 'default',
  blocked: 'error',
  'needs-review': 'warning',
};

function getPresentedState(step: ApplicantJourneyStep, current: boolean) {
  return current ? 'Current' : getJourneyStateLabel(step);
}

function getPresentedColor(step: ApplicantJourneyStep, current: boolean): LabelColor {
  return current ? 'primary' : stateColors[step.state];
}

export function ApplicantJourneyNavigator({
  steps,
  currentStep,
  selectedTab,
  returnHref,
  isLoading = false,
  onBack,
  onSelect,
}: Props) {
  const muiTheme = useTheme();
  const compact = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const viewedStepRef = useRef<HTMLDivElement>(null);
  const currentIndex = steps.findIndex((step) => step.id === currentStep?.id);

  useEffect(() => {
    const viewedStep = viewedStepRef.current;
    if (!compact || !viewedStep || typeof viewedStep.scrollIntoView !== 'function') return;
    viewedStep.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [compact, selectedTab, steps.length]);

  return (
    <Paper
      component="nav"
      aria-label="Applicant navigation"
      variant="outlined"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'auto minmax(0, 1fr)' },
        alignItems: { lg: 'center' },
        gap: { xs: 0.5, lg: 1.5 },
        px: { xs: 1, sm: 1.25 },
        py: 0.75,
        overflow: 'hidden',
      }}
    >
      <Button
        component={Link}
        href={returnHref}
        onClick={onBack}
        color="inherit"
        size="small"
        startIcon={<Iconify icon="eva:arrow-back-fill" />}
        sx={{
          justifySelf: 'start',
          color: 'text.secondary',
          minHeight: { xs: 44, md: 'unset' },
          whiteSpace: 'nowrap',
        }}
      >
        Back to Pipeline
      </Button>

      <Box
        role="group"
        aria-label="Admission journey"
        sx={{
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          overscrollBehaviorX: 'contain',
          scrollSnapType: { xs: 'x proximity', sm: 'none' },
          scrollbarWidth: 'thin',
        }}
      >
        {isLoading && !steps.length ? (
          <Box
            role="status"
            aria-label="Loading admission journey"
            sx={{ height: 70, bgcolor: 'action.hover', borderRadius: 1 }}
          />
        ) : (
          <Stepper
            activeStep={currentIndex}
            alternativeLabel
            sx={{
              minWidth: { xs: Math.max(steps.length * 144, 576), sm: 720, lg: 0 },
              '& .MuiStep-root': {
                minWidth: { xs: 144, sm: 120, lg: 0 },
                px: 0.25,
                scrollSnapAlign: 'center',
              },
              '& .MuiStepConnector-line': { borderColor: 'divider' },
              '& .MuiStepLabel-labelContainer': { minWidth: 0 },
              '& .MuiStepButton-root': {
                borderRadius: 1,
                py: 0.5,
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'box-shadow'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              },
            }}
          >
            {steps.map((step) => {
              const tab = getJourneyTab(step);
              const viewed = tab === selectedTab;
              const current = step.id === currentStep?.id;
              const openable =
                canOpenJourneyStep(step) &&
                step.state !== 'blocked' &&
                step.state !== 'skipped' &&
                (step.state !== 'not-started' || current);
              const stateLabel = getPresentedState(step, current);
              const reason = step.reason || `${step.label} is not available yet.`;
              const optional = (
                <Label color={getPresentedColor(step, current)} variant="soft" sx={{ mt: 0.5 }}>
                  {stateLabel}
                </Label>
              );
              const title = (
                <Typography
                  variant="subtitle2"
                  color={current ? 'primary.main' : 'text.primary'}
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {step.label}
                </Typography>
              );

              return (
                <Step
                  key={step.id}
                  ref={viewed ? viewedStepRef : undefined}
                  completed={step.state === 'complete'}
                  active={current}
                  aria-current={current ? 'step' : undefined}
                  data-viewed={viewed ? 'true' : undefined}
                >
                  {openable ? (
                    <StepButton
                      optional={optional}
                      aria-controls="applicant-stage-panel"
                      aria-pressed={viewed}
                      onClick={() => onSelect(tab)}
                      sx={
                        viewed
                          ? {
                              bgcolor: 'action.selected',
                              boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}`,
                            }
                          : undefined
                      }
                    >
                      {title}
                    </StepButton>
                  ) : (
                    <Tooltip title={reason} arrow describeChild>
                      <Box
                        tabIndex={0}
                        role="group"
                        aria-label={`${step.label}, ${stateLabel}. ${reason}`}
                        sx={{
                          borderRadius: 1,
                          py: 0.5,
                          cursor: 'help',
                          ...(viewed && {
                            bgcolor: 'action.selected',
                            boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}`,
                          }),
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: 2,
                          },
                        }}
                      >
                        <StepLabel optional={optional}>{title}</StepLabel>
                      </Box>
                    </Tooltip>
                  )}
                </Step>
              );
            })}
          </Stepper>
        )}
      </Box>
    </Paper>
  );
}
