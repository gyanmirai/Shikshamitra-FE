'use client';

// eslint-disable-next-line import/order -- The project sorts styles first; import/order sorts relative modules last.
import styles from './setup-flow-motion.module.css';

import { useRef, useEffect } from 'react';
import { Logo } from 'src/components/logo';
import { Box, Stack, Typography, LinearProgress } from '@mui/material';

import SetupFlowSidebar from './setup-flow-sidebar';

import type { SetupFlowShellProps } from './types';

export default function SetupFlowShell({
  steps,
  activeStep,
  furthestStep,
  stepStates,
  disabled,
  onStep,
  schoolCode,
  sidebarTitle,
  headerLabel,
  contextLabel,
  navigationLabel = 'Setup steps',
  children,
  footer,
  heightMode = 'viewport',
  fillContent = false,
}: SetupFlowShellProps) {
  const body = useRef<HTMLElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [activeStep]);
  return (
    <Box
      className={styles.shell}
      sx={{
        height: heightMode === 'container' ? '100%' : '100dvh',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        bgcolor: 'background.default',
      }}
    >
      <SetupFlowSidebar
        steps={steps}
        activeStep={activeStep}
        furthestStep={furthestStep}
        stepStates={stepStates}
        disabled={disabled}
        onStep={onStep}
        schoolCode={schoolCode}
        sidebarTitle={sidebarTitle}
        contextLabel={contextLabel}
        navigationLabel={navigationLabel}
      />
      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          component="header"
          sx={{
            flexShrink: 0,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: { xs: 2, sm: 3 }, py: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ display: { md: 'none' } }}>
                <Logo disableLink width={32} height={32} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {headerLabel}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={steps.length ? ((activeStep + 1) / steps.length) * 100 : 0}
            aria-label="Setup progress"
            sx={{ height: 2, '& .MuiLinearProgress-bar': { transitionDuration: '440ms' } }}
          />
        </Box>
        <Box
          component="main"
          ref={body}
          aria-label="Setup content"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarGutter: 'stable',
          }}
        >
          <Box
            key={activeStep}
            className={styles.step}
            data-setup-step={activeStep}
            sx={{ width: '100%', maxWidth: 1040, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 },
              ...(fillContent && { height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }) }}
          >
            {children}
          </Box>
        </Box>
        <Box
          component="footer"
          sx={{
            flexShrink: 0,
            zIndex: 10,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: { xs: 2, sm: 3 },
            py: 2,
            pb: 'max(16px, env(safe-area-inset-bottom))',
          }}
        >
          {footer}
        </Box>
      </Box>
    </Box>
  );
}
