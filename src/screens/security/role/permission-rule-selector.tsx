import { varAlpha } from 'src/theme/styles';
import { Radio, RadioGroup, FormControlLabel } from '@mui/material';

import type { PermissionOverrideState } from './permission-catalogue';

export default function PermissionRuleSelector({
  id,
  label,
  rule,
  user,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  rule: PermissionOverrideState | 'mixed';
  user: boolean;
  disabled: boolean;
  onChange: (state: PermissionOverrideState) => void;
}) {
  const options: { value: PermissionOverrideState; label: string; accessibleLabel: string }[] = user
    ? [
        { value: 'inherit', label: 'Role', accessibleLabel: 'Follow role' },
        { value: 'allow', label: 'Allow', accessibleLabel: 'Allow' },
        { value: 'deny', label: 'Deny', accessibleLabel: 'Deny' },
      ]
    : [
        { value: 'allow', label: 'Allow', accessibleLabel: 'Allow' },
        { value: 'inherit', label: 'Revoke', accessibleLabel: 'Revoke' },
      ];
  return (
    <RadioGroup
      row
      name={id}
      value={rule}
      aria-label={label}
      aria-describedby={`${id}-result`}
      onChange={(_event, value) => {
        if (value !== rule) onChange(value as PermissionOverrideState);
      }}
      sx={{
        flexWrap: 'nowrap',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0.75,
        bgcolor: 'background.paper',
        p: 0.25,
        gap: 0.25,
        width: '100%',
        maxWidth: { xs: '100%', lg: user ? 190 : 140 },
      }}
    >
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          label={option.label}
          disabled={disabled}
          control={
            <Radio
              inputProps={{
                'aria-label': option.accessibleLabel,
                'aria-describedby': `${id}-result`,
              }}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                p: 0,
                '& .MuiSvgIcon-root': { display: 'none' },
              }}
            />
          }
          sx={(theme) => {
            const color =
              option.value === 'inherit' && user
                ? 'info'
                : option.value === 'deny' || (!user && option.value === 'inherit')
                  ? 'error'
                  : 'primary';
            return {
              position: 'relative',
              m: 0,
              flex: 1,
              minWidth: 0,
              minHeight: { xs: 44, lg: 32 },
              justifyContent: 'center',
              px: 0.75,
              borderRadius: 0.5,
              bgcolor:
                rule === option.value
                  ? varAlpha(theme.vars.palette[color].mainChannel, 0.12)
                  : undefined,
              '&:hover': {
                bgcolor:
                  rule === option.value
                    ? varAlpha(theme.vars.palette[color].mainChannel, 0.12)
                    : 'action.hover',
              },
              '& .MuiFormControlLabel-label': {
                fontSize: 12,
                whiteSpace: 'nowrap',
                fontWeight: rule === option.value ? 600 : 400,
                color: rule === option.value ? `${color}.dark` : 'text.primary',
              },
              '&:has(.Mui-focusVisible)': {
                outline: '2px solid',
                outlineColor: `${color}.dark`,
                outlineOffset: -1,
              },
              ...theme.applyStyles('dark', {
                '& .MuiFormControlLabel-label': {
                  color: rule === option.value ? `${color}.light` : 'text.primary',
                },
                '&:has(.Mui-focusVisible)': { outlineColor: `${color}.light` },
              }),
              '& .Mui-disabled': { color: 'text.disabled' },
            };
          }}
        />
      ))}
    </RadioGroup>
  );
}
