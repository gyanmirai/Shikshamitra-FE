import type { FormikProps } from 'formik';

import { Grid } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { PolicyField } from './PolicyField';

import type { PolicyValues } from './policy-form';

export function PolicyIdentity({
  formik,
  canManageGlobalPolicies,
  roleLocked = false,
}: {
  formik: FormikProps<PolicyValues>;
  canManageGlobalPolicies: boolean;
  roleLocked?: boolean;
}) {
  return (
    <FormSectionCard
      title="General Information"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Drafts do not change loans. The effective dates apply only after this version is published."
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <PolicyField formik={formik} name="name" label="Policy name" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={Boolean(formik.touched.role && formik.errors.role)}>
            <CustomSelect
              label="Member role"
              required={!roleLocked}
              fullWidth
              size="small"
              value={formik.values.role}
              options={[
                { id: 0, name: 'Student' },
                { id: 1, name: 'Staff' },
              ]}
              labelKey="name"
              valueKey="id"
              disabled={formik.isSubmitting || roleLocked}
              helperText={roleLocked ? 'Member role is fixed for this policy family.' : undefined}
              disabledValues={canManageGlobalPolicies ? [] : [1]}
              disabledLabel="Staff policies require tenant-wide scope."
              onChange={(value) => {
                formik.setFieldValue('role', Number(value));
                if (Number(value) === 1) {
                  formik.setFieldValue('educationMediumStageId', '');
                  formik.setFieldValue('standardId', '');
                }
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PolicyField
            formik={formik}
            name="priority"
            label="Priority"
            numeric
            helperText="0–1000. Higher priority wins only when scope specificity is equal."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PolicyField formik={formik} name="effectiveFrom" label="Effective from" date />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PolicyField
            formik={formik}
            name="effectiveTo"
            label="Effective through"
            date
            required={false}
          />
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
