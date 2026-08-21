import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Grid,
  Stack,
  Button,
  MenuItem,
  Accordion,
  TextField,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  fieldIndex: number;
};

export function FormFieldAdvancedFields({ formik, sectionIndex, fieldIndex }: Props) {
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
      <Box>
        <Typography variant="subtitle2">Visibility</Typography>
        <Typography variant="caption" color="text.secondary">
          Show this field only when another response matches a condition.
        </Typography>
      </Box>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Show field when"
            value={rule?.field ?? ''}
            onChange={(event) => updateRule({ field: event.target.value })}
          >
            <MenuItem value="">Always visible</MenuItem>
            {otherFields.map((item) => (
              <MenuItem key={item.code} value={item.code}>
                {item.label} ({item.code})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Condition"
            disabled={!rule?.field}
            value={rule?.operator ?? 'Equals'}
            onChange={(event) => updateRule({ operator: event.target.value })}
          >
            {[
              'Equals',
              'NotEquals',
              'Contains',
              'NotContains',
              'StartsWith',
              'EndsWith',
              'GreaterThan',
              'GreaterThanOrEqual',
              'LessThan',
              'LessThanOrEqual',
              'In',
              'NotIn',
              'IsEmpty',
              'IsNotEmpty',
            ].map((operator) => (
              <MenuItem key={operator} value={operator}>
                {operator}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Value"
            disabled={!rule?.field || rule.operator === 'IsEmpty' || rule.operator === 'IsNotEmpty'}
            value={rule?.value ?? ''}
            onChange={(event) => updateRule({ value: event.target.value })}
          />
        </Grid>
        {rule?.field && (
          <Grid size={{ xs: 12 }}>
            <Button
              size="small"
              color="inherit"
              startIcon={<Iconify icon="mdi:close" />}
              onClick={() => formik.setFieldValue(`${path}.visibilityRuleJson`, undefined)}
            >
              Clear condition
            </Button>
          </Grid>
        )}
      </Grid>
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: '8px !important',
          '&::before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<Iconify icon="mdi:chevron-down" />}
          aria-controls={`advanced-rules-${field.id}`}
        >
          <Box>
            <Typography variant="subtitle2">Advanced rules</Typography>
            <Typography variant="caption" color="text.secondary">
              Optional JSON settings for complex validation.
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails id={`advanced-rules-${field.id}`}>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Required rule JSON"
              value={field.requiredRuleJson ?? ''}
              placeholder='{"field":"HAS_PREVIOUS_SCHOOL","operator":"Equals","value":true}'
              helperText="Optional controlled rule that makes this field required when true."
              onChange={(event) =>
                formik.setFieldValue(`${path}.requiredRuleJson`, event.target.value || undefined)
              }
            />
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Validation JSON"
              value={field.validationJson ?? ''}
              placeholder='{"minLength":2,"messages":{"minLength":"Enter at least 2 characters."}}'
              helperText="Optional controlled validation configuration."
              onChange={(event) =>
                formik.setFieldValue(`${path}.validationJson`, event.target.value || undefined)
              }
            />
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Visibility rule JSON"
              value={field.visibilityRuleJson ?? ''}
              placeholder='{"field":"Applicant.Age","operator":"GreaterThan","value":5}'
              helperText="Optional controlled rule; malformed rules fail closed."
              onChange={(event) =>
                formik.setFieldValue(`${path}.visibilityRuleJson`, event.target.value || undefined)
              }
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

type Rule = { field: string; operator: string; value?: string };

function parseRule(value?: string | null): Rule | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Rule;
    return parsed.field && parsed.operator ? parsed : null;
  } catch {
    return null;
  }
}
