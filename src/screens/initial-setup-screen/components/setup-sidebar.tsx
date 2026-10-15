// eslint-disable-next-line import/order -- The project sorts styles first; import/order sorts relative modules last.
import styles from './setup-motion.module.css';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, ButtonBase, Typography } from '@mui/material';

import { setupSteps } from '../services/setup-model';

export default function SetupSidebar({
  step,
  furthest,
  schoolCode,
  disabled,
  onStep,
  pendingSteps = [],
}: {
  step: number;
  furthest: number;
  schoolCode: string;
  disabled: boolean;
  onStep: (index: number) => void;
  pendingSteps?: number[];
}) {
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
          INSTITUTE SETUP
        </Typography>
        <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
          {schoolCode}
        </Typography>
      </Box>
      <Stack
        component="nav"
        aria-label="Setup steps"
        spacing={1}
        useFlexGap
        sx={{ position: 'relative' }}
      >
        {setupSteps.map((item, index) => (
          <ButtonBase
            key={item.title}
            disabled={disabled || index > furthest}
            onClick={() => onStep(index)}
            aria-current={step === index ? 'step' : undefined}
            aria-label={`${item.title}${pendingSteps.includes(index) ? ', changes need saving' : index < furthest ? ', completed' : ''}`}
            sx={{
              position: 'relative',
              justifyContent: 'flex-start',
              textAlign: 'left',
              gap: 1.5,
              px: 1.5,
              py: 1,
              minHeight: 48,
              borderRadius: 1.5,
              color: step === index ? 'primary.dark' : 'text.secondary',
              bgcolor: step === index ? 'primary.lighter' : 'transparent',
              '&.Mui-focusVisible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            <Box
              className={styles.badge}
              data-completed={index < furthest && !pendingSteps.includes(index)}
              sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                border: 1,
                borderColor: index < furthest || step === index ? 'transparent' : 'text.secondary',
                bgcolor:
                  index < furthest
                    ? 'success.dark'
                    : step === index
                      ? 'primary.dark'
                      : 'background.paper',
                color: index < furthest || step === index ? 'common.white' : 'text.secondary',
              }}
            >
              {pendingSteps.includes(index) ? (
                <Iconify icon="mdi:pencil-outline" width={18} />
              ) : index < furthest ? (
                <Iconify key="completed" icon="mdi:check" width={18} />
              ) : (
                <Typography variant="caption">{index + 1}</Typography>
              )}
            </Box>
            <Typography variant="body2" fontWeight={step === index ? 700 : 500}>
              {item.title}
            </Typography>
          </ButtonBase>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto !important', pt: 2 }}>
        Your progress is saved to your institute. You can return and continue later.
      </Typography>
    </Stack>
  );
}
