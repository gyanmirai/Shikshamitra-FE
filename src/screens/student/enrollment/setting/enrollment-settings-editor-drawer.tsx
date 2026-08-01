'use client';

import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Step,
  Stack,
  Drawer,
  Divider,
  Stepper,
  StepButton,
  Typography,
  IconButton,
} from '@mui/material';

export type EnrollmentSettingsEditorStep = {
  value: number;
  label: string;
};

type Props = {
  open: boolean;
  title: string;
  description?: string;
  steps?: EnrollmentSettingsEditorStep[];
  activeStep?: number;
  onStepChange?: (value: number) => void;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
  busy?: boolean;
  width?: number;
};

export function EnrollmentSettingsEditorDrawer({
  open,
  title,
  description,
  steps = [],
  activeStep,
  onStepChange,
  onClose,
  children,
  actions,
  busy = false,
  width = 960,
}: Props) {
  const activeStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.value === activeStep)
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: `min(${width}px, 94vw)` },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Stack
        component="header"
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
        sx={{ p: { xs: 1.5, sm: 2 }, flexShrink: 0 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" variant="h6" sx={{ textWrap: 'balance' }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ textWrap: 'pretty' }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        <IconButton aria-label={`Close ${title}`} disabled={busy} onClick={onClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>

      {steps.length ? (
        <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 1.5, overflowX: 'auto', flexShrink: 0 }}>
          <Stepper
            activeStep={activeStepIndex}
            nonLinear
            sx={{ minWidth: steps.length > 3 ? 680 : 420 }}
          >
            {steps.map((step, index) => (
              <Step key={step.value} completed={index < activeStepIndex}>
                <StepButton
                  disabled={!onStepChange || index > activeStepIndex + 1}
                  onClick={() => onStepChange?.(step.value)}
                  aria-current={step.value === activeStep ? 'step' : undefined}
                >
                  {step.label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>
      ) : null}

      <Divider />
      <Box sx={{ p: { xs: 1.5, sm: 2 }, flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</Box>
      <Divider />
      <Stack
        component="footer"
        direction="row"
        justifyContent="flex-end"
        gap={1}
        flexWrap="wrap"
        sx={{ p: { xs: 1.5, sm: 2 }, flexShrink: 0, bgcolor: 'background.paper' }}
      >
        {actions}
      </Stack>
    </Drawer>
  );
}
