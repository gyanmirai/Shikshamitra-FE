import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { capitalizeFirstLetter } from 'src/utils/input-format';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

import RoleColorField from './role-color-field';
import { employeeGroupOptions } from './role-form-values';
import { isReservedEmployeeOnboardingRoleName } from './employee-onboarding-role';

import type { RoleFormValues } from './role-form-values';

export default function RoleFormFields({
  formik,
  busy,
}: {
  formik: FormikProps<RoleFormValues>;
  busy: boolean;
}) {
  const nameError = Boolean((formik.touched.role || formik.submitCount > 0) && formik.errors.role);
  const groupError = Boolean(
    (formik.touched.employeeGroupAudience || formik.submitCount > 0) &&
    formik.errors.employeeGroupAudience
  );
  const colorError =
    formik.touched.color || formik.submitCount > 0 ? formik.errors.color : undefined;
  const reserved = isReservedEmployeeOnboardingRoleName(formik.values.role);

  return (
    <FormSectionCard
      title="Role Details"
      icon={GlobalIcons.lockIcon}
      descriptionTooltip="Set the role name, employee availability, and identifying color."
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
    >
      <ShakingTextField error={nameError}>
        <TextField
          required
          fullWidth
          size="small"
          autoFocus
          name="role"
          label="Role Name"
          value={formik.values.role}
          onChange={(event) =>
            formik.setFieldValue('role', capitalizeFirstLetter(event.target.value))
          }
          onBlur={formik.handleBlur}
          disabled={busy}
          error={nameError}
          helperText={nameError ? formik.errors.role : undefined}
        />
      </ShakingTextField>
      <ShakingTextField error={groupError}>
        <CustomSelect
          required
          fullWidth
          size="small"
          name="employeeGroupAudience"
          label="Employee Group Availability"
          options={employeeGroupOptions}
          value={formik.values.employeeGroupAudience}
          onChange={(value) => {
            formik.setFieldValue('employeeGroupAudience', value);
          }}
          onBlur={() => {
            formik.setFieldTouched('employeeGroupAudience', true);
          }}
          disabled={busy}
          error={groupError}
          helperText={
            groupError
              ? formik.errors.employeeGroupAudience
              : 'Controls which employee groups can select this role.'
          }
        />
      </ShakingTextField>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              name="employeeOnboardingAssignable"
              checked={!reserved && formik.values.employeeOnboardingAssignable}
              disabled={busy || reserved}
              onChange={formik.handleChange}
              inputProps={{ 'aria-describedby': 'role-onboarding-help' }}
            />
          }
          label="Available for employee onboarding"
        />
        <Typography
          id="role-onboarding-help"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', ml: 4 }}
        >
          Allows HR users to assign this role when creating an employee. Reserved system roles
          cannot be enabled.
        </Typography>
      </Box>
      <RoleColorField
        value={formik.values.color}
        error={colorError}
        disabled={busy}
        onChange={(value) => {
          formik.setFieldValue('color', value);
        }}
      />
    </FormSectionCard>
  );
}
