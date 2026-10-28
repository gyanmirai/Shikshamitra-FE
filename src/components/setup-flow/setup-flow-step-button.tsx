// eslint-disable-next-line import/order -- The project sorts styles first; import/order sorts relative modules last.
import styles from './setup-flow-motion.module.css';

import { Iconify } from 'src/components/iconify';
import { Box, ButtonBase, Typography } from '@mui/material';

import type { SetupFlowStepState } from './types';

type Props = {
  title: string;
  index: number;
  active: boolean;
  reached: boolean;
  disabled: boolean;
  onStep: (index: number) => void;
  state?: SetupFlowStepState;
};

const stateLabels = {
  complete: ', completed',
  pending: ', changes need saving',
  deferred: ', deferred',
};

export default function SetupFlowStepButton({
  title,
  index,
  active,
  reached,
  disabled,
  onStep,
  state,
}: Props) {
  const complete = state === 'complete';
  const savedBadge = complete || (state === 'pending' && reached);
  return (
    <ButtonBase
      disabled={disabled}
      onClick={() => onStep(index)}
      aria-current={active ? 'step' : undefined}
      aria-label={`${title}${state ? stateLabels[state] : ''}`}
      sx={{
        position: 'relative',
        justifyContent: 'flex-start',
        textAlign: 'left',
        gap: 1.5,
        px: 1.5,
        py: 1,
        minHeight: 48,
        borderRadius: 1.5,
        color: active ? 'primary.dark' : 'text.secondary',
        bgcolor: active ? 'primary.lighter' : 'transparent',
        '&.Mui-focusVisible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Box
        className={styles.badge}
        data-completed={complete}
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          border: 1,
          borderColor: savedBadge || active ? 'transparent' : 'text.secondary',
          bgcolor: savedBadge ? 'success.dark' : active ? 'primary.dark' : 'background.paper',
          color: savedBadge || active ? 'common.white' : 'text.secondary',
        }}
      >
        {state === 'pending' ? (
          <Iconify icon="mdi:pencil-outline" width={18} />
        ) : complete ? (
          <Iconify key="completed" icon="mdi:check" width={18} />
        ) : state === 'deferred' ? (
          <Iconify icon="mdi:clock-outline" width={18} />
        ) : (
          <Typography variant="caption">{index + 1}</Typography>
        )}
      </Box>
      <Typography variant="body2" fontWeight={active ? 700 : 500}>
        {title}
      </Typography>
    </ButtonBase>
  );
}
