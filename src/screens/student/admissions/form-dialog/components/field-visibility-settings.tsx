import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

import {
  parseEditableAdmissionVisibilityRule,
  type EditableAdmissionVisibilityRule,
  serializeEditableAdmissionVisibilityRule,
} from '../field-visibility-rules';

import type { FieldSettingsProps } from '../types/field-settings';

const CONDITIONS = [
  ['Equals', 'is equal to'],
  ['NotEquals', 'is not equal to'],
  ['Contains', 'contains'],
  ['NotContains', 'does not contain'],
  ['StartsWith', 'starts with'],
  ['EndsWith', 'ends with'],
  ['GreaterThan', 'is greater than'],
  ['GreaterThanOrEqual', 'is greater than or equal to'],
  ['LessThan', 'is less than'],
  ['LessThanOrEqual', 'is less than or equal to'],
  ['In', 'is one of'],
  ['NotIn', 'is not one of'],
  ['IsEmpty', 'is empty'],
  ['IsNotEmpty', 'is not empty'],
].map(([value, label]) => ({ value, label }));

export function FieldVisibilitySettings({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const otherFields = formik.values.sections
    .flatMap((section) => section.fields)
    .filter((item) => item.code !== field.code);
  const parsedRule = parseEditableAdmissionVisibilityRule(field.visibilityRuleJson);
  const { rule } = parsedRule;
  const updateRule = (patch: Partial<EditableAdmissionVisibilityRule>) => {
    const next = {
      field: rule?.field ?? '',
      operator: rule?.operator ?? 'Equals',
      value: rule?.value ?? '',
      ...patch,
    };
    formik.setFieldValue(
      `${path}.visibilityRuleJson`,
      serializeEditableAdmissionVisibilityRule(next)
    );
  };
  if (parsedRule.error) {
    return (
      <Stack spacing={1.5}>
        <Alert severity="warning">{parsedRule.error} It has not been changed.</Alert>
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          label="Compatibility rule"
          value={field.visibilityRuleJson ?? ''}
          onChange={(event) =>
            formik.setFieldValue(`${path}.visibilityRuleJson`, event.target.value || undefined)
          }
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:refresh" />}
            disabled={!otherFields.length}
            onClick={() =>
              formik.setFieldValue(
                `${path}.visibilityRuleJson`,
                serializeEditableAdmissionVisibilityRule({
                  field: otherFields[0].code,
                  operator: 'Equals',
                  value: '',
                })
              )
            }
          >
            Replace with simple condition
          </Button>
          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => formik.setFieldValue(`${path}.visibilityRuleJson`, undefined)}
          >
            Clear rule
          </Button>
        </Stack>
      </Stack>
    );
  }

  const currentFieldIsMissing = Boolean(
    rule?.field && !otherFields.some((item) => item.code === rule.field)
  );
  return (
    <Stack spacing={1.5}>
      <CustomSelect
        size="small"
        label="Show field when"
        value={rule?.field ?? ''}
        options={[
          { value: '', label: 'Always visible' },
          ...(currentFieldIsMissing
            ? [{ value: rule?.field ?? '', label: `${rule?.field} (field not found)` }]
            : []),
          ...otherFields.map((item) => ({ value: item.code, label: item.label })),
        ]}
        onChange={(value) => updateRule({ field: String(value) })}
      />
      {rule?.field && (
        <>
          <CustomSelect
            size="small"
            label="Condition"
            value={rule.operator}
            options={CONDITIONS}
            onChange={(value) => updateRule({ operator: String(value) })}
          />
          {rule.operator !== 'IsEmpty' && rule.operator !== 'IsNotEmpty' && (
            <TextField
              fullWidth
              size="small"
              label="Answer to match"
              value={String(rule.value ?? '')}
              onChange={(event) => updateRule({ value: event.target.value })}
            />
          )}
          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => formik.setFieldValue(`${path}.visibilityRuleJson`, undefined)}
            sx={{ alignSelf: 'flex-start', minHeight: 44 }}
          >
            Clear condition
          </Button>
        </>
      )}
    </Stack>
  );
}
