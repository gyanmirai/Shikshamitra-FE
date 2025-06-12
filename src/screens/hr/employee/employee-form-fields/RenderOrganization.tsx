import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';

import { Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';

import ShakingTextField from 'src/components/shaking-text-field';

interface RenderOrganizationProps {
  formik: any;
  disabled?: boolean;
}

export const RenderOrganization = ({ formik, disabled }: RenderOrganizationProps) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  return (
    <ShakingTextField error={!!formik.errors.organization && formik.touched.organization}>
      <FormControl
        fullWidth
        disabled={!!disabled}
        error={!!formik.errors.organization && formik.touched.organization}
      >
        <InputLabel id="Roles-select-label" size="small">
          Organization *
        </InputLabel>
        <Select
          labelId="Roles-select-label"
          id="Roles-select"
          value={formik.values.organization}
          label="Organization *"
          disabled={!!disabled}
          name="organization"
          size="small"
          onChange={formik.handleChange}
        >
          {medium?.educationMediumStages.length ? (
            medium?.educationMediumStages?.map((org: any) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="">
              <em>No Organization Found</em>
            </MenuItem>
          )}
        </Select>
        {formik.touched.organization && formik.errors.organization && (
          <FormHelperText>{formik.errors.organization}</FormHelperText>
        )}
      </FormControl>
    </ShakingTextField>
  );
};
