'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  FormControlLabel,
} from '@mui/material';

const visible = (ruleJson: string | null | undefined, values: Record<string, string>) => {
  if (!ruleJson) return true;
  try {
    const rule = JSON.parse(ruleJson) as {
      operator?: string;
      field?: string;
      value?: unknown;
      conditions?: unknown[];
    };
    if (rule.conditions) {
      const results = rule.conditions.map((item) => visible(JSON.stringify(item), values));
      return rule.operator?.toUpperCase() === 'ANY'
        ? results.some(Boolean)
        : results.every(Boolean);
    }
    const actual = rule.field ? (values[rule.field] ?? '') : '';
    const expected = String(rule.value ?? '').replace(/^"|"$/g, '');
    return rule.operator?.toLowerCase() === 'equals'
      ? actual === expected
      : rule.operator?.toLowerCase() === 'isnotempty'
        ? Boolean(actual)
        : rule.operator?.toLowerCase() === 'isempty'
          ? !actual
          : true;
  } catch {
    return false;
  }
};
export default function AdmissionFormPreviewScreen() {
  const { id } = useParams<{ id: string }>();
  const { data: form, isLoading, isError } = useGetAdmissionFormQuery(id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const fields = useMemo(() => form?.sections.flatMap((section) => section.fields) ?? [], [form]);
  if (isLoading) return <Box sx={{ p: 3 }}>Loading preview…</Box>;
  if (isError || !form)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to load form preview.</Alert>
      </Box>
    );
  const errors = submitted
    ? form.sections
        .filter((section) => visible(section.visibilityRuleJson, values))
        .flatMap((section) => section.fields)
        .filter(
          (field) =>
            field.required && visible(field.visibilityRuleJson, values) && !values[field.code]
        )
        .map((field) => `${field.label} is required.`)
    : [];
  return (
    <Box>
      <CustomBreadcrumbs
        heading={`${form.name} preview`}
        links={[
          { name: 'Students', href: '/student' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Form Builder', href: '/student/admissions/settings/forms' },
          { name: 'Preview' },
        ]}
        sx={{ mb: 3 }}
      />
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {form.name} · v{form.version}
          </Typography>
          <Stack spacing={3}>
            {form.sections.map((section) =>
              !visible(section.visibilityRuleJson, values) ? null : (
                <Box key={section.id}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {section.name}
                  </Typography>
                  <Stack spacing={2}>
                    {section.fields
                      .filter((field) => visible(field.visibilityRuleJson, values))
                      .map((field) =>
                        field.fieldType === 9 ? (
                          <FormControlLabel
                            key={field.code}
                            control={
                              <Checkbox
                                checked={values[field.code] === 'true'}
                                onChange={(event) =>
                                  setValues((previous) => ({
                                    ...previous,
                                    [field.code]: String(event.target.checked),
                                  }))
                                }
                              />
                            }
                            label={field.label}
                          />
                        ) : (
                          <TextField
                            key={field.code}
                            select={field.fieldType === 6 || field.fieldType === 8}
                            multiline={field.fieldType === 1}
                            minRows={field.fieldType === 1 ? 3 : undefined}
                            type={
                              field.fieldType === 5
                                ? 'date'
                                : field.fieldType === 2
                                  ? 'number'
                                  : field.fieldType === 3
                                    ? 'email'
                                    : field.fieldType === 4
                                      ? 'tel'
                                      : 'text'
                            }
                            label={field.label}
                            required={field.required}
                            value={values[field.code] ?? ''}
                            helperText={field.helpText ?? undefined}
                            onChange={(event) =>
                              setValues((previous) => ({
                                ...previous,
                                [field.code]: event.target.value,
                              }))
                            }
                            InputLabelProps={field.fieldType === 5 ? { shrink: true } : undefined}
                          >
                            {field.fieldType === 6 || field.fieldType === 8 ? (
                              <MenuItem value="Yes">Yes</MenuItem>
                            ) : null}
                            {field.fieldType === 6 || field.fieldType === 8 ? (
                              <MenuItem value="No">No</MenuItem>
                            ) : null}
                          </TextField>
                        )
                      )}
                  </Stack>
                </Box>
              )
            )}
          </Stack>
          {errors.map((error) => (
            <Alert severity="error" key={error} sx={{ mt: 2 }}>
              {error}
            </Alert>
          ))}
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => setSubmitted(true)}>
            Validate preview
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
