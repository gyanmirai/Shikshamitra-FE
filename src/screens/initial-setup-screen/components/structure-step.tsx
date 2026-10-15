import type { FormikProps } from 'formik';
import type { SetupDraft } from 'src/redux/initial-setup/types';

import { Grid, Stack } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { BoardNameField } from 'src/components/academic-setup/board-name-field';

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
            <BoardNameField
              label="Board"
              value={form.values.boardType ?? ''}
              onChange={(value) =>
                form.setFieldValue('boardType', value === '' ? null : Number(value))
              }
              customName={form.values.customBoardName ?? ''}
              onCustomNameChange={(value) => form.setFieldValue('customBoardName', value)}
              error={Boolean(form.touched.boardType && form.errors.boardType)}
              helperText={form.touched.boardType ? form.errors.boardType : undefined}
              customNameError={
                form.touched.customBoardName ? form.errors.customBoardName : undefined
              }
            />
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
        </Grid>
      </FormSectionCard>
    </Stack>
  );
}
