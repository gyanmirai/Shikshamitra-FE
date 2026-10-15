// eslint-disable-next-line import/order -- The project sorts styles first; import/order sorts relative modules last.
import styles from './setup-motion.module.css';

import type { ReactNode } from 'react';

import { useRef, useEffect } from 'react';
import { Logo } from 'src/components/logo';
import { Box, Stack, Typography, LinearProgress } from '@mui/material';

import SetupSidebar from './setup-sidebar';
import { setupSteps } from '../services/setup-model';

export default function SetupShell({
  step,
  furthest,
  schoolCode,
  disabled,
  onStep,
  pendingSteps,
  children,
  footer,
}: {
  step: number;
  furthest: number;
  schoolCode: string;
  disabled: boolean;
  onStep: (index: number) => void;
  pendingSteps?: number[];
  children: ReactNode;
  footer: ReactNode;
}) {
  const body = useRef<HTMLElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [step]);
  return (
    <Box
      className={styles.shell}
      sx={{ height: '100dvh', overflow: 'hidden', display: 'flex', bgcolor: 'background.default' }}
    >
      <SetupSidebar
        step={step}
        furthest={furthest}
        schoolCode={schoolCode}
        disabled={disabled}
        onStep={onStep}
        pendingSteps={pendingSteps}
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
                Initial setup
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Step {step + 1} of {setupSteps.length}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={((step + 1) / setupSteps.length) * 100}
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
            key={step}
            className={styles.step}
            data-setup-step={step}
            sx={{ width: '100%', maxWidth: 1040, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}
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
