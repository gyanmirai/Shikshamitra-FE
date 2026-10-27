import { useMemo } from 'react';
import { Button, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';

import { getEmployeeAssignableRoles } from '../employee/employee-role-options';

import type { EmployeeGroupSelection } from '../employee/employee-role-options';

const eligibilityHelp =
  'Security roles appear here when their audience is Employee, employee onboarding is enabled, and their employee group matches.';

export function useFinalizeRoles(
  open: boolean,
  employeeGroup: EmployeeGroupSelection,
  selectedRoleId: string
) {
  const query = useGetRolesQuery(undefined, {
    skip: !open,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const options = useMemo(
    () => (query.isError ? [] : getEmployeeAssignableRoles(query.data?.items ?? [], employeeGroup)),
    [query.data?.items, query.isError, employeeGroup]
  );
  const ready = open && query.isSuccess && !query.isFetching && !query.isError;
  const accessDenied = query.error && 'status' in query.error && query.error.status === 403;
  const queryError = query.isError
    ? accessDenied
      ? 'Roles could not be loaded. Ask an administrator to review your Security role access.'
      : 'Roles could not be loaded. Try again.'
    : undefined;
  const selectionError = !ready
    ? queryError || 'Wait for roles to finish loading.'
    : selectedRoleId && !options.some((role) => role.id === selectedRoleId)
      ? 'Choose an available role for this staff group.'
      : undefined;

  return { query, options, ready, queryError, selectionError };
}

export function FinalizeRoleField({
  lookup,
  value,
  error,
  disabled,
  onChange,
  onBlur,
}: {
  lookup: ReturnType<typeof useFinalizeRoles>;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const { query, options, ready, queryError } = lookup;
  const fieldError = queryError || error;
  const help = query.isFetching
    ? 'Loading roles from Security…'
    : ready && options.length === 0
      ? `No roles are available for this staff group. ${eligibilityHelp}`
      : eligibilityHelp;

  return (
    <Stack spacing={0.5}>
      <ShakingTextField error={Boolean(fieldError)}>
        <CustomSelect
          required
          fullWidth
          size="small"
          name="roleId"
          label="Role"
          options={options.map((role) => ({ value: role.id, label: role.name }))}
          value={options.some((role) => role.id === value) ? value : ''}
          disabled={disabled || !ready}
          onChange={(nextValue) => onChange(String(nextValue))}
          onBlur={onBlur}
          error={Boolean(fieldError)}
          helperText={fieldError || help}
          noOptionsMessage="No roles available for this staff group"
        />
      </ShakingTextField>
      <Button
        size="small"
        onClick={() => query.refetch()}
        disabled={disabled || query.isFetching || query.isUninitialized}
        sx={{ alignSelf: 'flex-start' }}
      >
        {query.isError ? 'Retry roles' : 'Refresh roles'}
      </Button>
    </Stack>
  );
}
