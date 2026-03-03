import type { FormikProps } from 'formik';

import { Skeleton } from '@mui/material';
import { useGetPFQuery } from 'src/redux/PF/PFApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

interface RenderPfRulesProps {
  disabled?: boolean;
  formik: FormikProps<any>;
}

export const RenderPfRules = ({ disabled, formik }: RenderPfRulesProps) => {
  const { data: PFData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPFQuery,
  });

  const pfRuleValue = PFData?.items?.find((item: any) => item.id === formik.values.pfRule) || null;
  return (
    <ShakingTextField error={formik.touched.pfRule && Boolean(formik.errors.pfRule)}>
      {isLoading ? (
        <Skeleton variant="rounded" height={40} sx={{ width: '100%', minWidth: 'unset' }} />
      ) : (
        <PaginatedSearchSelect
          label="PF Rule"
          noOptionsText="No results found"
          disabled={!!disabled}
          fetchOptions={async (searchQuery) => {
            const items = PFData?.items || [];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return {
              data: filtered.map((option: any) => ({
                label: option.name,
                id: option.id,
              })),
              hasMore: false,
            };
          }}
          value={
            pfRuleValue
              ? {
                  label: pfRuleValue.name,
                  id: pfRuleValue.id,
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
            formik.setFieldValue('pfRule', value?.id || null);
          }}
          error={formik.touched.pfRule && Boolean(formik.errors.pfRule)}
          helperText={formik.touched.pfRule && (formik.errors.pfRule as string)}
          size="small"
          sx={{ width: '100%', minWidth: 'unset' }}
        />
      )}
    </ShakingTextField>
  );
};
