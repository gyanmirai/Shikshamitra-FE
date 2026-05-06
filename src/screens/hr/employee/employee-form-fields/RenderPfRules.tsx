import type { FormikProps } from 'formik';

import { useGetPFQuery } from 'src/redux/PF/PFApi';
import { TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

interface RenderPfRulesProps {
  disabled?: boolean;
  formik: FormikProps<any>;
}

export const RenderPfRules = ({ disabled, formik }: RenderPfRulesProps) => {
  const { data: PFData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPFQuery,
    params: {},
  });

  const pfRuleValue = PFData?.items?.find((item: any) => item.id === formik.values.pfRule) || null;
  return (
    <ShakingTextField error={formik.touched.pfRule && Boolean(formik.errors.pfRule)}>
      <Autocomplete
        options={PFData?.items || []}
        getOptionLabel={(option) => option?.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="PF Rule"
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: 'unset' }}
            error={formik.touched.pfRule && Boolean(formik.errors.pfRule)}
            helperText={formik.touched.pfRule && (formik.errors.pfRule as string)}
          />
        )}
        value={pfRuleValue}
        onChange={(e, value) => {
          formik.setFieldValue('pfRule', value?.id);
        }}
        disabled={isLoading || disabled}
      />
    </ShakingTextField>
  );
};
