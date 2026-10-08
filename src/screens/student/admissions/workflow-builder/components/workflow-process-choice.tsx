import type { KeyboardEvent } from 'react';

import { useId, useRef } from 'react';
import { varAlpha } from 'src/theme/styles';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Grid, Paper, ButtonBase, Typography } from '@mui/material';

type ProcessOption = {
  value: string;
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
};

type Props = {
  label: string;
  value: string;
  options: readonly ProcessOption[];
  disabled: boolean;
  onChange: (value: string) => void;
};

export function WorkflowProcessChoice({ label, value, options, disabled, onChange }: Props) {
  const descriptionId = useId();
  const controls = useRef<(HTMLButtonElement | null)[]>([]);
  const enabledOptions = options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !disabled && !option.disabled);
  const selectedIndex = enabledOptions.find(({ option }) => option.value === value)?.index;
  const tabStop = selectedIndex ?? enabledOptions[0]?.index;

  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
      return;
    event.preventDefault();
    if (!enabledOptions.length) return;
    const current = enabledOptions.findIndex((entry) => entry.index === index);
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabledOptions.length - 1
          : (current + (forward ? 1 : -1) + enabledOptions.length) % enabledOptions.length;
    const next = enabledOptions[target];
    controls.current[next.index]?.focus();
    if (next.option.value !== value) onChange(next.option.value);
  };

  return (
    <Grid container spacing={1} role="radiogroup" aria-label={label}>
      {options.map((option, index) => {
        const selected = value === option.value;
        const optionDisabled = disabled || option.disabled;
        return (
          <Grid key={option.value} size={{ xs: 12, sm: options.length === 3 ? 4 : 6 }}>
            <Paper
              variant="outlined"
              sx={(theme) => ({
                width: 1,
                height: 1,
                minHeight: 64,
                p: 1,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderColor: selected ? 'success.main' : 'divider',
                bgcolor: selected
                  ? theme.vars
                    ? varAlpha(theme.vars.palette.success.mainChannel, 0.08)
                    : alpha(theme.palette.success.main, 0.08)
                  : 'background.paper',
              })}
            >
              <CustomTooltip title={option.description} arrow placement="top">
                <Box component="span" sx={{ display: 'flex', width: 1, height: 1 }}>
                  <ButtonBase
                    ref={(control: HTMLButtonElement | null) => {
                      controls.current[index] = control;
                    }}
                    type="button"
                    role="radio"
                    aria-label={option.title}
                    aria-describedby={`${descriptionId}-${index}`}
                    aria-checked={selected}
                    disabled={optionDisabled}
                    tabIndex={tabStop === index ? 0 : -1}
                    onClick={() => {
                      if (!selected) onChange(option.value);
                    }}
                    onKeyDown={(event) => navigate(event, index)}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      minHeight: 44,
                      p: 1,
                      gap: 1,
                      borderRadius: 1,
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      '&.Mui-focusVisible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Iconify
                      icon={option.icon}
                      width={24}
                      sx={{ color: selected ? 'success.main' : 'text.secondary', flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                        {option.title}
                      </Typography>
                    </Box>
                    {selected && (
                      <Iconify
                        icon="mdi:check-circle"
                        width={22}
                        sx={{ color: 'success.main', flexShrink: 0 }}
                      />
                    )}
                  </ButtonBase>
                  <span id={`${descriptionId}-${index}`} hidden>
                    {option.description}
                  </span>
                </Box>
              </CustomTooltip>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
