import type { FormikProps } from 'formik';

import { useGetPFQuery } from 'src/redux/PF/PFApi';
import { TextField, Autocomplete } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

interface RenderPfRulesProps {
  disabled?: boolean;
  formik: FormikProps<any>;
}

export const RenderPfRules = ({ disabled, formik }: RenderPfRulesProps) => {
  const { data: PFData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPFQuery,
  });

  return (
    <Autocomplete
      options={PFData?.items || []}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label="PF Rule"
          placeholder="Search PF Rule"
          size="small"
          fullWidth
          sx={{ width: '100%', minWidth: 'unset' }}
        />
      )}
      value={formik?.values?.pfRule || {}}
      onChange={(e, value) => {
        formik.setFieldValue('pfRule', value);
      }}
      disabled={isLoading || disabled}
    />
  );
};
