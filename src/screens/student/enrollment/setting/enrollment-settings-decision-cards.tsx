'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, Stack, Radio, Typography, RadioGroup, FormControlLabel } from '@mui/material';

export type EnrollmentSettingsDecisionOption<T extends string | number | boolean> = {
  value: T;
  title: string;
  description: string;
  icon: string;
  recommended?: boolean;
  meta?: string;
};

type DecisionCardsProps<T extends string | number | boolean> = {
  label: string;
  value: T;
  options: EnrollmentSettingsDecisionOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  columns?: 2 | 3;
};

export function EnrollmentSettingsDecisionCards<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  columns = 2,
}: DecisionCardsProps<T>) {
  const theme = useTheme();

  return (
    <RadioGroup
      aria-label={label}
      value={String(value)}
      onChange={(event) => {
        const selected = options.find((option) => String(option.value) === event.target.value);
        if (selected) onChange(selected.value);
      }}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: `repeat(${columns}, minmax(0, 1fr))` },
        gap: 1,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <FormControlLabel
            key={String(option.value)}
            value={String(option.value)}
            disabled={disabled}
            control={<Radio sx={{ mt: -0.5, alignSelf: 'flex-start' }} />}
            label={
              <Stack spacing={0.5} sx={{ minWidth: 0, py: 0.125 }}>
                <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
                  <Iconify
                    icon={option.icon}
                    width={20}
                    sx={{ color: selected ? 'primary.main' : 'text.secondary' }}
                  />
                  <Typography variant="subtitle2">{option.title}</Typography>
                  {option.recommended ? (
                    <Chip size="small" color="primary" variant="outlined" label="Recommended" />
                  ) : null}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ textWrap: 'pretty' }}>
                  {option.description}
                </Typography>
                {option.meta ? (
                  <Typography variant="caption" color="text.secondary">
                    {option.meta}
                  </Typography>
                ) : null}
              </Stack>
            }
            sx={{
              m: 0,
              p: 1.25,
              minHeight: 104,
              alignItems: 'flex-start',
              border: 1,
              borderColor: selected ? 'primary.main' : 'divider',
              borderRadius: 1.5,
              bgcolor: selected ? alpha(theme.palette.primary.main, 0.07) : 'background.paper',
              transition: theme.transitions.create(['border-color', 'background-color']),
              '&:hover': disabled
                ? undefined
                : {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, selected ? 0.09 : 0.035),
                  },
              '&:focus-within': {
                outline: `3px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                outlineOffset: 2,
              },
              '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 },
            }}
          />
        );
      })}
    </RadioGroup>
  );
}

type FlowStep = {
  label: string;
  description: string;
  icon: string;
  status?: string;
};

export function EnrollmentSettingsFlowPreview({
  label,
  steps,
}: {
  label: string;
  steps: FlowStep[];
}) {
  return (
    <Box component="section" aria-label={label}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'stretch' }}>
        {steps.map((step, index) => (
          <Stack
            key={step.label}
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ flex: 1 }}
          >
            <Stack
              spacing={0.75}
              sx={{
                p: 1.5,
                flex: 1,
                minWidth: 0,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" gap={0.75} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    color: 'primary.main',
                  }}
                >
                  <Iconify icon={step.icon} width={19} />
                </Box>
                <Typography variant="subtitle2">{step.label}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ textWrap: 'pretty' }}>
                {step.description}
              </Typography>
              {step.status ? (
                <Typography variant="caption" color="primary.main">
                  {step.status}
                </Typography>
              ) : null}
            </Stack>
            {index < steps.length - 1 ? (
              <Iconify
                icon="mdi:arrow-right"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  alignSelf: 'center',
                  color: 'text.disabled',
                  flexShrink: 0,
                }}
              />
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
