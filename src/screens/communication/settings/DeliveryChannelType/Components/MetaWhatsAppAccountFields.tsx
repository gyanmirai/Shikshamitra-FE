import type { FormikProps } from 'formik';

import Grid from '@mui/material/Grid';
import { GlobalIcons } from 'src/utils/icons';
import TextField from '@mui/material/TextField';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import type { IProviderSettingFormValues } from '../type';

const accountFields = [
  { name: 'businessAccountId', label: 'Business account ID' },
  { name: 'phoneNumberId', label: 'Phone number ID' },
] as const;

export function MetaWhatsAppAccountFields({ formik, required }: {
  formik: FormikProps<IProviderSettingFormValues>;
  required: boolean;
}) {
  return (
    <FormSectionCard
      title="Meta WhatsApp Account"
      icon={GlobalIcons.sendNotification}
      descriptionTooltip="Copy both identifiers from the sender account in Meta WhatsApp Manager."
    >
      <Grid container spacing={1}>
        {accountFields.map(({ name, label }) => {
          const { error, touched } = formik.getFieldMeta(name);
          const showError = touched && Boolean(error);
          return (
            <Grid key={name} size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={showError}>
                <TextField
                  {...formik.getFieldProps<string>(name)}
                  fullWidth
                  size="small"
                  label={label}
                  required={required}
                  error={showError}
                  helperText={showError ? error : undefined}
                  slotProps={{
                    htmlInput: { inputMode: 'numeric', maxLength: 32 },
                    formHelperText: { 'aria-live': 'polite' },
                  }}
                />
              </ShakingTextField>
            </Grid>
          );
        })}
      </Grid>
    </FormSectionCard>
  );
}
