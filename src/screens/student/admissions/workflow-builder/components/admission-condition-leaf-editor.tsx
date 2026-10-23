import type { AdmissionConditionLeaf } from 'src/redux/student/admissions/admission-condition-rule';

import CustomSelect from 'src/components/custom-select';
import { Stack, TextField, Autocomplete } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import {
  CONDITION_OPERATORS,
  needsConditionValue,
} from 'src/redux/student/admissions/admission-condition-rule';

import { getTypedConditionOperators } from './admission-condition-fields';

import type { AdmissionConditionField } from './admission-condition-fields';

type Props = {
  value: AdmissionConditionLeaf;
  fields: AdmissionConditionField[];
  readOnly: boolean;
  onChange: (value: AdmissionConditionLeaf) => void;
  strictTypes?: boolean;
};

export function AdmissionConditionLeafEditor({
  value,
  fields,
  readOnly,
  onChange,
  strictTypes = false,
}: Props) {
  const selected = fields.find((item) => item.value === value.field) ?? value.field;
  const operators =
    strictTypes && typeof selected !== 'string'
      ? getTypedConditionOperators(selected.fieldType)
      : [...CONDITION_OPERATORS];
  const invalidOperator = !operators.some((item) => item.value === value.operator);
  return (
    <Stack spacing={1}>
      <Autocomplete
        freeSolo={!strictTypes}
        size="small"
        fullWidth
        disabled={readOnly}
        options={fields}
        value={selected}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
        isOptionEqualToValue={(option, other) => option.value === other.value}
        onChange={(_, option) =>
          onChange({ ...value, field: typeof option === 'string' ? option : (option?.value ?? '') })
        }
        onInputChange={(_, input, reason) => {
          if (reason === 'input' && !strictTypes) onChange({ ...value, field: input });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Applicant answer or fact"
            helperText={
              strictTypes
                ? 'Choose an answer from the selected published form.'
                : 'Select a published form field, or enter a known field such as application.PREVIOUS_SCHOOL.'
            }
          />
        )}
      />
      <CustomSelect
        size="small"
        fullWidth
        label="Comparison"
        disabled={readOnly}
        value={value.operator}
        options={
          invalidOperator
            ? [
                ...operators,
                {
                  value: value.operator,
                  label: `${value.operator} (not supported for this answer)`,
                },
              ]
            : operators
        }
        onChange={(operator) => onChange({ ...value, operator: String(operator) })}
      />
      {strictTypes && invalidOperator && (
        <StudentFeedback notificationKey="STU-0503" presentation="inline" severity="error">
          Choose a comparison supported by this answer type.
        </StudentFeedback>
      )}
      {needsConditionValue(value.operator) && (
        <TextField
          size="small"
          fullWidth
          label="Comparison value"
          type={
            strictTypes &&
            typeof selected !== 'string' &&
            selected.fieldType === 2 &&
            !['In', 'NotIn'].includes(value.operator)
              ? 'number'
              : 'text'
          }
          disabled={readOnly}
          value={Array.isArray(value.value) ? value.value.join(', ') : (value.value ?? '')}
          onChange={(event) => onChange({ ...value, value: event.target.value })}
          helperText={
            ['In', 'NotIn'].includes(value.operator)
              ? 'Separate accepted values with commas.'
              : undefined
          }
        />
      )}
    </Stack>
  );
}
