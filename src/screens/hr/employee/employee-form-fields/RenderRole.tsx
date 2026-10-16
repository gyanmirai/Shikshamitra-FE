import { useEffect } from 'react';
import { Button, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { useGetEmployeeAssignableRolesQuery } from 'src/redux/hr/employeeApi';

import {
  getEmployeeAssignableRoles,
  shouldClearEmployeeRoleSelection,
} from '../employee-role-options';

interface RenderRoleProps {
  formik: any;
  disabled?: boolean;
}

export const RenderRole = ({ formik, disabled }: RenderRoleProps) => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetEmployeeAssignableRolesQuery(undefined, { refetchOnMountOrArgChange: true });

  const { employeeGroup, role: selectedRoleId } = formik.values;
  const { setFieldValue, touched, errors } = formik;
  const roleOptions = isError ? [] : getEmployeeAssignableRoles(data?.items ?? [], employeeGroup);
  const roleValue = data?.items.find((item) => item.id === selectedRoleId) ?? null;
  const accessDenied = error && 'status' in error && error.status === 403;
  const queryError = isError
    ? accessDenied
      ? 'Staff role access is unavailable. Ask your administrator to review your Staff Directory permissions.'
      : 'Staff roles could not be loaded. Try again.'
    : undefined;
  const fieldError = Boolean(queryError || (touched.role && errors.role));

  useEffect(() => {
    if (
      isFetching ||
      isError ||
      !data?.items ||
      !shouldClearEmployeeRoleSelection(data.items, selectedRoleId, employeeGroup)
    ) {
      return;
    }

    setFieldValue('role', null);
  }, [data?.items, employeeGroup, isFetching, isError, selectedRoleId, setFieldValue]);

  return (
    <ShakingTextField error={fieldError}>
      <Autocomplete
        disabled={isLoading || isError || !!disabled}
        loading={isFetching}
        options={roleOptions}
        value={roleValue}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Role *"
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: '200px' }}
            error={fieldError}
            helperText={queryError || (touched.role && errors.role)}
          />
        )}
        onChange={(e, value) => {
          setFieldValue('role', value?.id || null);
        }}
      />
      {isError && (
        <Button size="small" onClick={() => refetch()} disabled={isFetching || !!disabled}>
          Retry staff roles
        </Button>
      )}
    </ShakingTextField>
  );
};
