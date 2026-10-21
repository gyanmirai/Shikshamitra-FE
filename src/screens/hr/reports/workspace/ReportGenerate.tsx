import type { ReportDataset, ReportTemplate } from 'src/redux/hr/hrReportingWorkspaceApi';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { FormSectionCard } from 'src/components/form-section-card';
import { Chip, Alert, Stack, Button, Typography } from '@mui/material';
import { useCreateReportingRunMutation } from 'src/redux/hr/hrReportingWorkspaceApi';

import { ReportParameters } from './ReportParameters';
import {
  reportError,
  describeReportRules,
  defaultReportParameters,
} from '../reporting-workspace-utils';

export function ReportGenerate({
  template,
  dataset,
  backHref = hrReportPaths.choose,
}: {
  template: ReportTemplate;
  dataset?: ReportDataset;
  backHref?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [generate, { isLoading }] = useCreateReportingRunMutation();
  const form = useFormik({
    initialValues: defaultReportParameters(template.definition.defaultPeriod),
    validationSchema: Yup.object({ period: Yup.string().required('Choose a reporting period.') }),
    onSubmit: async (parameters) => {
      setError('');
      try {
        const run = await generate({
          templateId: template.id,
          revision: template.revision,
          parameters,
        }).unwrap();
        router.push(hrReportPaths.result(run.id));
      } catch (failure) {
        setError(reportError(failure));
      }
    },
  });
  const busy = isLoading || form.isSubmitting;
  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
      <Stack spacing={1}>
        <Typography variant="h6">{template.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {template.description}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={template.category} variant="outlined" />
          <Chip
            size="small"
            label={`${template.definition.columns.length} columns`}
            variant="outlined"
          />
          <Chip size="small" label={`Revision ${template.revision}`} variant="outlined" />
        </Stack>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <FormSectionCard
        icon="solar:settings-bold"
        title="Period and staff"
        descriptionTooltip="Choose the reporting period and staff for this generation. The template stays unchanged."
      >
        <ReportParameters
          design={template.definition}
          fields={dataset?.fields}
          value={form.values}
          onChange={(value) => {
            form.setValues(value);
          }}
          disabled={busy}
        />
      </FormSectionCard>
      {(template.definition.filters.conditions.length > 0 ||
        template.definition.filters.groups.length > 0) && (
        <Alert severity="info">
          Template rules: {describeReportRules(template.definition.filters, form.values, dataset)}.
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary">
        Generation captures a fixed result. Changing this selection does not change the template.
        Results and downloads remain available for 7 days.
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          disabled={busy || template.publishedRevision === 0}
          onClick={() => {
            form.submitForm();
          }}
        >
          {isLoading ? 'Generating…' : 'Generate report'}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          disabled={busy}
          component={RouterLink}
          href={backHref}
        >
          Back to templates
        </Button>
      </Stack>
    </Stack>
  );
}
