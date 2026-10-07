import Grid from '@mui/material/Grid';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { FieldVisibilitySettings } from './components/field-visibility-settings';

import type { FieldSettingsProps } from './types/field-settings';

export function FormFieldAdvancedFields(props: FieldSettingsProps) {
  return (
    <SectionCard
      title="Visibility conditions"
      paperProps={{ sx: { mb: 0, minWidth: 0 } }}
      gridProps={{ spacing: 1.5 }}
    >
      <Grid size={12}>
        <FieldVisibilitySettings {...props} />
      </Grid>
    </SectionCard>
  );
}
