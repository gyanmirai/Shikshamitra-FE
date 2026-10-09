import type { FormikProps } from 'formik';
import type { SetupDraft } from 'src/redux/initial-setup/types';

import { Grid, Stack, TextField } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import SetupField from './setup-field';

const groups = [
  {
    title: 'Institute details',
    icon: 'mdi:school-outline',
    help: 'These details appear in school records and communications.',
    fields: [
      ['instituteName', 'Institute name', 256],
      ['email', 'Institute email', 256],
      ['contactNumber', 'Contact number', 32],
    ],
  },
  {
    title: 'Address',
    icon: 'mdi:map-marker-outline',
    help: 'Use your institute’s official postal address.',
    fields: [
      ['address1', 'Address line 1', 256],
      ['address2', 'Address line 2', 256],
      ['address3', 'Address line 3', 256],
      ['city', 'City', 128],
      ['state', 'State', 128],
      ['country', 'Country', 128],
      ['postalCode', 'Postal code', 20],
    ],
  },
] as const;
export default function ProfileStep({
  form,
  schoolCode,
}: {
  form: FormikProps<SetupDraft>;
  schoolCode: string;
}) {
  return (
    <Stack spacing={2}>
      {groups.map((group, index) => (
        <FormSectionCard
          key={group.title}
          title={group.title}
          icon={group.icon}
          descriptionTooltip={group.help}
        >
          <Grid container spacing={1.5}>
            {index === 0 && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="School code"
                  value={schoolCode}
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Your login code. It cannot be changed here."
                />
              </Grid>
            )}
            {group.fields.map(([name, label, max]) => (
              <Grid key={name} size={{ xs: 12, sm: 6 }}>
                <SetupField
                  form={form}
                  name={`profile.${name}`}
                  label={label}
                  max={max}
                  optional={name === 'address2' || name === 'address3'}
                  type={name === 'email' ? 'email' : name === 'contactNumber' ? 'tel' : undefined}
                />
              </Grid>
            ))}
          </Grid>
        </FormSectionCard>
      ))}
    </Stack>
  );
}
