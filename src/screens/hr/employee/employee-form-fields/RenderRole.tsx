import { TextField, Autocomplete } from '@mui/material';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

interface RenderRoleProps {
  formik: any;
  disabled?: boolean;
}

export const RenderRole = ({ formik, disabled }: RenderRoleProps) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  return (
    <ShakingTextField error={formik.touched.role && Boolean(formik.errors.role)}>
      <Autocomplete
        disabled={isLoading || !!disabled}
        options={data?.items || []}
        value={data?.items?.find((item: any) => item.id === formik.values.role) || undefined}
        getOptionLabel={(option: any) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Role *"
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: '200px' }}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={formik.touched.role && formik.errors.role}
          />
        )}
        onChange={(e, value) => {
          formik.setFieldValue('role', value?.id);
        }}
      />
    </ShakingTextField>
  );
};
