import { useMemo, useEffect } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import {
  getEmployeeAssignableRoles,
  shouldClearEmployeeRoleSelection,
} from '../employee-role-options';

interface RenderRoleProps {
  formik: any;
  disabled?: boolean;
}

export const RenderRole = ({ formik, disabled }: RenderRoleProps) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  const { employeeGroup, role: selectedRoleId } = formik.values;
  const { setFieldValue, touched, errors } = formik;
  const roleOptions = useMemo(
    () => getEmployeeAssignableRoles(data?.items ?? [], employeeGroup),
    [data?.items, employeeGroup]
  );
  const roleValue = roleOptions.find((item: any) => item.id === selectedRoleId) ?? null;

  useEffect(() => {
    if (
      isLoading ||
      !data?.items ||
      !shouldClearEmployeeRoleSelection(data.items, selectedRoleId, employeeGroup)
    ) {
      return;
    }

    setFieldValue('role', null);
  }, [data?.items, employeeGroup, isLoading, selectedRoleId, setFieldValue]);

  return (
    <ShakingTextField error={touched.role && Boolean(errors.role)}>
      <Autocomplete
        disabled={isLoading || !!disabled}
        options={roleOptions}
        value={roleValue}
        getOptionLabel={(option: any) => option?.name ?? ''}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Role *"
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: '200px' }}
            error={touched.role && Boolean(errors.role)}
            helperText={touched.role && errors.role}
          />
        )}
        onChange={(e, value) => {
          setFieldValue('role', value?.id || null);
        }}
      />
    </ShakingTextField>
  );
};
