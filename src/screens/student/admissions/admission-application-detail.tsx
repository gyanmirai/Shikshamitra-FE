'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Chip, Alert, Stack, Button, Typography, CardContent } from '@mui/material';
import {
  useGetAdmissionApplicationQuery,
  useGetAdmissionApplicationFormQuery,
  useSubmitAdmissionApplicationMutation,
  useGetAdmissionApplicationWorkflowQuery,
  useUpdateAdmissionApplicationFormValuesMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import AdmissionRuntimeField from './admission-runtime-field';

const readValue = (value?: string | null) => {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : String(parsed ?? '');
  } catch {
    return value;
  }
};
const evaluateRule = (rule: unknown, values: Record<string, string>): boolean => {
  if (!rule || typeof rule !== 'object') return true;
  const expression = rule as {
    operator?: string;
    conditions?: unknown[];
    field?: string;
    value?: unknown;
  };
  if (expression.conditions) {
    const results = expression.conditions.map((condition) => evaluateRule(condition, values));
    return expression.operator?.toUpperCase() === 'ANY'
      ? results.some(Boolean)
      : results.every(Boolean);
  }
  const actual = expression.field ? (values[expression.field] ?? '') : '';
  const expected = String(expression.value ?? '');
  switch (expression.operator?.toLowerCase()) {
    case 'equals':
      return actual === expected || actual === expected.replace(/^"|"$/g, '');
    case 'notequals':
      return actual !== expected;
    case 'contains':
      return actual.includes(expected);
    case 'isempty':
      return !actual;
    case 'isnotempty':
      return Boolean(actual);
    default:
      return true;
  }
};
const isVisible = (ruleJson: string | null | undefined, values: Record<string, string>) => {
  if (!ruleJson) return true;
  try {
    return evaluateRule(JSON.parse(ruleJson), values);
  } catch {
    return false;
  }
};
export default function AdmissionApplicationDetailScreen() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const { data: application, isLoading: applicationLoading } = useGetAdmissionApplicationQuery(id);
  const { data: form, isLoading: formLoading } = useGetAdmissionApplicationFormQuery(id);
  const { data: workflow } = useGetAdmissionApplicationWorkflowQuery(id);
  const [updateValues, updateState] = useUpdateAdmissionApplicationFormValuesMutation();
  const [submit, submitState] = useSubmitAdmissionApplicationMutation();
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        (form?.values ?? []).map((item) => [item.fieldCode, readValue(item.valueJson)])
      ),
    [form]
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const currentValues = Object.keys(values).length ? values : initialValues;
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const save = async () => {
    try {
      await updateValues({
        id,
        concurrencyStamp: application.concurrencyStamp,
        values: Object.entries(currentValues).map(([fieldCode, valueJson]) => ({
          fieldCode,
          valueJson: JSON.stringify(valueJson),
        })),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Application saved' });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to save application' });
    }
  };
  const submitApplication = async () => {
    try {
      const result = await submit(id).unwrap();
      setErrors(result.validationErrors ?? []);
      setFieldErrors(result.fieldErrors ?? {});
      if (!result.validationErrors?.length)
        shikshaMitraToast.success({ message: 'Application submitted' });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to submit application' });
    }
  };
  if (applicationLoading || formLoading || !application || !form)
    return <Box sx={{ p: 3 }}>Loading application…</Box>;
  return (
    <Box>
      <CustomBreadcrumbs
        heading={application.applicationNumber}
        links={[
          { name: 'Students', href: '/student' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Applications', href: '/student/admissions/applications' },
          { name: application.applicationNumber },
        ]}
        sx={{ mb: 3 }}
      />
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">Application progress</Typography>
              <Chip label={['Draft', 'Submitted', 'Withdrawn', 'Rejected'][application.status]} />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto' }}>
              {(workflow?.stages ?? []).map((stage) => (
                <Chip
                  key={stage.id}
                  label={stage.name}
                  color={
                    stage.status === 1 ? 'primary' : stage.status === 2 ? 'success' : 'default'
                  }
                  variant={stage.status === 1 ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
        {errors.map((error) => (
          <Alert severity="error" key={error}>
            {error}
          </Alert>
        ))}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {form.definition.name} · v{form.formVersion}
            </Typography>
            <Stack spacing={3}>
              {form.definition.sections.map((section) => (
                <Box key={section.id}>
                  {!isVisible(section.visibilityRuleJson, currentValues) ? null : (
                    <>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {section.name}
                      </Typography>
                      <Stack spacing={2}>
                        {section.fields
                          .filter((field) => isVisible(field.visibilityRuleJson, currentValues))
                          .map((field) => (
                            <AdmissionRuntimeField
                              key={field.code}
                              field={field}
                              value={currentValues[field.code] ?? ''}
                              disabled={field.readOnly || application.status !== 0}
                              error={fieldErrors[field.code]}
                              onChange={(value) =>
                                setValues((previous) => ({ ...previous, [field.code]: value }))
                              }
                            />
                          ))}
                      </Stack>
                    </>
                  )}
                </Box>
              ))}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                disabled={updateState.isLoading || application.status !== 0}
                onClick={save}
              >
                Save draft
              </Button>
              <Button
                variant="contained"
                disabled={submitState.isLoading || application.status !== 0}
                onClick={submitApplication}
              >
                Submit application
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
