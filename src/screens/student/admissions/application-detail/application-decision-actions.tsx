import { Iconify } from 'src/components/iconify';
import { Box, Radio, Stack, Button, RadioGroup, Typography, FormControlLabel } from '@mui/material';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';

type Props = {
  actions: readonly AdmissionDecisionAction[];
  busy: boolean;
  onSelect: (action: AdmissionDecisionAction) => void;
  compact?: boolean;
  value?: AdmissionDecisionAction | null;
  labelledBy?: string;
};

const ACTION_LABELS: Record<AdmissionDecisionAction, string> = {
  approve: 'Approve',
  waitlist: 'Waitlist',
  reject: 'Reject',
};

const ACTION_DETAILS: Record<
  AdmissionDecisionAction,
  { description: string; icon: string; color: string }
> = {
  approve: {
    description: 'Accept this application',
    icon: 'mdi:check-circle-outline',
    color: 'success.main',
  },
  waitlist: {
    description: 'Keep pending for a place',
    icon: 'mdi:clock-outline',
    color: 'warning.main',
  },
  reject: {
    description: 'Decline this application',
    icon: 'mdi:close-circle-outline',
    color: 'error.main',
  },
};

export function ApplicationDecisionActions({
  actions,
  busy,
  onSelect,
  compact = false,
  value,
  labelledBy,
}: Props) {
  if (compact)
    return (
      <RadioGroup
        aria-labelledby={labelledBy}
        name="admissionDecision"
        value={value ?? ''}
        onChange={(_, next) => {
          const selected = actions.find((item) => item === next);
          if (!busy && selected) onSelect(selected);
        }}
        sx={{ gap: 1 }}
      >
        {actions.map((item) => (
          <FormControlLabel
            key={item}
            value={item}
            disabled={busy}
            control={
              <Radio size="small" slotProps={{ input: { 'aria-label': ACTION_LABELS[item] } }} />
            }
            label={
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Iconify
                  icon={ACTION_DETAILS[item].icon}
                  width={24}
                  sx={{ color: ACTION_DETAILS[item].color, flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <Typography variant="subtitle2" component="span" display="block">
                    {ACTION_LABELS[item]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ACTION_DETAILS[item].description}
                  </Typography>
                </Box>
              </Stack>
            }
            sx={{
              m: 0,
              p: 1,
              gap: 0.5,
              border: 1,
              borderRadius: 1,
              borderColor: value === item ? 'text.primary' : 'divider',
              bgcolor: value === item ? 'action.selected' : 'transparent',
              '&:hover': { bgcolor: busy ? undefined : 'action.hover' },
              '&:has(.Mui-focusVisible)': {
                outline: 2,
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
              '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 },
            }}
          />
        ))}
      </RadioGroup>
    );

  return (
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: compact ? 1 : 2 }}>
      {actions.map((item) => (
        <Button
          key={item}
          size="small"
          variant={item === 'approve' ? 'contained' : 'outlined'}
          color={item === 'reject' ? 'error' : 'inherit'}
          disabled={busy}
          startIcon={
            <Iconify
              icon={
                item === 'approve'
                  ? 'mdi:check'
                  : item === 'waitlist'
                    ? 'mdi:clock-outline'
                    : 'mdi:close'
              }
            />
          }
          onClick={() => onSelect(item)}
        >
          {ACTION_LABELS[item]}
        </Button>
      ))}
    </Stack>
  );
}
