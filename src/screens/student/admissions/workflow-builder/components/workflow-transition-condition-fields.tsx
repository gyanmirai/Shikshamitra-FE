import type { FormikProps } from 'formik';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Button, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { WORKFLOW_CONDITION_OPERATORS } from '../workflow-transition-form';
import {
  getRouteOperators,
  ROUTE_OPERATOR_LABELS,
  type WorkflowConditionField,
} from '../workflow-condition-catalog';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

export function WorkflowTransitionConditionFields({
  formik,
  readOnly,
  fields = [],
}: {
  formik: FormikProps<WorkflowTransitionFormValues>;
  readOnly: boolean;
  fields?: WorkflowConditionField[];
}) {
  const field = fields.find((item) => item.value === formik.values.conditionField);
  const [advanced, setAdvanced] = useState(false);
  const useAdvanced = advanced || Boolean(formik.values.conditionField && !field);
  const operators = field
    ? getRouteOperators(field.fieldType)
    : WORKFLOW_CONDITION_OPERATORS.map((value) => ({ value, label: ROUTE_OPERATOR_LABELS[value] }));
  const needsValue = !['IsEmpty', 'IsNotEmpty'].includes(formik.values.conditionOperator);
  const choices = ['Equals', 'NotEquals'].includes(formik.values.conditionOperator)
    ? field?.choices
    : undefined;
  const fieldError = Boolean(formik.touched.conditionField && formik.errors.conditionField);
  const valueError = Boolean(formik.touched.conditionValue && formik.errors.conditionValue);
  return (
    <>
      <ShakingTextField
        error={Boolean(formik.touched.conditionField && formik.errors.conditionField)}
      >
        {useAdvanced ? (
          <TextField
            fullWidth
            size="small"
            label="Application field *"
            disabled={readOnly}
            {...formik.getFieldProps('conditionField')}
            error={Boolean(formik.touched.conditionField && formik.errors.conditionField)}
            helperText={formik.touched.conditionField && formik.errors.conditionField}
          />
        ) : (
          <CustomSelect
            fullWidth
            size="small"
            isSearch
            label="Application field *"
            disabled={readOnly}
            value={formik.values.conditionField}
            options={fields.map(({ value, label }) => ({ value, label }))}
            onBlur={() => formik.setFieldTouched('conditionField', true)}
            error={fieldError}
            helperText={
              fieldError
                ? formik.errors.conditionField
                : 'Choose an answer from a published Form stage on this path.'
            }
            onChange={(value) =>
              formik.setValues({
                ...formik.values,
                conditionField: String(value),
                conditionOperator: 'Equals',
                conditionValue: '',
              })
            }
          />
        )}
      </ShakingTextField>
      {!readOnly && (
        <Button
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => {
            if (useAdvanced)
              formik.setValues({
                ...formik.values,
                conditionField: '',
                conditionOperator: 'Equals',
                conditionValue: '',
              });
            setAdvanced(!useAdvanced);
          }}
        >
          {useAdvanced ? 'Choose a form answer' : 'Use a saved field code (advanced)'}
        </Button>
      )}
      {useAdvanced && (
        <Typography variant="caption" color="text.secondary">
          Use an existing runtime field code. Missing data can leave this path unmatched; test it
          before publishing.
        </Typography>
      )}
      <CustomSelect
        fullWidth
        size="small"
        label="Comparison *"
        disabled={readOnly}
        value={formik.values.conditionOperator}
        options={[
          ...operators.map((item) => ({
            value: item.value,
            label: ROUTE_OPERATOR_LABELS[item.value] ?? item.label,
          })),
          ...(!operators.some((item) => item.value === formik.values.conditionOperator)
            ? [
                {
                  value: formik.values.conditionOperator,
                  label: `${formik.values.conditionOperator} (saved comparison)`,
                },
              ]
            : []),
        ]}
        onChange={(value) => formik.setFieldValue('conditionOperator', String(value))}
      />
      {needsValue && (
        <ShakingTextField
          error={Boolean(formik.touched.conditionValue && formik.errors.conditionValue)}
        >
          {choices?.length &&
          (!formik.values.conditionValue ||
            choices.some((item) => item.value === formik.values.conditionValue)) ? (
            <CustomSelect
              fullWidth
              size="small"
              label="Value *"
              disabled={readOnly}
              value={formik.values.conditionValue}
              options={choices}
              error={valueError}
              helperText={valueError ? formik.errors.conditionValue : undefined}
              onBlur={() => formik.setFieldTouched('conditionValue', true)}
              onChange={(value) => formik.setFieldValue('conditionValue', String(value))}
            />
          ) : field?.fieldType === 2 &&
            !['In', 'NotIn'].includes(formik.values.conditionOperator) ? (
            <NumericFormatCustom
              fullWidth
              size="small"
              label="Value *"
              prefix=""
              thousandSeparator={false}
              allowNegative
              isAllowed={() => true}
              disabled={readOnly}
              value={formik.values.conditionValue}
              onValueChange={({ value }) => formik.setFieldValue('conditionValue', value)}
              onBlur={() => formik.setFieldTouched('conditionValue', true)}
              error={valueError}
              helperText={valueError ? formik.errors.conditionValue : undefined}
            />
          ) : (
            <TextField
              fullWidth
              size="small"
              label="Value *"
              disabled={readOnly}
              {...formik.getFieldProps('conditionValue')}
              error={Boolean(formik.touched.conditionValue && formik.errors.conditionValue)}
              helperText={
                (formik.touched.conditionValue && formik.errors.conditionValue) ||
                (['In', 'NotIn'].includes(formik.values.conditionOperator)
                  ? 'Separate the allowed values with commas.'
                  : undefined)
              }
            />
          )}
        </ShakingTextField>
      )}
    </>
  );
}
