'use client';

import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';

import { Box, Card, Stack, Switch, Typography, FormControlLabel, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

interface DefaultPolicyToggleProps {
  policyLabel: string;
  status: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  otherDefaultPolicyName?: string;
  showReplacementNotice?: boolean;
  currentDefault?: boolean;
  compact?: boolean;
  descriptionDisplay?: 'inline' | 'tooltip';
}

export default function DefaultPolicyToggle({
  policyLabel,
  status,
  checked,
  onChange,
  currentDefault = false,
  compact = false,
  descriptionDisplay = 'inline',
}: DefaultPolicyToggleProps) {
  const helpText = currentDefault
    ? 'Designate another Active policy as Default before removing this default or archiving this policy.'
    : status !== 'Active'
      ? 'Only an Active policy can be selected as the default.'
      : 'Replaces the current academic-year default.';

  const disabled = status !== 'Active' || currentDefault;

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
                  {descriptionDisplay === 'tooltip'
                    ? 'Set as default'
                    : `Default ${policyLabel} Policy`}
                </Typography>
                {checked && descriptionDisplay === 'inline' && (
                  <Label color="primary" sx={{ height: 18, fontSize: '0.65rem' }}>
                    Default Selected
                  </Label>
                )}
              </Stack>
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
    </Box>
  );
}
