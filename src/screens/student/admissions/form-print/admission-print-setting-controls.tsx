import type { ReactNode } from 'react';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useId, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomAccordion from 'src/components/custom-accordian';
import { FormSectionHeader } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import {
  Box,
  Paper,
  Stack,
  Switch,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

export function PrintSettingsResetButton({
  title,
  onReset,
  disabled = false,
}: {
  title: string;
  onReset: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip title={`Reset ${title} to defaults`}>
      <Box component="span" sx={{ display: 'inline-flex' }}>
        <IconButton
          size="small"
          aria-label={`Reset ${title} to defaults`}
          onClick={onReset}
          disabled={disabled}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <Iconify icon={GlobalIcons.resetIcon} />
        </IconButton>
      </Box>
    </Tooltip>
  );
}

export function PrintSettingsCards({ children }: { children: ReactNode }) {
  return <Stack spacing={1.5}>{children}</Stack>;
}

export function PrintSettingsCard({
  children,
  title,
  icon,
  action,
  descriptionTooltip,
  defaultExpanded = false,
}: {
  children: ReactNode;
  title: string;
  icon?: string;
  action?: ReactNode;
  descriptionTooltip?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const id = useId();
  const toggleLabel = `${expanded ? 'Collapse' : 'Expand'} ${title}`;
  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        minWidth: 0,
        borderRadius: 2,
        containerType: 'inline-size',
        '& > .MuiAccordion-root, & > .MuiAccordion-root.Mui-expanded': {
          m: 0,
          color: 'text.primary',
          borderRadius: 'inherit',
          bgcolor: 'transparent',
        },
        '& .MuiAccordionDetails-root': { px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 }, pt: 0 },
      }}
    >
      <CustomAccordion
        title={title}
        expanded={expanded}
        summary={
          <Box id={`${id}-header`} aria-controls={`${id}-content`} sx={{ p: { xs: 1.5, sm: 2 } }}>
            <FormSectionHeader
              title={title}
              icon={icon}
              descriptionTooltip={descriptionTooltip}
              action={
                <Stack direction="row" alignItems="center">
                  {action}
                  <Tooltip title={toggleLabel}>
                    <IconButton
                      type="button"
                      size="small"
                      aria-label={toggleLabel}
                      aria-expanded={expanded}
                      aria-controls={`${id}-content`}
                      onClick={() => setExpanded(!expanded)}
                    >
                      <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />
          </Box>
        }
        content={<Stack spacing={2}>{children}</Stack>}
      />
    </Paper>
  );
}

export function PrintSettingsGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        '@container (min-width: 340px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function PrintSettingSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
  disabledValues,
  disabledLabel,
  helperText,
  helperTooltip,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
  disabled?: boolean;
  disabledValues?: T[];
  disabledLabel?: string;
  helperText?: string;
  helperTooltip?: string;
}) {
  const id = useId();
  return (
    <CustomSelect
      size="small"
      fullWidth
      name={id}
      label={label}
      value={value}
      options={options.map(([option, text]) => ({ value: option, label: text }))}
      onChange={(next) => onChange(next as T)}
      disabled={disabled}
      disabledValues={disabledValues}
      disabledLabel={disabledLabel}
      helperText={
        helperTooltip ? (
          <InfoTooltipIcon title={helperTooltip} label={`${label} help`} />
        ) : (
          helperText
        )
      }
    />
  );
}

export function PrintSettingToggle({
  label,
  checked,
  onChange,
  disabled,
  descriptionId,
  helperTooltip,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  descriptionId?: string;
  helperTooltip?: string;
}) {
  const id = useId();
  if (helperTooltip) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.25} alignItems="center" sx={{ minWidth: 0 }}>
          <Typography id={id} variant="body2" color={disabled ? 'text.disabled' : 'text.primary'}>
            {label}
          </Typography>
          <InfoTooltipIcon title={helperTooltip} label={`${label} help`} />
        </Stack>
        <Switch
          size="small"
          checked={checked}
          disabled={disabled}
          slotProps={{ input: { 'aria-labelledby': id, 'aria-describedby': descriptionId } }}
          onChange={(_, value) => onChange(value)}
        />
      </Stack>
    );
  }
  return (
    <FormControlLabel
      label={label}
      disabled={disabled}
      sx={{
        m: 0,
        justifyContent: 'space-between',
        gap: 1,
        '& .MuiFormControlLabel-label': { flex: 1 },
      }}
      labelPlacement="start"
      control={
        <Switch
          size="small"
          checked={checked}
          slotProps={{ input: { 'aria-describedby': descriptionId } }}
          onChange={(_, value) => onChange(value)}
        />
      }
    />
  );
}

export function PrintSettingNumber({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const invalid = draft !== '' && Number(draft) < min;
  return (
    <NumericFormatCustom
      id={id}
      name={id}
      label={label}
      value={draft}
      size="small"
      fullWidth
      disabled={disabled}
      prefix=""
      suffix={unit ? ` ${unit}` : ''}
      thousandSeparator={false}
      decimalScale={0}
      roundToWholeRupees={false}
      allowNegative={false}
      error={invalid}
      helperText={
        invalid
          ? `Enter a value from ${min} to ${max}${unit ? ` ${unit}` : ''}.`
          : `${min}–${max}${unit ? ` ${unit}` : ''}`
      }
      isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= max}
      onValueChange={({ value: nextDraft, floatValue }, source) => {
        if (source.source !== 'event') return;
        setDraft(nextDraft);
        if (floatValue !== undefined && floatValue >= min && floatValue <= max)
          onChange(floatValue);
      }}
      onBlur={() => {
        const next = draft === '' ? value : Math.max(min, Math.min(max, Number(draft)));
        setDraft(String(next));
        if (next !== value) onChange(next);
      }}
    />
  );
}

export function PrintSettingText({
  label,
  value,
  onChange,
  multiline,
  maxLength = 128,
  disabled,
  helperText,
  helperTooltip,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
  disabled?: boolean;
  helperText?: string;
  helperTooltip?: string;
}) {
  const id = useId();
  return (
    <TextField
      id={id}
      name={id}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      size="small"
      fullWidth
      disabled={disabled}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      slotProps={{ htmlInput: { maxLength } }}
      helperText={
        helperTooltip ? (
          <InfoTooltipIcon title={helperTooltip} label={`${label} help`} />
        ) : (
          helperText
        )
      }
    />
  );
}
