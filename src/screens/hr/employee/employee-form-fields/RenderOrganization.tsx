import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetOrganizationQuery } from 'src/redux/oraganization/oraganization';

import ShakingTextField from 'src/components/shaking-text-field';

interface RenderOrganizationProps {
  formik: any;
  disabled?: boolean;
}

export const RenderOrganization = ({ formik, disabled }: RenderOrganizationProps) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationQuery,
  });

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const organizationOptions = useMemo(
    () => data?.items?.filter((org: Organization) => org.educationMediumId === medium?.id) || [],
    [data?.items, medium?.id]
  );

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
          disabled={isLoading || !!disabled}
          name="organization"
          size="small"
          onChange={formik.handleChange}
        >
          {isLoading ? (
            <MenuItem value="">
              <CircularProgress size={24} />
            </MenuItem>
          ) : organizationOptions.length ? (
            organizationOptions?.map((org: any) => (
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
