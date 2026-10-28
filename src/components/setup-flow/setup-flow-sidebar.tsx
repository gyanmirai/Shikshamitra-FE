// eslint-disable-next-line import/order -- The project sorts styles first; import/order sorts relative modules last.
import styles from './setup-flow-motion.module.css';

import { Logo } from 'src/components/logo';
import { Box, Stack, Typography } from '@mui/material';

import SetupFlowStepButton from './setup-flow-step-button';

import type { SetupFlowShellProps } from './types';

type Props = Omit<SetupFlowShellProps, 'headerLabel' | 'children' | 'footer' | 'heightMode'>;

export default function SetupFlowSidebar({
  steps,
  activeStep,
  furthestStep,
  schoolCode,
  sidebarTitle,
  contextLabel,
  disabled,
  onStep,
  stepStates,
  navigationLabel = 'Setup steps',
}: Props) {
  return (
    <Stack
      component="aside"
      className={styles.sidebar}
      spacing={3}
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: 256,
        flexShrink: 0,
        p: 3,
        overflowY: 'auto',
        bgcolor: 'background.neutral',
        borderRight: 1,
        borderColor: 'divider',
        '@media (max-height: 650px)': { p: 2, gap: 2 },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Logo disableLink width={36} height={36} />
        <Typography
          variant="h6"
          sx={(theme) => ({
            color: 'primary.dark',
            ...theme.applyStyles('dark', { color: 'primary.light' }),
          })}
        >
          GyanMirai
        </Typography>
      </Stack>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {sidebarTitle}
        </Typography>
        <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
          {schoolCode}
        </Typography>
      </Box>
      <Stack
        component="nav"
        aria-label={navigationLabel}
        spacing={1}
        useFlexGap
        sx={{ position: 'relative' }}
      >
        {steps.map((item, index) => (
          <SetupFlowStepButton
            key={item.key}
            title={item.title}
            index={index}
            active={activeStep === index}
            reached={index < furthestStep}
            disabled={disabled || index > furthestStep}
            onStep={onStep}
            state={
              stepStates ? stepStates[item.key] : index < furthestStep ? 'complete' : undefined
            }
          />
        ))}
      </Stack>
      {contextLabel && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto !important', pt: 2 }}>
          {contextLabel}
        </Typography>
      )}
    </Stack>
  );
}
