import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

import type { FieldSettingsProps } from '../types/field-settings';

type Rule = { field: string; operator: string; value?: string };

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

function parseRule(value?: string | null): Rule | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Rule;
    return parsed?.field && parsed.operator ? parsed : null;
  } catch {
    return null;
  }
}

export function FieldVisibilitySettings({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const otherFields = formik.values.sections
    .flatMap((section) => section.fields)
    .filter((item) => item.code !== field.code);
  const rule = parseRule(field.visibilityRuleJson);
  const updateRule = (patch: Partial<Rule>) => {
    const next = {
      field: rule?.field ?? '',
      operator: rule?.operator ?? 'Equals',
      value: rule?.value ?? '',
      ...patch,
    };
    formik.setFieldValue(
      `${path}.visibilityRuleJson`,
      next.field ? JSON.stringify(next) : undefined
    );
  };
  return (
    <Stack spacing={1.5}>
      <CustomSelect
        size="small"
        label="Show field when"
        value={rule?.field ?? ''}
        options={[
          { value: '', label: 'Always visible' },
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
              value={rule.value ?? ''}
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
