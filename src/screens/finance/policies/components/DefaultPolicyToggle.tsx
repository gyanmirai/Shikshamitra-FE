'use client';

import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  Stack,
  Switch,
  Typography,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

interface DefaultPolicyToggleProps {
  policyLabel: string;
  status: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  otherDefaultPolicyName?: string;
  currentDefault?: boolean;
}

export default function DefaultPolicyToggle({
  policyLabel,
  status,
  checked,
  onChange,
  otherDefaultPolicyName,
  currentDefault = false,
}: DefaultPolicyToggleProps) {
  const disabled = status !== 'Active' || currentDefault;

  return (
    <Box>
      <Card
        variant="outlined"
        aria-disabled={disabled}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 1.5,
          bgcolor: (theme) =>
            checked ? alpha(theme.palette.primary.main, 0.05) : 'background.neutral',
          borderColor: (theme) =>
            checked ? alpha(theme.palette.primary.main, 0.4) : theme.palette.divider,
          boxShadow: (theme) =>
            checked ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
          transition: 'all 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          '&:hover': disabled
            ? undefined
            : {
                borderColor: (theme) =>
                  checked ? 'primary.main' : alpha(theme.palette.text.primary, 0.2),
              },
        }}
        onClick={() => {
          if (!disabled) onChange(!checked);
        }}
      >
        <FormControlLabel
          disabled={disabled}
          sx={{ m: 0, width: '100%' }}
          onClick={(event) => event.stopPropagation()}
          control={
            <Switch
              size="small"
              checked={checked}
              onChange={(_event, value) => onChange(value)}
              color="primary"
              sx={{ mr: 1 }}
            />
          }
          label={
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                  Default {policyLabel} Policy
                </Typography>
                {checked && (
                  <Label color="primary" sx={{ height: 18, fontSize: '0.65rem' }}>
                    Default Selected
                  </Label>
                )}
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 0.25 }}
              >
                {currentDefault
                  ? 'Designate another Active policy as Default before removing this default or archiving this policy.'
                  : status !== 'Active'
                    ? 'Only an Active policy can be selected as the default.'
                    : 'Replaces the current academic-year default.'}
              </Typography>
            </Box>
          }
        />
      </Card>

      {checked && otherDefaultPolicyName && (
        <FormHelperText sx={{ mx: 1.75, mt: 0.75 }}>
          {`“${otherDefaultPolicyName}” is currently the default and will be replaced when you save.`}
        </FormHelperText>
      )}
    </Box>
  );
}
