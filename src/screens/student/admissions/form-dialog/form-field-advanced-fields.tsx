import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';

import { FieldVisibilitySettings } from './components/field-visibility-settings';

import type { FieldSettingsProps } from './types/field-settings';

export function FormFieldAdvancedFields(props: FieldSettingsProps) {
  return (
    <FormSectionCard
      title="Visibility Conditions"
      icon={GlobalIcons.eye}
      descriptionTooltip="Show this field only when another answer meets a condition."
      sx={{ minWidth: 0 }}
    >
      <FieldVisibilitySettings {...props} />
    </FormSectionCard>
  );
}
