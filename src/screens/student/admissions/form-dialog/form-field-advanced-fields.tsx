import Stack from '@mui/material/Stack';

import { FieldJsonSettings } from './components/field-json-settings';
import { FieldSettingsGroup } from './components/field-settings-group';
import { FieldVisibilitySettings } from './components/field-visibility-settings';

import type { FieldSettingsProps } from './types/field-settings';

export function FormFieldAdvancedFields(props: FieldSettingsProps) {
  const { formik, sectionIndex, fieldIndex } = props;
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  return (
    <Stack spacing={1}>
      <FieldSettingsGroup
        title="Visibility conditions"
        description={
          field.visibilityRuleJson
            ? 'A visibility rule is configured.'
            : 'Always visible to applicants.'
        }
        defaultExpanded={Boolean(field.visibilityRuleJson)}
      >
        <FieldVisibilitySettings {...props} />
      </FieldSettingsGroup>
      <FieldSettingsGroup
        title="Advanced rules"
        description="Validation and conditional required rules in JSON."
      >
        <FieldJsonSettings {...props} />
      </FieldSettingsGroup>
    </Stack>
  );
}
