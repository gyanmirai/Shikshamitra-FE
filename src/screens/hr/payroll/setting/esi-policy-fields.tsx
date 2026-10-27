import type { EsiManagementMode } from 'src/redux/hr/esi-policy-api';

import { useId } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Stack, Alert, Button, MenuItem, TextField, Typography } from '@mui/material';
import {
  effectiveEsiPolicyVersion,
  useGetEsiPolicyOptionsQuery,
} from 'src/redux/hr/esi-policy-api';

type EsiAssignment = { mode: EsiManagementMode; policyId: string; reason: string };
type Props = EsiAssignment & {
  month: string;
  disabled?: boolean;
  onChange: (assignment: EsiAssignment) => void;
};
export function EsiPolicyFields({ mode, policyId, reason, month, disabled, onChange }: Props) {
  const id = useId();
  const { data = [], isLoading, isError, refetch } = useGetEsiPolicyOptionsQuery();
  const policy = data.find((item) => item.id === policyId);
  const version = effectiveEsiPolicyVersion(policy, month);
  return (
    <Stack spacing={1.5}>
      <TextField
        select
        size="small"
        fullWidth
        label="ESIC management"
        value={mode}
        disabled={disabled}
        onChange={(event) =>
          onChange({ mode: event.target.value as EsiManagementMode, policyId: '', reason: '' })
        }
      >
        <MenuItem value="IN_PLATFORM">Calculate in ShikshaMitra</MenuItem>
        <MenuItem value="EXTERNAL">Handled outside ShikshaMitra</MenuItem>
      </TextField>
      {mode === 'IN_PLATFORM' ? (
        <Box>
          <ShakingTextField error={Boolean(policyId && !version && !isLoading && !isError)}>
            <TextField
              id={id}
              select
              required
              size="small"
              fullWidth
              label="ESIC policy"
              value={policyId}
              disabled={disabled || isLoading || isError}
              error={Boolean(policyId && !version && !isLoading && !isError)}
              helperText={
                isLoading
                  ? 'Loading policies...'
                  : isError
                    ? undefined
                    : policyId && !version
                      ? 'No effective version for this month.'
                      : !data.length
                        ? 'Create an ESIC policy in Statutory Schemes first.'
                        : undefined
              }
              onChange={(event) => onChange({ mode, policyId: event.target.value, reason: '' })}
            >
              {data
                .filter((item) => !item.isArchived || item.id === policyId)
                .map((item) => (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                    disabled={item.isArchived && item.id !== policyId}
                  >
                    {item.name}
                    {item.isArchived ? ' (archived)' : ''}
                  </MenuItem>
                ))}
            </TextField>
          </ShakingTextField>
          {version && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.75 }}
            >
              Version {version.version} · Employee {version.employeePercentage}% · School{' '}
              {version.employerPercentage}%
            </Typography>
          )}
          {isError && (
            <Alert
              severity="error"
              sx={{ mt: 1 }}
              action={<Button onClick={() => refetch()}>Retry</Button>}
            >
              ESIC policies could not be loaded.
            </Alert>
          )}
        </Box>
      ) : (
        <ShakingTextField>
          <TextField
            required
            size="small"
            fullWidth
            label="External management reason"
            value={reason}
            disabled={disabled}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            helperText="ESIC contributions will be omitted from payroll and payslips."
            onChange={(event) => onChange({ mode, policyId: '', reason: event.target.value })}
          />
        </ShakingTextField>
      )}
    </Stack>
  );
}
