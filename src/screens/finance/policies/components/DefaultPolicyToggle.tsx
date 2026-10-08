'use client';

import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Stack,
  Switch,
  Typography,
  IconButton,
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
  compact?: boolean;
  descriptionDisplay?: 'inline' | 'tooltip';
}

export default function DefaultPolicyToggle({
  policyLabel,
  status,
  checked,
  onChange,
  otherDefaultPolicyName,
  currentDefault = false,
  compact = false,
  descriptionDisplay = 'inline',
}: DefaultPolicyToggleProps) {
  const disabled = status !== 'Active' || currentDefault;
  const helpText = currentDefault
    ? 'Designate another Active policy as Default before removing this default or archiving this policy.'
    : status !== 'Active'
      ? 'Only an Active policy can be selected as the default.'
      : 'Replaces the current academic-year default.';
  const shortDescription = currentDefault
    ? 'Choose another default to change this.'
    : status !== 'Active'
      ? 'Activate this policy to make it the default.'
      : null;

  return (
    <Box sx={{ height: compact ? '100%' : undefined }}>
      <Card
        variant="outlined"
        aria-disabled={disabled}
        sx={{
          p: compact ? 0.5 : 2,
          height: compact ? '100%' : undefined,
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
          sx={{ m: 0, flex: 1, minWidth: 0 }}
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
                    {descriptionDisplay === 'tooltip' ? 'Default' : 'Default Selected'}
                  </Label>
                )}
              </Stack>
              {(descriptionDisplay === 'inline' || shortDescription) && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: compact ? 0 : 0.25, lineHeight: compact ? 1.25 : undefined }}
                >
                  {descriptionDisplay === 'inline' ? helpText : shortDescription}
                </Typography>
              )}
            </Box>
          }
        />
        {descriptionDisplay === 'tooltip' && (
          <CustomTooltip arrow placement="right" title={helpText}>
            <IconButton
              size="small"
              aria-label={`Default ${policyLabel.toLowerCase()} policy information`}
              onClick={(event) => event.stopPropagation()}
            >
              <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
            </IconButton>
          </CustomTooltip>
        )}
      </Card>

      {checked && otherDefaultPolicyName && (
        <FormHelperText sx={{ mx: 1.75, mt: 0.75 }}>
          {`“${otherDefaultPolicyName}” is currently the default and will be replaced when you save.`}
        </FormHelperText>
      )}
    </Box>
  );
}
