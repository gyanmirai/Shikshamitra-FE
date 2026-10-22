'use client';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { capitalizeWords } from 'src/utils/input-format';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, InputAdornment } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import DefaultPolicyToggle from '../DefaultPolicyToggle';
import { SectionCard, CollectionInfoTip } from './CollectionCommon';

interface CollectionGeneralSectionProps {
  formik: any;
  otherDefaultPolicyName?: string;
  activeEdit?: boolean;
}

export default function CollectionGeneralSection({
  formik,
  otherDefaultPolicyName,
  activeEdit = false,
}: CollectionGeneralSectionProps) {
  return (
    <SectionCard
      subtitle="Configure policy identity, status, description, and academic year defaults."
      title="General Information"

      icon={GlobalIcons.notebook}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <ShakingTextField error={formik.touched.policyName && Boolean(formik.errors.policyName)}>
            <TextField
              fullWidth
              size="small"
              label="Policy name *"
              placeholder="e.g. Standard Term Collection Policy"
              name="policyName"
              value={formik.values.policyName}
              onChange={(event) => {
                formik.setFieldValue('policyName', capitalizeWords(event.target.value));
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.policyName && Boolean(formik.errors.policyName)}
              helperText={
                (formik.touched.policyName && (formik.errors.policyName as string)) || undefined
              }
              inputProps={{ maxLength: 100 }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <ShakingTextField error={formik.touched.status && Boolean(formik.errors.status)}>
            <CustomSelect<'label' | 'value' | 'caption', false>
              optionDescriptionKey="caption"
              fullWidth
              size="small"
              label="Status *"
              name="status"
              labelKey="label"
              valueKey="value"
              options={[
                {
                  value: 'Draft',
                  label: 'Draft',
                  caption: 'Save for review before making it active.',
                },
                { value: 'Active', label: 'Active', caption: 'Available for fee structures.' },
              ]}

              value={formik.values.status}
              onChange={(value) => {
                formik.setFieldValue('status', value);
                if (value !== 'Active') formik.setFieldValue('isDefault', false);
              }}
              onBlur={() => formik.setFieldTouched('status', true)}
              disabledValues={formik.initialValues.isDefault ? ['Draft'] : []}
              disabledLabel="Choose another default policy first"
              renderValue={(value) => (
                <Label color={value === 'Active' ? 'success' : 'warning'}>{String(value)}</Label>
              )}
              error={Boolean(formik.touched.status && formik.errors.status)}
              helperText={(formik.touched.status && formik.errors.status) || undefined}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 7 }}>
          <ShakingTextField
            error={formik.touched.description && Boolean(formik.errors.description)}
          >
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Description"
              placeholder="Describe the rules, purpose, or intended classes/structures for this policy..."
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={
                (formik.touched.description && (formik.errors.description as string)) || undefined
              }
              inputProps={{ maxLength: 500 }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <DefaultPolicyToggle
            compact
            descriptionDisplay="tooltip"
            policyLabel="Collection"
            status={formik.values.status}
            checked={Boolean(formik.values.isDefault)}
            currentDefault={Boolean(formik.initialValues.isDefault)}
            onChange={(checked) => formik.setFieldValue('isDefault', checked)}
            otherDefaultPolicyName={otherDefaultPolicyName}
            showReplacementNotice={false}
          />
        </Grid>

        {activeEdit && (
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={formik.touched.changeReason && Boolean(formik.errors.changeReason)}
            >
              <TextField
                fullWidth
                size="small"
                label="Change reason (optional)"
                name="changeReason"
                placeholder="Explain why this active collection policy is being changed..."
                value={formik.values.changeReason || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.changeReason && Boolean(formik.errors.changeReason)}
                helperText={
                  (formik.touched.changeReason && (formik.errors.changeReason as string)) ||
                  undefined
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CollectionInfoTip
                          label="Change reason"
                          title="This explanation is recorded in the policy version history and audit trail."
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                inputProps={{ maxLength: 500 }}
              />
            </ShakingTextField>
          </Grid>
        )}
      </Grid>
    </SectionCard>
  );
}
