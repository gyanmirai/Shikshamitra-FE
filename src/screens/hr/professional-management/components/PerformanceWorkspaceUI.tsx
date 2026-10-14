import type { Theme, SxProps } from '@mui/material/styles';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Step, Paper, Stack, Stepper, StepLabel, Typography } from '@mui/material';

type SurfaceProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
};

type WorkspaceShellProps = {
  children: React.ReactNode;
};

type TablePanelProps = {
  children: React.ReactNode;
  minHeight?: number | string;
  sx?: SxProps<Theme>;
};

const surfaceBorder = (theme: Theme) =>
  theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.12) : theme.palette.divider;

export function PerformanceSurface({
  title,
  description,
  action,
  children,
  sx,
  contentSx,
}: SurfaceProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        minWidth: 0,
        maxWidth: '100%',
        borderRadius: 1,
        bgcolor: 'background.paper',
        borderColor: surfaceBorder,
        boxShadow: 'none',
        overflow: 'visible',
        ...sx,
      }}
    >
      {title || action ? (
        <PerformanceSectionHeader title={title || ''} description={description} action={action} />
      ) : null}
      <Box sx={{ overflow: 'visible', ...contentSx }}>{children}</Box>
    </Paper>
  );
}

export function PerformanceWorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <Box
      sx={{
        mt: 2,
        px: { xs: 1.5, sm: 2 },
        pb: { xs: 1.5, sm: 2 },
        minWidth: 0,
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

export function PerformanceScrollableContent({ children }: WorkspaceShellProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 0,
        flex: 1,
        overflow: { xs: 'visible', md: 'auto' },
        pr: { md: 0.5 },
        pb: 0.5,
      }}
    >
      {children}
    </Box>
  );
}

export function PerformanceTablePanel({ children, minHeight = 360, sx }: TablePanelProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: { xs: minHeight, md: 0 },
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        '& > div': {
          minHeight: 0,
          flex: 1,
          height: '100%',
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function PerformanceSectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{ mb: 1.5, minWidth: 0 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? (
        <Box
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: 0,
            flexShrink: { xs: 1, sm: 0 },
            '& .MuiButton-root': { whiteSpace: 'nowrap' },
          }}
        >
          {action}
        </Box>
      ) : null}
    </Stack>
  );
}

export function PerformanceEmptyState({ text }: { text: string }) {
  return (
    <Box
      sx={{
        py: 3,
        px: 2,
        borderRadius: 1,
        textAlign: 'center',
        bgcolor: 'background.default',
        border: (theme) => `1px dashed ${surfaceBorder(theme)}`,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}

export function PerformanceMetricCard({
  label,
  value,
  icon,
  tone = 'primary',
  helper,
}: {
  label: string;
  value?: number;
  icon: string;
  tone?: 'primary' | 'info' | 'warning' | 'success' | 'error';
  helper?: string;
}) {
  const theme = useTheme();
  const toneColor = theme.palette[tone].main;

  return (
    <Card
      sx={{
        p: 1.5,
        height: '100%',
        minHeight: 92,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: `1px solid ${surfaceBorder(theme)}`,
        boxShadow: 'none',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(toneColor, theme.palette.mode === 'dark' ? 0.18 : 0.1),
            color: toneColor,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ lineHeight: 1.1, fontWeight: 700 }}>
            {value ?? 0}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
          {helper ? (
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {helper}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
}

export function PerformanceWorkflowStepper({
  steps,
  activeStep = 0,
}: {
  steps: { label: string; description?: string }[];
  activeStep?: number;
}) {
  return (
    <PerformanceSurface sx={{ height: '100%' }} contentSx={{ height: '100%' }}>
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{
          '& .MuiStepLabel-label': {
            typography: 'subtitle2',
            color: 'text.primary',
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: 'primary.main',
            fontWeight: 700,
          },
          '& .MuiStepConnector-line': {
            borderColor: 'divider',
          },
        }}
      >
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                step.description ? (
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </PerformanceSurface>
  );
}
