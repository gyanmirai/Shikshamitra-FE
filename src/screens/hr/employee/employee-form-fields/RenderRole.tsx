import { Skeleton } from '@mui/material';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

interface RenderRoleProps {
  formik: any;
  disabled?: boolean;
}

export const RenderRole = ({ formik, disabled }: RenderRoleProps) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  const roleValue = data?.items?.find((item: any) => item.id === formik.values.role) ?? null;

  return (
    <ShakingTextField error={formik.touched.role && Boolean(formik.errors.role)}>
      {isLoading ? (
        <Skeleton variant="rounded" height={40} sx={{ width: '100%', minWidth: '200px' }} />
      ) : (
        <PaginatedSearchSelect
          label="Role *"
          disabled={!!disabled}
          fetchOptions={async (searchQuery) => {
            const items = data?.items || [];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return {
              data: filtered.map((item: any) => ({
                label: item.name,
                id: item.id,
              })),
              hasMore: false,
            };
          }}
          value={
            roleValue
              ? {
                  label: roleValue.name || '',
                  id: roleValue.id,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(props, option: any) => (
            <li {...props} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            formik.setFieldValue('role', value?.id || null);
          }}
          error={formik.touched.role && Boolean(formik.errors.role)}
          helperText={formik.touched.role && (formik.errors.role as string)}
          size="small"
          noOptionsText="No results found"
          sx={{ width: '100%', minWidth: '200px' }}
        />
      )}
    </ShakingTextField>
  );
};
