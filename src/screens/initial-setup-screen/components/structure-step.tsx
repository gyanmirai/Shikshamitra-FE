import type { FormikProps } from 'formik';
import type { SetupDraft } from 'src/redux/initial-setup/types';

import { Grid, Stack, MenuItem } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import SetupField from './setup-field';

export default function StructureStep({ form }: { form: FormikProps<SetupDraft> }) {
  return (
    <Stack spacing={2}>
      <FormSectionCard
        title="Board, medium and stage"
        icon="mdi:book-open-outline"
        descriptionTooltip="Your classes will be grouped under this academic structure."
      >
        <Grid container spacing={1.5}>
          <Grid size={12}>
            <SetupField form={form} name="boardType" label="Board">
              <MenuItem value={0}>CBSE</MenuItem>
              <MenuItem value={1}>GSEB</MenuItem>
            </SetupField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SetupField form={form} name="medium" label="Medium" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SetupField form={form} name="stage" label="Stage" />
          </Grid>
        </Grid>
      </FormSectionCard>
      <FormSectionCard
        title="First class and division"
        icon="mdi:google-classroom"
        descriptionTooltip="Set up one class and division to establish your academic foundation. Additional classes can be added in the academic workspace."
      >
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SetupField form={form} name="className" label="Class name" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SetupField form={form} name="ageLowerLimit" label="Minimum age" type="number" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SetupField form={form} name="divisionName" label="Division name" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SetupField form={form} name="strength" label="Division capacity" type="number" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SetupField form={form} name="roomNumber" label="Room number" optional />
          </Grid>
        </Grid>
      </FormSectionCard>
    </Stack>
  );
}
