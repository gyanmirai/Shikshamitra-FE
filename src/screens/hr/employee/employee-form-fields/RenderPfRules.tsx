import { TextField, Autocomplete } from '@mui/material';

interface RenderPfRulesProps {
  disabled?: boolean;
}

export const RenderPfRules = ({ disabled }: RenderPfRulesProps) => (
  <Autocomplete
    options={[]}
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
    onChange={(e, value) => {
      // formik.setFieldValue('examType', value?.id);
    }}
  />
);
